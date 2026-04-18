import SubLecture from "../models/subLecture.model.js";
import { Lecture } from "../models/lecture.model.js"; // ✅ FIX
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/s3.js"



// CREATE sub-lecture
export const createSubLecture = async (req, res) => {
  const { lectureId } = req.params;
  const { title } = req.body;

  const subLecture = await SubLecture.create({
    title,
    lecture: lectureId
  });

  await Lecture.findByIdAndUpdate(
    lectureId,
    { $push: { subLectures: subLecture._id } }
  );

  res.status(201).json({
    success: true,
    subLecture
  });
};




// GET sub-lectures of lecture
export const getSubLectures = async (req, res) => {
  const { lectureId } = req.params;

  const subLectures = await SubLecture.find({ lecture: lectureId });

  res.status(200).json({ subLectures });
};





// UPDATE sub-lecture (Only Video)
export const updateSubLecture = async (req, res) => {
  try {
    const { subLectureId } = req.params;
    const { title, videoInfo } = req.body;

    const subLecture = await SubLecture.findById(subLectureId);
    if (!subLecture) {
      return res.status(404).json({ message: "SubLecture not found" });
    }

    if (title) subLecture.title = title;

    if (videoInfo) {
      if (videoInfo.videoUrl) subLecture.videoUrl = videoInfo.videoUrl;
      if (videoInfo.publicId) subLecture.publicId = videoInfo.publicId;
    }

    await subLecture.save();

    res.status(200).json({
      success: true,
      subLecture
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update sub-lecture" });
  }
};

