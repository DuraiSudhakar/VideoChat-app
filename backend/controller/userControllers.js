import bcrypt from "bcrypt";
import validator from "validator";
import pool from "../components/db.js"; // Import your database pool
import jwt from "jsonwebtoken";


const secret = process.env.SECRET;
function createToken(_id) {
    return jwt.sign({ _id }, secret, { expiresIn: "3d" });
}

export const userSignup = async (req, res)=>{
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Enter all fields" });
    }
    try {
        const exist = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (!exist.rows.length===0) {
            return res.status(400).json({ error: "User already exist" }); 
        }
        if (!validator.isEmail(email)) {
            throw Error("Invalid email");
        }
        if (!validator.isStrongPassword(password)) {
            throw Error("Enter a strong Password");
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const result = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
        );
        const token = createToken(email)
        res.status(201).json({user: result.rows[0].email}, token);
    } catch (err) {
        console.error("Error creating user:", err);
        if (err.code === "23505") {
            // PostgreSQL error code for unique violation
            return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

export const userLogin = async (req, res) => {
    const { email, password } = req.body; // Use email directly
    try {
        if (!email || !password) {
            throw Error("Enter all Fields");
        }
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const match = await bcrypt.compare(password, user.rows[0].password);
        if (!match) {
            return res.status(404).json({ error: "Invalid password" });
        }
        const token = createToken(email);
        res.status(200).json({user: user.rows[0].email, token});
    } catch (err) {
        console.error("Error fetching user by email:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
