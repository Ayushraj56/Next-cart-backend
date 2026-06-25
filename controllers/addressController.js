import Address from "../models/address.js";

export const createAddress = async (
  req,
  res
) => {
  try {

    const userId = req.session.userId;

    const address =
      await Address.create({
        userId,
        ...req.body,
      });

    res.status(201).json({
      success: true,
      address,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
    });

  }
};

export const getAddresses = async (
  req,
  res
) => {
  try {

    const userId = req.session.userId;

    const addresses =
      await Address.find({
        userId,
      }).sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      addresses,
    });

  } catch (error) {

    console.log(error);

  }
};

export const deleteAddress = async (
  req,
  res
) => {
  try {

    await Address.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

  }
};

export const updateAddress = async (req, res) => {
  try {

    const address = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      address,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};