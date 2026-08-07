// this file has all the logic for reading faculty info off BRACU's own website.
// nothing in here talks to the running app or its users - it's only ever called by scrape.js

const cheerio = require("cheerio");
const Faculty = require("./Faculty");
const { tagFromText } = require("./tagging");

const BASE_URL = "https://cse.sds.bracu.ac.bd";
const LIST_URL = `${BASE_URL}/thesis/supervising/list`;
const USER_AGENT = "AcademicResearchTracker/1.0 (educational project; https://github.com)";
const DELAY_MS = 400; // small pause between requests so we're not hammering their server

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// downloads a page's HTML as plain text
async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.text();
}

// splits "Dr. Badhan Das [NBD]" into { name: "Dr. Badhan Das", shortTag: "NBD" }
function splitNameTag(rawName) {
  const match = rawName.trim().match(/^(.*?)\s*\[([A-Za-z0-9.]+)\]\s*$/);
  if (!match) {
    return { name: rawName.trim(), shortTag: null };
  }
  return { name: match[1].trim(), shortTag: match[2].trim() };
}

// reads the thesis/supervising/list page and pulls out one entry per faculty card
function parseListPage(html) {
  const $ = cheerio.load(html);
  const entries = [];

  $("[wire\\:initial-data]").each((_, el) => {
    const raw = $(el).attr("wire:initial-data");
    let wireData;
    try {
      wireData = JSON.parse(raw);
    } catch {
      return;
    }

    if (wireData?.fingerprint?.name !== "web.components.faculty-card") return;

    const memoData = wireData?.serverMemo?.data || {};
    const { facId, isSupervise = true, isalumni = false } = memoData;
    if (typeof facId !== "number") return;

    const card = $(el).find(".fac-card").first();
    if (card.length === 0) return;

    const profileHref = card.find('a[href*="/faculty_profile/"]').first().attr("href") || "";
    const profileUrl = profileHref ? new URL(profileHref, BASE_URL).href : "";

    const photoSrc = card.find("img.fac-card-img").first().attr("src") || "";
    const photoUrl = photoSrc ? new URL(photoSrc, BASE_URL).href : "";

    const levelRaw = card.find(".absolute.top-0.right-0").first().text().trim();

    const paragraphs = card.find("p");
    const rawName = paragraphs.eq(0).text() || "";
    const acceptingText = paragraphs.eq(1).text().trim();
    const position = paragraphs.eq(2).text().trim();
    const email = paragraphs.eq(3).text().trim();

    const { name, shortTag } = splitNameTag(rawName);

    entries.push({
      facId,
      name,
      shortTag,
      profileUrl,
      photoUrl,
      position,
      email,
      accepting: !!acceptingText && !acceptingText.toLowerCase().startsWith("not"),
      levelRaw,
      supervisesUndergrad: /U/.test(levelRaw),
      supervisesGrad: /P/.test(levelRaw),
      isSupervise: !!isSupervise,
      isAlumni: !!isalumni,
    });
  });

  return entries;
}

// reads the "As:" row of the profile's Thesis table, e.g. ["Supervisor", "Co-supervisor"].
// the site shows a plain <p> when there's only one role, and a <ul><li> list when there's more than one
function parseRoles($) {
  const labelTd = $("td p")
    .filter((_, el) => $(el).text().trim().toLowerCase() === "as:")
    .first()
    .closest("td");

  if (labelTd.length === 0) return [];

  const valueTd = labelTd.next("td");
  const listItems = valueTd.find("li")
    .toArray()
    .map((el) => $(el).text().trim())
    .filter((text) => text.length > 0);

  if (listItems.length > 0) return listItems;

  const plainText = valueTd.find("p").first().text().trim();
  return plainText ? [plainText] : [];
}

// opens one faculty member's profile page and reads their research interest text and thesis role(s)
async function fetchAndParseProfile(profileUrl) {
  const html = await fetchHtml(profileUrl);
  const $ = cheerio.load(html);

  const roles = parseRoles($);

  // find the "Research Interest" heading, then the text box that comes right after it.
  // not every profile has this section, so bail out with empty text if we can't find it
  const allEls = $("*").toArray();
  const headingIndex = allEls.findIndex(
    (el) => $(el).is("h4") && $(el).text().trim().toLowerCase() === "research interest"
  );

  if (headingIndex === -1) {
    return { researchInterestText: "", roles };
  }

  const contentEl = allEls
    .slice(headingIndex + 1)
    .find((el) => $(el).hasClass("ck-content"));

  if (!contentEl) {
    return { researchInterestText: "", roles };
  }

  // join up the paragraphs/headings/list items into one block of text, skipping empty ones
  const blocks = $(contentEl)
    .find("p, h1, h2, h3, h4, h5, h6, li")
    .toArray()
    .map((el) => $(el).text().replace(/ /g, " ").trim())
    .filter((text) => text.length > 0);

  return { researchInterestText: blocks.join("\n").trim(), roles };
}

// the main scrape job: reads the list page, then visits every faculty member's profile page one
// by one and saves everything to the database.
//
// onProgress (optional) is called after every faculty member with { done, total, name }, so the
// "Update data" button on the website can show how far along we are. the command line version
// (scrape.js) doesn't pass one and just reads the console output instead
async function scrapeAll({ onProgress } = {}) {
  const listHtml = await fetchHtml(LIST_URL);
  const entries = parseListPage(listHtml);
  console.log(`Found ${entries.length} faculty cards`);
  onProgress?.({ done: 0, total: entries.length, name: "" });

  let upserted = 0;
  let skippedAlumni = 0;
  let errors = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // don't save alumni - this page is only meant to show current faculty
    if (entry.isAlumni) {
      console.log(`[${i + 1}/${entries.length}] Skipping alumni: ${entry.name}`);
      skippedAlumni++;
      onProgress?.({ done: i + 1, total: entries.length, name: entry.name });
      continue;
    }

    await sleep(DELAY_MS);

    let researchInterestText = "";
    let tags = [];
    let roles = [];
    try {
      const profile = await fetchAndParseProfile(entry.profileUrl);
      researchInterestText = profile.researchInterestText;
      roles = profile.roles;
      tags = tagFromText(researchInterestText);
    } catch (err) {
      // if one person's profile page fails to load, log it and move on instead of stopping the whole scrape
      console.warn(`[${i + 1}/${entries.length}] Failed to fetch profile for ${entry.name}: ${err.message}`);
      errors++;
    }

    // save this faculty member, updating them if they're already in the database (never duplicate)
    await Faculty.findOneAndUpdate(
      { facId: entry.facId },
      { ...entry, researchInterestText, tags, roles, lastScrapedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    upserted++;
    console.log(`[${i + 1}/${entries.length}] Upserted facId=${entry.facId} ${entry.name} — tags: ${tags.join(", ") || "none"}`);
    onProgress?.({ done: i + 1, total: entries.length, name: entry.name });
  }

  return { total: entries.length, upserted, skippedAlumni, errors };
}

module.exports = { scrapeAll, parseListPage, fetchAndParseProfile, LIST_URL, BASE_URL };
