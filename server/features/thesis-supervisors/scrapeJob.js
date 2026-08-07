// keeps track of the one scrape that's allowed to run at a time.
//
// a full scrape visits every faculty profile page one by one, so it takes a couple of minutes -
// far too long to make the browser sit and wait for a reply. so the route starts the job here and
// answers immediately, and the page keeps asking /scrape/status to find out how it's going.
//
// this lives in memory, which means it resets if the server restarts. that's fine: the scraped
// data itself is safe in MongoDB, it's only the "how far along are we" info that's lost.

const { scrapeAll } = require("./scraper");

const COOLDOWN_MS = 60 * 1000; // don't let people re-scrape BRACU's site over and over

function emptyState() {
  return {
    running: false,
    startedAt: null,
    finishedAt: null,
    done: 0, // how many faculty we've saved so far
    total: 0, // how many we found on the list page (0 until we've read it)
    current: "", // the name we're working on right now
    summary: null, // what scrapeAll() returned, once it's finished
    error: null, // set instead of summary if the whole scrape blew up
  };
}

let state = emptyState();

function getStatus() {
  return { ...state };
}

// returns "started", or a reason we refused to start
function start() {
  if (state.running) return "running";

  if (state.finishedAt && Date.now() - state.finishedAt.getTime() < COOLDOWN_MS) {
    return "cooldown";
  }

  state = { ...emptyState(), running: true, startedAt: new Date() };

  // deliberately not awaited - the request that called start() returns straight away and this
  // carries on in the background, updating `state` as it goes
  scrapeAll({
    onProgress: ({ done, total, name }) => {
      state.done = done;
      state.total = total;
      state.current = name;
    },
  })
    .then((summary) => {
      state.summary = summary;
      console.log("Scrape complete:", summary);
    })
    .catch((err) => {
      state.error = err.message;
      console.error("Scrape failed:", err);
    })
    .finally(() => {
      state.running = false;
      state.finishedAt = new Date();
      state.current = "";
    });

  return "started";
}

module.exports = { start, getStatus, COOLDOWN_MS };
