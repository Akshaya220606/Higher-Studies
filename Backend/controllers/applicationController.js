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

// Create a new application (student only)
const createApplication = asyncHandler(async (req, res) => {
  const user_id = req.user.id; // 🔥 from token
  const { admission_type, university, status } = req.body;

  validateRequiredFields([
    { name: "admission_type", value: admission_type },
    { name: "university", value: university }
  ]);

  if (!isNonEmptyString(admission_type) || !isNonEmptyString(university)) {
    throw new AppError("admission_type and university must be valid text", 400);
  }

  const applicationStatus = status || "pending";
  validateStatus(applicationStatus, APPLICATION_STATUSES);

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        user_id, // ✅ from token
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

// Get all applications (admin only)
const getAllApplications = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
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

// Update application status (admin only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new AppError("Only admin can update application status", 403);
  }

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