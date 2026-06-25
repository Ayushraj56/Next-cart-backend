import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    description: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },

    images: [String],


    soldCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model("Product", productSchema);

export default Product;