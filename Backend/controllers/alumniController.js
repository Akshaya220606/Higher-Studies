const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const {
  validateRequiredFields,
  validatePositiveNumber,
  isNonEmptyString
} = require("../utils/validation");

// Add a new alumni record
const addAlumni = asyncHandler(async (req, res) => {
  const user_id = req.user.id; // 🔥 get from token
  const { company, job_role, experience } = req.body;

  validateRequiredFields([
    { name: "company", value: company },
    { name: "job_role", value: job_role },
    { name: "experience", value: experience }
  ]);

  if (!isNonEmptyString(company) || !isNonEmptyString(job_role)) {
    throw new AppError("company and job_role must be valid text", 400);
  }

  validatePositiveNumber(experience, "experience");

  const { data, error } = await supabase
    .from("alumni")
    .insert([
      {
        user_id, // ✅ from token
        company: company.trim(),
        job_role: job_role.trim(),
        experience: Number(experience)
      }
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "Alumni record added successfully", data);
});

// Get all alumni records (admin can see all)
const getAllAlumni = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("alumni")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 200, "Alumni records fetched successfully", data);
});

module.exports = {
  addAlumni,
  getAllAlumni
};