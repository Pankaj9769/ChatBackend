const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { fetchUsers } = require("../controller/user-controller");

const userRouter = express.Router();

userRouter.route("/users").get(authMiddleware, fetchUsers);

module.exports = { userRouter };
