const Admin = require("../model/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "missing fields required",
        message: {
          name: !name ? "name is required" : undefined,
          email: !email ? "email is required" : undefined,
          password: !password ? "password is required" : undefined,
        },
      });
    }

    const admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "email already exist in DB" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashPassword,
      role: role ? role : "user",
    });
    await newAdmin.save();

    res.status(201).json({ message: "register successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "missing fields required",
        message: {
          email: !email ? "email is required" : undefined,
          password: !password ? "password is required" : undefined,
        },
      });
    }
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Credentials incorrect" });
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(404).json({ message: "password is Incorrect" });
    }

    const payload = { id: user._id, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res
      .status(200)
      .json({ message: "login Successful", token, role: user.role });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const getUser = await Admin.find({});
    const newUser = getUser.filter((user) => user.role == "user");
    res.status(200).json({ message: "get all User", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteUser = await Admin.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(404).json({ message: "user Not Found" });
    }
    res.status(200).json({ message: "User delete successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAdmin,
  loginAdmin,
  deleteUser,
  getAllUser,
};
