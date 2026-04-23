const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");
const {
  validateRequiredFields,
  validateEmail,
  validateRole,
  isNonEmptyString
} = require("../utils/validation");

const USER_ROLES = ["student", "admin"];

const bcrypt = require("bcrypt");

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, roll_no } = req.body; // 🔥 added roll_no

  validateRequiredFields([
    { name: "name", value: name },
    { name: "email", value: email },
    { name: "password", value: password },
    { name: "roll_no", value: roll_no } // 🔥 make roll_no required
  ]);

  validateEmail(email);

  if (!isNonEmptyString(name)) {
    throw new AppError("Name must be a non-empty string", 400);
  }

  if (!isNonEmptyString(password) || password.trim().length < 4) {
    throw new AppError("Password must be at least 4 characters long", 400);
  }

  if (!isNonEmptyString(roll_no)) {
    throw new AppError("Roll number must be valid", 400);
  }

  const userRole = role || "student";
  validateRole(userRole, USER_ROLES);

  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (checkError) {
    throw new AppError(checkError.message, 500);
  }

  if (existingUser) {
    throw new AppError("User already exists with this email", 409);
  }

  // 🔥 HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  // 🔥 INSERT WITH roll_no
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: userRole,
        roll_no: roll_no.trim() // ✅ added
      }
    ])
    .select("id, name, email, role, roll_no, created_at") // ✅ include roll_no
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "User registered successfully", data);
});


// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateRequiredFields([
    { name: "email", value: email },
    { name: "password", value: password }
  ]);

  validateEmail(email);

  // 🔥 include roll_no in select
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, roll_no, password")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password.trim(), user.password);

  if (!isMatch) {
    throw new AppError("Invalid password", 401);
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    "secretkey",
    { expiresIn: "1d" }
  );

  // Remove password
  delete user.password;

  return sendSuccess(res, 200, "Login successful", {
    user,
    token
  });
});

module.exports = {
  registerUser,
  loginUser
};