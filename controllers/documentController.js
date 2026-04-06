const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");
const {
  validateRequiredFields,
  isNonEmptyString
} = require("../utils/validation");

// Save uploaded document metadata in database
const uploadDocument = asyncHandler(async (req, res) => {
  const { user_id, file_url, file_name } = req.body;

  validateRequiredFields([
    { name: "user_id", value: user_id },
    { name: "file_url", value: file_url },
    { name: "file_name", value: file_name }
  ]);

  if (!isNonEmptyString(file_url) || !isNonEmptyString(file_name)) {
    throw new AppError("file_url and file_name must be valid text", 400);
  }

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        user_id,
        file_url: file_url.trim(),
        file_name: file_name.trim()
      }
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "Document metadata stored successfully", data);
});

// Get all documents for a specific user
const getUserDocuments = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  validateRequiredFields([{ name: "user_id", value: user_id }]);

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user_id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 200, "Documents fetched successfully", data);
});

module.exports = {
  uploadDocument,
  getUserDocuments
};
