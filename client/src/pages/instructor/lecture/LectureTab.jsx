import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, Video, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import SubLectureManager from "./SubLectureManager";

const MEDIA_API = "http://localhost:5000/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [uploadPdfInfo, setUploadPdfInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo({ videoUrl: lecture.videoUrl, publicId: lecture.publicId });
      setUploadPdfInfo({ pdfUrl: lecture.pdfUrl, publicId: lecture.pdfPublicId });
    }
  }, [lecture])

  const [editLecture, { data, isLoading, error, isSuccess }] = useEditLectureMutation();
  const [removeLecture, { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess }] = useRemoveLectureMutation();

  const fileChangeHandler = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      setUploadProgress(0);
      try {
        const endpoint = type === "video" ? `${MEDIA_API}/upload-video` : `${MEDIA_API}/upload-pdf`;
        const res = await axios.post(endpoint, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          if (type === "video") {
            setUploadVideoInfo({
              videoUrl: res.data.data.secure_url,
              publicId: res.data.data.public_id,
            });
          } else {
            setUploadPdfInfo({
              pdfUrl: res.data.data.secure_url,
              publicId: res.data.data.public_id,
            });
          }
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(`${type} upload failed`);
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      pdfInfo: uploadPdfInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess])

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b mb-6 p-4 sm:p-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Edit Lecture</CardTitle>
          <CardDescription>
            Configure your lecture content with videos and complementary PDF materials.
          </CardDescription>
        </div>
        <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler} className="hover:bg-red-600">
          {removeLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</>
          ) : "Remove Lecture"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Lecture Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Supply Chain Management"
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-4 border border-dashed rounded-xl bg-gray-50/50">
            <div className="flex items-center gap-2 text-teal-700">
              <Video size={18} />
              <Label className="font-bold uppercase text-xs tracking-widest">Lecture Video</Label>
            </div>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => fileChangeHandler(e, "video")}
              className="bg-white"
            />
            {uploadVideoInfo?.videoUrl && (
              <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                ✓ Video selected: {uploadVideoInfo.publicId?.split('/').pop()}
              </p>
            )}
          </div>

          <div className="space-y-4 p-4 border border-dashed rounded-xl bg-gray-50/50">
            <div className="flex items-center gap-2 text-blue-700">
              <FileText size={18} />
              <Label className="font-bold uppercase text-xs tracking-widest">Lecture Resources (PDF)</Label>
            </div>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => fileChangeHandler(e, "pdf")}
              className="bg-white"
            />
            {uploadPdfInfo?.pdfUrl && (
              <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                ✓ PDF selected: {uploadPdfInfo.publicId?.split('/').pop()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg w-fit">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="freeVideo" className="data-[state=checked]:bg-teal-500" />
          <Label htmlFor="freeVideo" className="cursor-pointer font-medium text-gray-700">Preview enabled for students</Label>
        </div>

        {mediaProgress && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between text-xs font-bold text-teal-700 mb-1">
              <span>UPLOADING CONTENT...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-gray-200" />
          </div>
        )}

        <div className="border-t pt-8">
          <SubLectureManager lectureId={lectureId} />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button disabled={isLoading || mediaProgress} onClick={editLectureHandler} className="bg-teal-700 hover:bg-teal-800 h-11 px-8 shadow-md">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
            ) : mediaProgress ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading Media...</>
            ) : "Save All Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
