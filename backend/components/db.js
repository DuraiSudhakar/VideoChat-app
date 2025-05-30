// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1); // Exit process if client connection is lost
});

export default pool;
