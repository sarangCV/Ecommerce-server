const mongoose = require("mongoose");
const Image = require("../models/ImageModel");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    reqired: true,
    min: 6,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
    select: false,
  },
  // images: Array,
  img: {
    type: String,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  date: {
    type: Date,
    default: Date.now,
  },
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// UserSchema.pre("save", async function (next) {
//   console.log("PRE SAVE MIDDLEWARE");
//   const imagesPromises = this.images.map(
//     async (id) => await Image.findById(id)
//   );
//   this.images = await Promise.all(imagesPromises);
//   next();
// });

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// UserSchema.methods.createProfilePicture = function (data) {
//   // console.log("PROFILE INSTANT FUNC::", data);
//   this.img = data;
// };

module.exports = mongoose.model("User", UserSchema);
