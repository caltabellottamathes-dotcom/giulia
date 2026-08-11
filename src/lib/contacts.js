/**
 * Shared contact helpers — alphabetical sort + A–Z grouping + initials.
 * Used by the People widget, the module-panel preview and the People page
 * so all three stay in sync.
 */

export const initials = (name = "") =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const sortKey = (name = "") => {
  const k = (name || "").trim().replace(/^["'!@#0-9]+/, "").trim();
  return k.toLowerCase();
};

export const sortContacts = (list = []) =>
  [...list].sort((a, b) =>
    sortKey(a.name).localeCompare(sortKey(b.name), "nl", { sensitivity: "base" })
  );

export const groupByLetter = (list = []) => {
  const sorted = sortContacts(list);
  const groups = {};
  for (const c of sorted) {
    const ch = (c.name || "").trim().replace(/[^A-Za-zÀ-ÿ]/g, "")[0] || "?";
    const letter = /[A-Za-zÀ-ÿ]/.test(ch) ? ch.toUpperCase() : "#";
    (groups[letter] = groups[letter] || []).push(c);
  }
  return Object.keys(groups)
    .sort((l1, l2) => (l1 === "#" ? 1 : l2 === "#" ? -1 : l1.localeCompare(l2)))
    .map((letter) => ({ letter, items: groups[letter] }));
};