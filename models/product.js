const mongoose = require("mongoose");
const validator = require("validator");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "please provide product name"],
      maxlenght: [50, "name cannot be more than 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
    },
    description: {
      type: String,
      required: [true, "you haven't entered your product description"],
      maxlength: [800, "description can't be more than 1000 characters "],
    },
    image: {
      type: String,
      required: [true, "upload product image"],
      default: "/uploads/exp.jpeg",
    },
    cloudImagePublicId: {
      type: String,
      //   required: [true, "cannot find cloud image id"],
    },
    category: {
      type: String,
      required: [true, "please provide product category"],
      enum: {
        values: [
          "moisturizers",
          "face care",
          "body butters & lotions",
          "cleansers",
          "serums",
        ],
        message: "{VALUE} is not a supported category",
      },
    },
    brand: {
      type: String,
      required: [true, "please provide product brand"],
      enum: {
        values: ["Nivea", "NaturGlow", "GlowEssence", "SheaDelight", "SunCare"],
        message: "{VALUE} is not a supported brand",
      },
    },
    fragrances: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 5,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
    ratingRange: {
      type: Map,
      of: Number,
      default: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    },
    userCreatingTheProduct: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  //   match: { rating: 1 },
});

// ProductSchema.pre("remove", async function (next) {
//   await this.model("Review").deleteMany({ product: this._id });
// });
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
