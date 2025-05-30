
import jwt from "jsonwebtoken";
import pool from "./components/db.js";

export const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authorization.split(" ")[1]; 

    try {
        
        const { email } = jwt.verify(token, process.env.SECRET);

        const result = await pool.query(
            "SELECT email FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            throw new Error("User not found or invalid token.");
        }
        next(); 
    } catch (err) {
        console.error("Authentication error:", err.message); 
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        res.status(401).json({
            error: err.message || "Request is not authorized",
        });
    }
};
