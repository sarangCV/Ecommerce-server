const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/userController");
const auth = require("../middleware/verifyToken");
const resetToken = require("../middleware/verifyResetToken");

// Multer initialzer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/data/uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

// ROUTES
// Auth routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/googleLogin", userController.googleLogin);

// User routes
router.post(
  "/profile/upload/:id",
  // auth,
  upload.single("image"),
  userController.uploadProfileImage
);
router.get("/profile/:id", userController.getProfileImage);
router.post("/forgotPassword", userController.forgotPassword);
router.patch("/resetPassword/:token", resetToken, userController.resetPassword);

module.exports = router;
