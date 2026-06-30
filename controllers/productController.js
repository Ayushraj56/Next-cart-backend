import Product from "../models/product.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Cart from "../models/cart.js";

const deleteImage = (imageUrl) => {
  if (!imageUrl) return;

  const filename = imageUrl.split("/uploads/")[1];
  if (!filename) return;

  const filePath = path.join("public", "uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.log(err);
    }
  });
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, price, categoryId, brandId, description } = req.body;

    const images = req.files
      ? req.files.map(
          (file) => `${process.env.BACKEND_URL}/uploads/${file.filename}`
        )
      : [];

    const product = await Product.create({
      name,
      price,
      description,
      categoryId,
      brandId,
      images,
    });

    const populated = await Product.findById(product._id)
      .populate("categoryId")
      .populate("brandId");

    res.status(201).json(populated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Product not added" });
  }
};

// GET PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, categoryId, brandId, sortBy, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortStage =
      sortBy === "price-asc" ? { price: 1, _id: 1 } :
        sortBy === "price-desc" ? { price: -1, _id: 1 } :
          { createdAt: -1, _id: 1 };

    const matchStage = {};

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid categoryId" });
      }
      matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (brandId) {
      if (!mongoose.Types.ObjectId.isValid(brandId)) {
        return res.status(400).json({ message: "Invalid brandId" });
      }
      matchStage.brandId = new mongoose.Types.ObjectId(brandId);
    }

    if (search) {
      matchStage.name = { $regex: search, $options: "i" };
    }

    const totalProducts = await Product.countDocuments(matchStage);

    const products = await Product.aggregate([
      { $match: matchStage },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },

      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          images: 1,
          soldCount: 1,
          createdAt: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
            image: "$category.image",
          },
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
            image: "$brand.image",
          },
        },
      },

      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
    ]);

    res.status(200).json({
      products,
      pagination: {
        totalProducts,
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// GET ALL PRODUCTS (FOR DASHBOARD)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId")
      .populate("brandId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching all products" });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {
      name: req.body.name || product.name,
      price: req.body.price || product.price,
      description: req.body.description || product.description,
      categoryId: req.body.categoryId || product.categoryId,
      brandId: req.body.brandId || product.brandId,
    };

    if (req.files && req.files.length > 0) {
      if (product.images) {
        product.images.forEach((img) => deleteImage(img));
      }
      updateData.images = req.files.map(
        (file) => `${process.env.BACKEND_URL}/uploads/${file.filename}`
      );
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate("categoryId")
      .populate("brandId");

    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Product update failed" });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images) {
      product.images.forEach((img) => deleteImage(img));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Delete failed" });
  }
};

// GET SINGLE PRODUCT
export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const product = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(productId),
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brand",
        },
      },

      {
        $lookup: {
          from: "carts",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$productId", "$$productId"],
                },
              },
            },
          ],
          as: "cartItem",
        },
      },

      {
        $addFields: {
          isInCart: {
            $gt: [{ $size: "$cartItem" }, 0],
          },
        },
      },

      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $unwind: {
          path: "$brand",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!product.length) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product: product[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};