import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUpdateSubLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, Video, Trash2, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:5000/api/v1/media";

const SubLectureItem = ({ subLecture }) => {
  const [title, setTitle] = useState(subLecture.title || "");
  const [videoInfo, setVideoInfo] = useState({
    videoUrl: subLecture.videoUrl,
    publicId: subLecture.publicId
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaLoading, setMediaLoading] = useState(false);

  const [updateSubLecture, { isLoading }] = useUpdateSubLectureMutation();

  useEffect(() => {
    setTitle(subLecture.title);
    setVideoInfo({
      videoUrl: subLecture.videoUrl,
      publicId: subLecture.publicId
    });
  }, [subLecture]);

  const videoChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaLoading(true);
      setUploadProgress(0);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          setVideoInfo({
            videoUrl: res.data.data.secure_url,
            publicId: res.data.data.public_id,
          });
          toast.success("Video uploaded successfully");
        }
      } catch (error) {
        console.error(error);
        toast.error("Video upload failed");
      } finally {
        setMediaLoading(false);
      }
    }
  };

  const handleSaveSubLecture = async () => {
    try {
      await updateSubLecture({
        subLectureId: subLecture._id,
        title,
        videoInfo
      }).unwrap();
      toast.success("Sub-lecture updated");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm overflow-hidden bg-white/50 hover:bg-white transition-colors duration-300">
      <CardHeader className="bg-gray-50/50 py-3 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-teal-100 p-1.5 rounded-md text-teal-700">
            <Video size={14} />
          </div>
          <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title || "Untitled Sub-Lecture"}</CardTitle>
        </div>
        {videoInfo.videoUrl && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 italic">
            <CheckCircle2 size={10} />
            READY
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Sub-Lecture Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Part 1: Hands-on Practice"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Video Component</Label>
          <div className="flex flex-col gap-3">
            <Input
              type="file"
              accept="video/*"
              onChange={videoChangeHandler}
              className="text-xs h-9 cursor-pointer file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />

            {videoInfo.videoUrl && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                <a
                  href={videoInfo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-teal-700 font-medium hover:underline truncate max-w-[200px]"
                >
                  {videoInfo.publicId?.split('/').pop() || "view_video"}
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => setVideoInfo({ videoUrl: "", publicId: "" })}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {mediaLoading && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex justify-between text-[10px] font-bold text-teal-600">
              <span>UPLOADING VIDEO...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1 bg-gray-100" />
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSaveSubLecture}
            disabled={isLoading || mediaLoading}
            className="bg-teal-600 hover:bg-teal-700 text-xs font-bold h-9 px-6 transition-all shadow-sm"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
            ) : "Save Details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubLectureItem;
