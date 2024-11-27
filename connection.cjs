const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(process.env.URI)
    .then(() => {
      console.log("Connection Successfull");
    })
    .catch((err) => {
      console.log(`Error: ${err}`);
    });
};

module.exports = connect;
