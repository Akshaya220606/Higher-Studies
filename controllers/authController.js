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
  const { name, email, password, role } = req.body;

  validateRequiredFields([
    { name: "name", value: name },
    { name: "email", value: email },
    { name: "password", value: password }
  ]);
  validateEmail(email);

  if (!isNonEmptyString(name)) {
    throw new AppError("Name must be a non-empty string", 400);
  }

  if (!isNonEmptyString(password) || password.trim().length < 4) {
    throw new AppError("Password must be at least 4 characters long", 400);
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

  // 🔥 HASH PASSWORD HERE
  const hashedPassword = await bcrypt.hash(password.trim(), 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword, // ✅ store hashed password
        role: userRole
      }
    ])
    .select("id, name, email, role, created_at")
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "User registered successfully", data);
});



// Login user with email and password

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateRequiredFields([
    { name: "email", value: email },
    { name: "password", value: password }
  ]);
  validateEmail(email);

  // 1. Get user by email (including password)
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, password")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Compare password using bcrypt
  const isMatch = await bcrypt.compare(password.trim(), user.password);

  if (!isMatch) {
    throw new AppError("Invalid password", 401);
  }

  // 🔥 3. Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    "secretkey", // we will move this to .env later
    { expiresIn: "1d" }
  );

  // 4. Remove password before sending response
  delete user.password;

  // 5. Send user + token
  return sendSuccess(res, 200, "Login successful", {
    user,
    token
  });
});

module.exports = {
  registerUser,
  loginUser
};
