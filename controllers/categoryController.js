import Category from "../models/category.js";

export const createCategory = async (req, res) => {
   try {
      const category = await Category.create({
         name: req.body.name,
         image: req.file.filename
      })
      res.send("Category Added");
   }

   catch (error) {
      console.log(error);
      res.send("Category not added");
   }
};
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching categories",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Category Deleted",
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
    };

    // If new image uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Category update failed",
    });
  }
};