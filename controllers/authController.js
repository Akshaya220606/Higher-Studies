const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const {
  validateRequiredFields,
  validateEmail,
  validateRole,
  isNonEmptyString
} = require("../utils/validation");

const USER_ROLES = ["student", "admin"];

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

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
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

// Login user with simple email and password check
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateRequiredFields([
    { name: "email", value: email },
    { name: "password", value: password }
  ]);
  validateEmail(email);

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("email", email.trim().toLowerCase())
    .eq("password", password.trim())
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Invalid email or password", 401);
  }

  return sendSuccess(res, 200, "Login successful", data);
});

module.exports = {
  registerUser,
  loginUser
};
