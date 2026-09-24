const fs = require("fs");
const path = require("path");
const pool = require("../db");

async function runSqlFile(filename) {
  const sql = fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
  await pool.query(sql);
  console.log(`Applied ${filename}`);
}

async function main() {
  try {
    await runSqlFile("schema-upgraded.sql");
    await runSqlFile("migrations/add-missing-columns.sql");
    console.log("Database initialization complete.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Database initialization failed:", error.message);
  process.exitCode = 1;
});
