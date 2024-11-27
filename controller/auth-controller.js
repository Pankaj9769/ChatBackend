const bcrypt = require("bcryptjs");
const { userModel } = require("../model/userModel");

const register = async (req, res) => {
  console.log("1");
  const userInfo = req.body;

  let salt = bcrypt.genSaltSync(10);
  let hashedPassword = bcrypt.hashSync(userInfo.password, salt);

  const user = {
    name: userInfo.name,
    email: userInfo.email,
    password: hashedPassword,
  };

  const doesExist = await userModel.findOne({ email: userInfo.email });
  if (doesExist) {
    return res
      .status(400)
      .json({ response: "Email already registered, Please Login!" });
  }

  try {
    const response = await userModel.create(user);
    res.status(201).json({ response: "Registered Successfully" });
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
};

const login = async (req, res) => {
  console.log("2");
  const userInfo = req.body;
  try {
    const user = await userModel.findOne({ email: userInfo.email });
    if (!user) {
      return res.status(400).json({ response: "Invalid Credential/s" });
    }

    let correctPass = user.validatePassword(userInfo.password);

    if (!correctPass) {
      return res.status(400).json({ response: "Invalid Credential/s" });
    }

    const token = await user.generateToken();
    res.status(200).json({ user, token });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ response: `Internal Server Error:${error}` });
  }
};

const user = async (req, res) => {
  console.log("3");
  try {
    const user = req.user;
    // console.log("USER->", user);
    const findUser = await userModel.findOne({ email: user.email });
    // console.log(findUser);

    res.status(200).json({ findUser });
  } catch (error) {
    res.status(400).json(`Error: ${error}`);
  }
};

const addToWishlist = async (req, res) => {
  console.log("4");
  const user = req.user;
  const id = req.params.id;

  const findUser = await userModel.findOne({ email: user.email });
  findUser.wishlist.push(id);
  // console.log(findUser);
  const response = await userModel.findOneAndUpdate(
    { email: user.email },
    { wishlist: findUser.wishlist },
    { new: true }
  );

  res.json({ response });
};

const removeFromWishlist = async (req, res) => {
  console.log("5");
  const user = req.user;
  const id = req.params.id;

  const findUser = await userModel.findOne({ email: user.email });
  findUser.wishlist = findUser.wishlist.filter((product) => product != id);
  // console.log(findUser);
  const response = await userModel.findOneAndUpdate(
    { email: user.email },
    { wishlist: findUser.wishlist },
    { new: true }
  );

  res.json({ response });
};

const addInBag = async (req, res) => {
  console.log("6");
  const user = req.user;
  const id = req.params.id;
  // console.log("reached");
  const findUser = await userModel.findOne({ email: user.email });
  findUser.bag.push(id);
  try {
    const response = await userModel.findOneAndUpdate(
      { email: user.email },
      { bag: findUser.bag },
      { new: true }
    );
    // console.log("THE UPDATED BAG->", response.bag);
    res.json({ response });
  } catch (error) {
    res.json({ response: error });
  }
};

const removeFromBag = async (req, res) => {
  console.log("7");
  const user = req.user;
  const id = req.params.id;

  const findUser = await userModel.findOne({ email: user.email });
  findUser.bag = findUser.bag.filter((product) => product != id);
  // console.log(findUser);
  const response = await userModel.findOneAndUpdate(
    { email: user.email },
    { bag: findUser.bag },
    { new: true }
  );

  res.status(200).json({ response });
};

const removeAllFromBag = async (req, res) => {
  console.log("8");
  const user = req.user;
  try {
    const response = await userModel.findOneAndUpdate(
      { email: user.email },
      { $set: { bag: [] } },
      { new: true }
    );

    if (response) {
      console.log("resoosee:" + response);
      res.status(200).json({ message: "Bag cleared successfully", response });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log("resoosee:" + response);
    res.status(400).json({ error: error.message });
  }
};

const addAddress = async (req, res) => {
  console.log("9");
  const user = req.user;
  const address = req.body;

  try {
    const findUser = await userModel.findOne({ email: user.email });
    findUser.address.push(address);
    const response = await userModel.findOneAndUpdate(
      { email: user.email },
      {
        address: findUser.address,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ response });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const removeAddress = async (req, res) => {
  console.log("10");
  const user = req.user;
  const id = req.params.id;

  try {
    const findUser = await userModel.findOne({ email: user.email });

    findUser.address = findUser.address.filter((address, index) => {
      return Number(index) !== Number(id);
    });
    // console.log("After->" + findUser.address.length);
    const response = await userModel.findOneAndUpdate(
      { email: user.email },
      {
        address: findUser.address,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ response });
  } catch (error) {
    res.status(400).json({ error });
  }
};

const addOrder = async (req, res) => {
  console.log("11");
  const user = req.user;
  const body = req.body;
  // console.log(body);
  const findUser = await userModel.findOne({ email: user.email });

  body.forEach((element) => {
    findUser.orders.push(element);
  });
  const response = await userModel.findOneAndUpdate(
    { email: user.email },
    {
      orders: findUser.orders,
    },
    { new: true }
  );
  res.status(200).json({ response });
};
const removeOrder = () => {};

module.exports = {
  register,
  login,
  user,
  addToWishlist,
  removeFromWishlist,
  addInBag,
  removeFromBag,
  addAddress,
  removeAddress,
  addOrder,
  removeOrder,
  removeAllFromBag,
};
