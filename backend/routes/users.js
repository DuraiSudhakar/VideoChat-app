// routes/users.js
import express from "express";
import {userLogin, userSignup} from "../controller/userControllers.js"

const router = express.Router();

router.post("/login", userLogin);

// CREATE a new user
router.post("/signup", userSignup);

export default router;
