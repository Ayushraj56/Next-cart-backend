import User from "../models/user.js";
import bcrypt from "bcryptjs";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Signup failed",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email",
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    req.session.userId = user._id.toString();

    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Session save failed",
        });
      }


      res.json({
        success: true,
        user: req.session.user,
      });
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// GET ME
export const getMe = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
      });
    }

    res.json({
      success: true,
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

// LOGOUT
export const logout = (req, res) => {
  req.session.destroy();

  res.json({
    success: true,
  });
};

// ME
export const me = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: "Not logged in",
      });
    }

    res.json({
      success: true,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error",
    });
  }
};

// GET USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to delete user.",
    });
  }
};