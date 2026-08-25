const escapeRegExp = require("../utils/escapeRegExp");

// our fixed list of CS research areas and the keywords that count as a match for each one.
// the scraper checks every faculty member's research interest text against these keywords
// to decide which tags to give them
const TAG_KEYWORDS = {
  "Machine Learning": [
    "machine learning", "deep learning", "neural network", "reinforcement learning",
    "supervised learning", "unsupervised learning", "generative model", "transfer learning",
  ],
  "Natural Language Processing": [
    "natural language processing", "nlp", "text mining", "sentiment analysis",
    "language model", "speech recognition", "machine translation", "bangla", "bengali",
  ],
  "Computer Vision": [
    "computer vision", "image processing", "object detection", "image segmentation",
    "facial recognition", "video analysis", "pattern recognition", "ocr",
  ],
  "Data Science": [
    "data science", "data mining", "big data", "data analytics",
    "predictive modeling", "data visualization", "recommender system", "recommendation system",
  ],
  "Security": [
    "security", "cryptography", "cybersecurity", "network security",
    "malware", "intrusion detection", "privacy", "blockchain", "authentication",
  ],
  "Networking": [
    "networking", "wireless network", "computer network", "5g",
    "mobile network", "network protocol", "software-defined network", "sdn", "vanet", "manet",
  ],
  "Bioinformatics": [
    "bioinformatics", "computational biology", "genomics", "protein",
    "biomedical", "healthcare informatics", "medical imaging", "drug discovery",
  ],
  "Human-Computer Interaction": [
    "human-computer interaction", "hci", "usability", "user experience",
    "accessibility", "assistive technology",
  ],
  "Robotics": [
    "robotics", "robot", "autonomous vehicle", "unmanned",
    "drone", "motion planning", "swarm robotics",
  ],
  "Software Engineering": [
    "software engineering", "software testing", "requirements engineering",
    "software architecture", "devops", "agile", "empirical software engineering",
  ],
  "Theory & Algorithms": [
    "algorithm", "graph theory", "computational complexity", "combinatorics",
    "optimization", "approximation algorithm", "theoretical computer science", "discrete mathematics",
  ],
  "IoT & Embedded Systems": [
    "internet of things", "iot", "embedded system", "sensor network",
    "wearable", "smart home", "edge computing", "fpga", "vlsi",
  ],
};

const ALL_TAGS = Object.keys(TAG_KEYWORDS);

// checks a piece of text against every tag's keyword list and returns the tags that matched.
// looks for whole words only, so e.g. "iot" won't match inside "biotechnology"
function tagFromText(text) {
  if (!text) return [];

  const lower = text.toLowerCase();
  const matched = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    const hasMatch = keywords.some((keyword) => {
      const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
      return pattern.test(lower);
    });
    if (hasMatch) matched.push(tag);
  }

  return matched.sort();
}

module.exports = { TAG_KEYWORDS, ALL_TAGS, tagFromText };
