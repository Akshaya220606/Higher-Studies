const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const {
  validateRequiredFields,
  validateStatus,
  validatePositiveNumber,
  isNonEmptyString
} = require("../utils/validation");

const APPLICATION_STATUSES = ["pending", "approved", "rejected"];

const getUserById = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", Number(userId))
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!user) {
    throw new AppError("User not found. Please register first.", 404);
  }

  return user;
};

// Create a new application
const createApplication = asyncHandler(async (req, res) => {
  const { user_id, admission_type, university, status } = req.body;

  validateRequiredFields([
    { name: "user_id", value: user_id },
    { name: "admission_type", value: admission_type },
    { name: "university", value: university }
  ]);

  if (!isNonEmptyString(admission_type) || !isNonEmptyString(university)) {
    throw new AppError("admission_type and university must be valid text", 400);
  }

  validatePositiveNumber(user_id, "user_id");

  const applicationStatus = status || "pending";
  validateStatus(applicationStatus, APPLICATION_STATUSES);

  await getUserById(user_id);

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        user_id: Number(user_id),
        admission_type: admission_type.trim(),
        university: university.trim(),
        status: applicationStatus
      }
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "Application submitted successfully", data);
});

// Get all applications for admin users
const getAllApplications = asyncHandler(async (req, res) => {
  const { user_id } = req.query;

  validateRequiredFields([{ name: "user_id", value: user_id }]);
  validatePositiveNumber(user_id, "user_id");

  const user = await getUserById(user_id);

  if (user.role !== "admin") {
    throw new AppError("Only admin can view all applications", 403);
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 200, "Applications fetched successfully", data);
});

// Update application status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  validateRequiredFields([
    { name: "id", value: id },
    { name: "status", value: status }
  ]);
  validatePositiveNumber(id, "id");
  validateStatus(status, APPLICATION_STATUSES);

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError("Application not found", 404);
  }

  return sendSuccess(res, 200, "Application status updated successfully", data);
});

module.exports = {
  createApplication,
  getAllApplications,
  updateApplicationStatus
};
