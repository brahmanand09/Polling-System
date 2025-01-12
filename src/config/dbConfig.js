import pg from "pg";
import env from "dotenv";

env.config({ path: "../.env" });

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const createTables = async () => {
  try {
    await db.query(`
CREATE TABLE IF NOT EXISTS polls (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);

    await db.query(`
 CREATE TABLE IF NOT EXISTS  poll_options (
    id SERIAL PRIMARY KEY,
    poll_id INT REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    votes_count INT DEFAULT 0
);
    `);

    await db.query(`
CREATE TABLE IF NOT EXISTS  votes (
    id SERIAL PRIMARY KEY,
    poll_option_id INT REFERENCES poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);

    console.log("All tables created successfully!");
  } catch (err) {
    console.error(err);
  }
};

db.connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Connection error", err.stack));

export { db, createTables };
