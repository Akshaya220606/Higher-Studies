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
  // 🔥 DEBUG: Log incoming data
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const user_id = req.user.id;
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

  // 🔥 STEP 1: CHECK FILE
  if (!req.file) {
    throw new AppError("PDF file is required", 400);
  }

  const file = req.file;
  console.log("Uploaded file:", file.originalname);
  console.log("File buffer exists:", !!file.buffer);
  console.log("File size:", file.size);
  console.log("File mimetype:", file.mimetype);

  // 🔥 STEP 2: UPLOAD TO SUPABASE STORAGE
  const fileName = `applications/${Date.now()}-${file.originalname}`;
  console.log("Uploading file as:", fileName);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    console.error("Error message:", uploadError.message);
    console.error("Error status:", uploadError.status);
    throw new AppError(`File upload failed: ${uploadError.message}`, 500);
  }

  console.log("File uploaded successfully:", uploadData);

  // 🔥 STEP 3: GET PUBLIC URL
  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(uploadData.path);

  const pdf_url = publicUrlData.publicUrl;

  // 🔥 STEP 4: SAVE IN DATABASE
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        user_id,
        admission_type: admission_type.trim(),
        university: university.trim(),
        status: applicationStatus,
        pdf_url, // 👈 IMPORTANT COLUMN
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