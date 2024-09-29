require("dotenv").config();
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();

//security packages
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");

const morgan = require("morgan");
const connectDB = require("./db/connect");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const notFoundHandler = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
require("express-async-errors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_PUBLIC_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_API_KEY,
});

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 12 * 60 * 1000,
    max: 50,
  })
);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(cors());

app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("hello api");
});

app.get("/api/v1", (req, res) => {
  // console.log(req.cookies);
  console.log(req.signedCookies);
  res.send("hello api 2");
});

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`app is listening to port ${port}`));
  } catch (error) {
    console.log(error);
  }
};
start();
