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

// ✅ CREATE APPLICATION (NO FILE HANDLING)
const createApplication = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);

  const user_id = req.user.id;
  const { admission_type, university, status, country, score } = req.body;

  validateRequiredFields([
    { name: "admission_type", value: admission_type },
    { name: "university", value: university }
  ]);

  if (!isNonEmptyString(admission_type) || !isNonEmptyString(university)) {
    throw new AppError("admission_type and university must be valid text", 400);
  }

  const applicationStatus = status || "pending";
  validateStatus(applicationStatus, APPLICATION_STATUSES);

  // ✅ SIMPLE INSERT (NO FILE)
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        user_id,
        admission_type: admission_type.trim(),
        university: university.trim(),
        status: applicationStatus,
        country: country,
        score
      }
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "Application submitted successfully", data);
});


// ✅ ADMIN FETCH
const getAllApplications = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new AppError("Only admin can view all applications", 403);
  }

  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      admission_type,
      university,
      status,
      created_at,
      score,
      country,
      users (
        name,
        roll_no,
        branch,
        year
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 200, "Applications fetched successfully", data);
});


// ✅ UPDATE STATUS
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