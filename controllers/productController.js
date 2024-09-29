const mongoose = require("mongoose");
const Product = require("../models/product");
const Review = require("../models/review");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const {
  CustomAPIError,
  UnauthenticatedError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../errors");

const createProduct = async (req, res, next) => {
  try {
    req.body.userCreatingTheProduct = req.user.id;
    // if (!req.files) {
    //   throw new BadRequestError("no image file found");
    // }
    // const productImage = req.files.image;
    // console.log(productImage);
    // if (!productImage.mimetype.startsWith("image")) {
    //   throw new BadRequestError("Please upload an image file");
    // }
    // const cloudImage = await cloudinary.uploader.upload(
    //   req.files.image.tempFilePath,
    //   { use_filename: true, folder: "sonnatrendy product images" }
    // );
    // fs.unlinkSync(req.files.image.tempFilePath);
    // req.body.image = cloudImage.secure_url;
    // req.body.cloudImagePublicId = cloudImage.public_id;

    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
  } catch (error) {
    next(error);
  }
};
const getAllProducts = async (req, res) => {
  const product = await Product.find({});
  res.status(StatusCodes.OK).json({ product, count: product.length });
};

const getSingleProduct = async (req, res, next) => {
  //   console.log(req.params);
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("reviews");
    if (!product) {
      throw new NotFoundError(`No product with the id ${id}`);
    }
    res.status(StatusCodes.OK).send({ product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { id: productId } = req.params;
  const modify = req.body;
  try {
    const product = await Product.findByIdAndUpdate(productId, modify, {
      new: true,
      ruValidators: true,
    });
    if (!product) {
      throw new NotFoundError(`No product with the id ${productId}`);
    }
    res.status(StatusCodes.OK).json({ product });
  } catch (error) {
    next(error);
  }
};

const deleteCloudinaryImage = async (cloudImagePublicId) => {
  try {
    await cloudinary.uploader.destroy(cloudImagePublicId);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
};
const deleteProduct = async (req, res, next) => {
  const { id: productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError(`No product with the id:${productId}`);
    }
    if (product.cloudImagePublicId) {
      await deleteCloudinaryImage(product.cloudImagePublicId);
    }
    await Review.deleteMany({ product: productId });

    await Product.deleteOne({ _id: productId });

    res.status(StatusCodes.OK).json({ msg: "product deleted successfully!" });
  } catch (error) {
    next(error);
  }
};
const uploadImage = async (req, res, next) => {
  // console.log(req.files);
  try {
    if (!req.files) {
      throw new BadRequestError("No uploaded file");
    }
    const productImage = req.files.image;
    if (!productImage.mimetype.startsWith("image")) {
      throw new BadRequestError("no image provided");
    }
    const maxSize = 2048 * 2048;
    if (productImage.size > maxSize) {
      throw new BadRequestError("please upload image below 2MB");
    }
    // const imagePath = path.join(
    //   __dirname,
    //   "../public/uploads/" + productImage.name
    // );
    // await productImage.mv(imagePath);
    const cloudImage = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: "sonnatrendy product images",
      }
    );
    console.log(cloudImage);
    fs.unlinkSync(req.files.image.tempFilePath);
    res.status(StatusCodes.OK).json({
      image: cloudImage.secure_url,
      cloudImagePublicId: cloudImage.public_id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
