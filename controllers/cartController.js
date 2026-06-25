import Cart from "../models/cart.js";
import mongoose from "mongoose";


export const addToCart = async (
  req,
  res
) => {
  try {
    const userId =
      req.session.userId;

    const {
      productId,
      quantity,
    } = req.body;

    let item =
      await Cart.findOne({
        userId,
        productId,
      });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await Cart.create({
        userId,
        productId,
        quantity,
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCart = async (req, res) => {
  try {

    const userId = req.session.userId;

    const cart = await Cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      {
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $lookup: {
          from: "brands",
          localField: "product.brandId",
          foreignField: "_id",
          as: "brand",
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

      {
        $project: {
          _id: 1,
          quantity: 1,
          userId: 1,

          productId: {
            _id: "$product._id",
            name: "$product.name",
            price: "$product.price",
            description: "$product.description",
            images: "$product.images",
            soldCount: "$product.soldCount",

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
      },
    ]);

    res.json(cart);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const deleteCartItem =
  async (req, res) => {

    try {

      await Cart.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
      });

    }

  };

export const increaseQuantity = async (
  req,
  res
) => {

  try {

    const item =
      await Cart.findById(
        req.params.id
      );

    item.quantity += 1;

    await item.save();

    res.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

  }

};

export const decreaseQuantity = async (
  req,
  res
) => {

  try {

    const item =
      await Cart.findById(
        req.params.id
      );

    if (item.quantity > 1) {

      item.quantity -= 1;

      await item.save();

    }

    res.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

  }

};