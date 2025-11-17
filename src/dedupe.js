const fs = require("fs");
/**
 * Decide whether the incoming record should replace the existing one.
 * Rule: newest date wins; if tie, later record in list wins.
 */
function resolveDuplicate(existing, incoming) {
  const existingDate = new Date(existing.entryDate);
  const newDate = new Date(incoming.entryDate);

  if (newDate > existingDate) return true;
  if (newDate.getTime() === existingDate.getTime()) return true;
  return false;
}

/**
 * Apply replacement: update the deduped list and maps with the incoming record.
 */
function applyReplacement(dedupedLeads, existing, incoming, seenIds, seenEmails) {
  const pos = dedupedLeads.indexOf(existing);
  if (pos !== -1) dedupedLeads[pos] = incoming;

  seenIds.set(incoming._id, incoming);
  seenEmails.set(incoming.email, incoming);
}

/**
 * Compute field-level differences between two records.
 */
function logDifferences(existing, incoming) {
  const changes = [];
  Object.keys(incoming).forEach((key) => {
    if (existing[key] !== incoming[key]) {
      changes.push({ field: key, from: existing[key], to: incoming[key] });
    }
  });
  return changes;
}

/**
 * Deduplicate records by _id and email.
 */
function deduplicate(records) {
  const seenIds = new Map();
  const seenEmails = new Map();
  const dedupedLeads = [];
  const changeLog = [];

  for (const record of records) {
    const { _id, email } = record;
    let duplicateKey = null;
    let existing;

    if (seenIds.has(_id)) {
      duplicateKey = `_id:${_id}`;
      existing = seenIds.get(_id);
    } else if (seenEmails.has(email)) {
      duplicateKey = `email:${email}`;
      existing = seenEmails.get(email);
    }

    if (!existing) {
      dedupedLeads.push(record);
      seenIds.set(_id, record);
      seenEmails.set(email, record);
      continue;
    }

    if (resolveDuplicate(existing, record)) {
      const changes = logDifferences(existing, record);
      changeLog.push({
        duplicateKey,
        sourceRecord: existing,
        outputRecord: record,
        changes,
      });

      applyReplacement(dedupedLeads, existing, record, seenIds, seenEmails);
    } else {
      changeLog.push({
        duplicateKey,
        sourceRecord: record,
        outputRecord: existing,
        changes: [],
      });
    }
  }

  return { dedupedLeads, changeLog };
}

module.exports = { deduplicate, resolveDuplicate, applyReplacement, logDifferences };