require("dotenv").config();

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function buildAdminUrl() {
  // connect to the default 'postgres' db for CREATE DATABASE
  const { PGHOST, PGPORT, PGUSER, PGPASSWORD } = process.env;
  if (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD) return null;
  return `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(
    PGPASSWORD,
  )}@${PGHOST}:${PGPORT}/postgres`;
}

async function ensureDatabaseExists(dbName) {
  const adminUrl = buildAdminUrl();
  if (!adminUrl) {
    throw new Error(
      "Missing PGHOST/PGPORT/PGUSER/PGPASSWORD in .env (needed to create test database).",
    );
  }

  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    const exists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (exists.rows.length === 0) {
      await admin.query(`CREATE DATABASE ${dbName};`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } finally {
    await admin.end();
  }
}

async function runSchemaOn(url) {
  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(schemaSql);
    console.log("Schema applied.");
  } finally {
    await client.end();
  }
}

async function main() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error("Missing TEST_DATABASE_URL in .env");
  }

  // create db if needed (nodehomework_test)
  const testDbName = new URL(process.env.TEST_DATABASE_URL).pathname.replace(
    /^\//,
    "",
  );
  await ensureDatabaseExists(testDbName);
  await runSchemaOn(process.env.TEST_DATABASE_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

