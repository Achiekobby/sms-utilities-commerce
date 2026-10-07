function score(entry, query) {
  const label = entry.label.toLowerCase()

  if (label.startsWith(query)) return 3
  if (label.includes(query)) return 2
  if (`${entry.group} ${entry.keywords}`.toLowerCase().includes(query)) return 1
  return 0
}

// Best matches first. Pages that exist are listed before ones still to come.
export function searchEntries(entries, rawQuery) {
  const query = rawQuery.trim().toLowerCase()
  const available = (entry) => (entry.to ? 1 : 0)

  if (!query) return [...entries].sort((a, b) => available(b) - available(a))

  return entries
    .map((entry) => ({ entry, score: score(entry, query) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || available(b.entry) - available(a.entry))
    .map((match) => match.entry)
}
