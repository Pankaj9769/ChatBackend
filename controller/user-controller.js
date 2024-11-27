const { userModel } = require("../model/userModel");

const fetchUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    console.log("All Users-> " + users);
    res.json({ users });
  } catch (err) {
    res.status(500).send("Failed to fetch users");
  }
};
module.exports = { fetchUsers };
