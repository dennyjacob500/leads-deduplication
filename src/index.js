#!/usr/bin/env node
const fs = require("fs");
const { deduplicate } = require("./dedupe");

function main() {
  if (process.argv.length !== 3) {
    console.error("Usage: node src/index.js path/to/leads.json");
    process.exit(1);
  }

  const infile = process.argv[2];
  const data = JSON.parse(fs.readFileSync(infile, "utf-8"));
  const records = data.leads;

  const { dedupedLeads, changeLog } = deduplicate(records);

  console.log("=== Deduplicated Records ===");
  console.log(JSON.stringify({ leads: dedupedLeads }, null, 2));

  console.log("\n=== Audit Trail ===");
  console.log(JSON.stringify(changeLog, null, 2));
}

if (require.main === module) {
  main();
}