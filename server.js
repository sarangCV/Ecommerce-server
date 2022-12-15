// Importing the libraries
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const colors = require("colors");

// Importing routes
const userRoute = require("./routes/userRouter");

// Importing dotenv
dotenv.config();

// Connnect to mongodb
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to db".bgCyan.bold)
);

// GLOBAL MIDDLEWARES
// Rate limiter - used to block from making too many requests / attacks
const limiter = rateLimit({
  max: 100,
  windowMsL: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(cors());

// routes
app.use("/api/users", userRoute);

// Server running
app.listen(process.env.PORT || 8000, () =>
  console.log(`server up and running on PORT${process.env.PORT}`.bgMagenta.bold)
);
