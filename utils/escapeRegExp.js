// makes a plain string safe to drop into a RegExp, so special characters aren't treated as regex syntax
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = escapeRegExp;
