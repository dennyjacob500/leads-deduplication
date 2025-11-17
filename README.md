# Adobe Leads Deduplication (Node.js)

Command-line tool to de-duplicate JSON leads by `_id` and `email`.

## Features
- Enforces uniqueness on `_id` and `email`
- Prefers newest `entryDate`; tie-breaks by record order
- Detailed audit trail (source, output, field diffs)

## Usage
```bash
npm install
npm run start

```Test
npm test