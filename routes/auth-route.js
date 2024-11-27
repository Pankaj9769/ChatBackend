const express = require("express");
const { register, login, user } = require("../controller/auth-controller");
const { validateRegisterUser } = require("../middleware/validateRegisterUser");
const { authMiddleware } = require("../middleware/authMiddleware");

const authRouter = express.Router();

authRouter.route("/register").post(validateRegisterUser, register);
authRouter.route("/login").post(login);
authRouter.route("/user").get(authMiddleware, user);

module.exports = { authRouter };
