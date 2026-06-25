import Brand from "../models/brand.js";

// Create Brand
export const createBrand = async (req, res) => {
  try {
    const brand = await Brand.create({
      name: req.body.name,
      image: req.file.filename,
      category: req.body.category,
    });

    res.status(201).json({
      success: true,
      brand,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Brand not added",
    });
  }
};

// Get All Brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate("category");

    res.status(200).json(brands);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error fetching brands",
    });
  }
};

// Get Brands By Category
export const getBrandsByCategory = async (req, res) => {
  try {
    const brands = await Brand.find({
      category: req.params.categoryId,
    });

    res.status(200).json(brands);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error fetching brands by category",
    });
  }
};

// Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Brand Deleted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// Update Brand
export const updateBrand = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      category: req.body.category,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      brand,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Brand update failed",
    });
  }
};