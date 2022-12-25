const crypto = require("crypto");
const User = require("../models/User");
const Image = require("../models/ImageModel");
const bcrypt = require("bcrypt");
const {
  registerValidation,
  loginValidation,
} = require("../validations/validation");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const sendEmail = require("../utils/email");
const { OAuth2Client } = require("google-auth-library");

// Google client ID for OAuthClient
const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID);

// Signup
exports.signup = async (req, res) => {
  console.log("Signup router hit", req.body);

  // Validate before creation
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the user already in the database
  const user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("Email already exists");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create new user
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    // console.log("Router hit");
    const savedUser = await newUser.save();
    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Login
exports.login = async (req, res) => {
  console.log("Login router hit");
  const { email, password } = req.body;
  // Validate before login
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the user already in the database
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(400).json("Email or password is wrong..!");

  // Check if password is correct
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 24 * 3600000),
  });
  res.header("auth-token", token).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Login with google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  console.log("GOOGLE LOGIN BODY", token);

  client
    .verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_AUTH_CLIENT_ID,
    })
    .then((response) => {
      console.log("VERIFIED RESPONSE::", response);
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        // Checking if the user existing in the database
        User.findOne({ email }).exec(async (err, user) => {
          if (err) {
            return res.status(400).json("Something went wrong!");
          } else {
            if (user) {
              console.log("USER EXISTS");
              // Create and assign a token
              const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY, {
                expiresIn: "7d",
              });
              res.header("auth-token", token).json({
                status: "success",
                token,
                data: {
                  user,
                },
              });
            }
            // If no exisiting user then creating a new user in the database with google data
            else {
              console.log("USER DOESNT EXISTS");
              // creating a random password to be saved in the mongoDb data base
              const password = email + process.env.TOKEN_KEY;
              // Hash password
              const salt = await bcrypt.genSalt(10);
              const hashPassword = await bcrypt.hash(password, salt);
              const newUser = new User({ name, email, password: hashPassword });
              const user = await newUser.save();
              // Create and assign a token
              const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY, {
                expiresIn: "7d",
              });
              res.header("auth-token", token).json({
                status: "success",
                token,
                data: {
                  user,
                },
              });
            }
          }
        });
      }
    });
};

// Upload profile picture
exports.uploadProfileImage = async (req, res) => {
  // console.log("USER FROM UPLOAD PROFILE PIC::", req.file.filename);
  // req.user = req.file.buffer;
  const newImage = new Image({
    name: req.body.name,
    img: {
      data: fs.readFileSync("./public/data/uploads/" + req.file.filename),
      contentType: "image/png",
    },
  });
  try {
    // const savedImage = await newImage.save();
    const user = await User.findById(req.params.id);
    // console.log("LOG FROM UPLOAD IMAGE", user);
    // const profilePic = user.createProfilePicture(newImage.img.data);
    user.img = newImage.img.data;
    const savedUser = await user.save();
    // console.log("SAVED IMAGE FROM API", savedUser);
    res.status(201).json({ status: "success", savedUser });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// Get profile picture
exports.getProfileImage = async (req, res) => {
  console.log("FROM GET IMAGE API::", req.params.id);
  try {
    const user = await User.findById(req.params.id);
    // const userImage = user.images;
    // console.log("FROM GET IMAGE API::", userImage);
    res.status(201).json({ status: "success", user });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  console.log("FROM FORGOT PASSW::", req.get("host"));
  // Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("There is no user with email address");
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  user.save();

  // Send it user's email
  // const resetURL = `${req.protocol}://localhost:3000/users/resetPassword/${resetToken}`;
  const resetURL = `https://password-reset-ui.onrender.com/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}. \n If you don't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      url: resetURL,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(400).send(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).send("Token is invalid or has expired");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  user.password = hashPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update changedPasswordAt property for the user

  // Log the user in, send JWT
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY);
  res.status(200).json({
    status: "success",
    token,
  });
};
