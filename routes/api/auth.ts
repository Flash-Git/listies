import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { check } from "express-validator";
import config from "config";

import handleErrors from "./handleErrors";

import auth from "../../middleware/auth";

// Models
import User from "../../models/User";

// @route   GET api/auth
// @desc    Get logged in user
// @access  PRIVATE
router.get("/", auth, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

// @route   POST api/auth
// @desc    Auth user & get token
// @access  PUBLIC
router.post(
  "/",
  [
    check("email", "Please enter your email address").isEmail(),
    check("password", "Please enter your password").exists(),
  ],
  async (req, res) => {
    if (handleErrors(req, res)) return;
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).send({ msg: "Invalid Credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).send({ msg: "Invalid Credentials" });

      if (!user.verified) return res.status(400).send({ msg: "Email has not been verified" });

      // Token
      const payload = {
        user: {
          id: user.id,
        },
      };

      const jwtSecret: Secret =
        process.env.NODE_ENV == "production" ? process.env.JWT_SECRET : config.get("jwtSecret");

      jwt.sign(
        payload,
        jwtSecret,
        {
          // 14 days
          expiresIn: 1209600,
        },
        (e, token) => {
          if (e) throw e;
          res.json({ token });
        }
      );
    } catch (e) {
      console.error(e.message);
      res.status(500).send({ msg: "Server Error" });
    }
  }
);

export default router;
