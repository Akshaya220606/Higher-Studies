const supabase = require("../config/supabase");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/responseHandler");



// helper to upload a single file
const uploadToSupabase = async (file, folder) => {
  if (!file) return { url: null, name: null };

  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents") // bucket name
    .upload(filePath, file.buffer, {
      contentType: file.mimetype
    });

  if (uploadError) {
    throw new AppError(uploadError.message, 500);
  }

  const { data } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    name: file.originalname
  };
};

// Upload all 4 documents
const uploadDocument = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  console.log("FILES RECEIVED:", req.files);

  // multer gives files like this
  const files = req.files;

  if (!files || Object.keys(files).length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  // upload each file
  const hallTicket = await uploadToSupabase(
    files.hall_ticket?.[0],
    "hall_ticket"
  );

  const rankCard = await uploadToSupabase(
    files.rank_card?.[0],
    "rank_card"
  );

  const seatAllotment = await uploadToSupabase(
    files.seat_allotment?.[0],
    "seat_allotment"
  );

  const admissionLetter = await uploadToSupabase(
    files.admission_letter?.[0],
    "admission_letter"
  );

  // store in DB
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        user_id,

        hall_ticket: hallTicket.url,
        hall_ticket_name: hallTicket.name,

        rank_card: rankCard.url,
        rank_card_name: rankCard.name,

        seat_allotment: seatAllotment.url,
        seat_allotment_name: seatAllotment.name,

        admission_letter: admissionLetter.url,
        admission_letter_name: admissionLetter.name
      }
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return sendSuccess(res, 201, "Documents uploaded successfully", data);
});

// Get documents
const getUserDocuments = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

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