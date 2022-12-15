const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
  // user: {
  //   type: String,
  //   required,
  // },
});

module.exports = mongoose.model("Image", imageSchema);
