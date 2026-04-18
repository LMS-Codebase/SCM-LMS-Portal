import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Loader2,
  Save,
  Send,
  BookOpen,
  Trophy,
  DollarSign,
  FileVideo,
  FileText,
  Layers,
  Layout,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useDeleteCommonMediaMutation,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    courseLevel: "",
    coursePrice: "",
    courseDuration: "",
    courseThumbnail: "",
    validityPeriod: "Lifetime",
    resource: "",
    domain: [],
  });

  const params = useParams();
  const courseId = params.courseId;

  const {
    data: courseByIdData,
    isLoading: courseByIdLoading,
    refetch,
  } = useGetCourseByIdQuery(courseId, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setInput({
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        description: course.description || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice || "",
        courseDuration: course.courseDuration || "",
        validityPeriod: course.validityPeriod || "Lifetime",
        courseThumbnail: "",
        resource: course.resource?._id || course.resource || "",
        domain: course.domain ? (Array.isArray(course.domain) ? course.domain.map(d => d._id || d) : [course.domain._id || course.domain]) : [],
      });
      setSavedVideos(course.commonVideos || []);
      setSavedPdfs(course.commonPdfs || []);
    }
  }, [courseByIdData]);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const videoInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [savedVideos, setSavedVideos] = useState([]);
  const [savedPdfs, setSavedPdfs] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [newPdfs, setNewPdfs] = useState([]);

  const { data: resourceData } = useGetPublishedResourcesQuery();
  const { data: domainData } = useGetDomainsQuery();
  const navigate = useNavigate();

  const [editCourse, { isLoading: isUpdating }] = useEditCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [deleteCommonMedia, { isLoading: isDeleting }] = useDeleteCommonMediaMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };

  const selectValidityPeriod = (value) => {
    setInput({ ...input, validityPeriod: value });
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const addCommonVideos = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    setNewVideos(prev => [...prev, ...files]);
  };

  const addCommonPdfs = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      file
    }));
    setNewPdfs(prev => [...prev, ...files]);
  };

  const handleRemoveNewVideo = (id) => {
    setNewVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleRemoveNewPdf = (id) => {
    setNewPdfs(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteMedia = async (public_id, type) => {
    try {
      await deleteCommonMedia({ courseId, public_id, type }).unwrap();
      if (type === "video") {
        setSavedVideos(prev => prev.filter(v => v.public_id !== public_id));
      } else {
        setSavedPdfs(prev => prev.filter(p => p.public_id !== public_id));
      }
      toast.success("Media removed successfully");
    } catch (error) {
      toast.error("Failed to delete media");
    }
  };

  const updateCourseHandler = async () => {
    try {
      const formData = new FormData();
      formData.append("courseTitle", input.courseTitle);

      if (input.subTitle) formData.append("subTitle", input.subTitle);
      if (input.description) formData.append("description", input.description);
      if (input.courseLevel) formData.append("courseLevel", input.courseLevel);
      if (input.validityPeriod) formData.append("validityPeriod", input.validityPeriod);
      if (input.courseDuration) formData.append("courseDuration", input.courseDuration);
      if (input.resource) formData.append("resource", input.resource);
      if (input.coursePrice) formData.append("coursePrice", input.coursePrice);
      if (input.courseThumbnail) formData.append("courseThumbnail", input.courseThumbnail);

      input.domain?.forEach(id => formData.append("domain", id));
      newVideos.forEach(v => formData.append("commonVideos", v.file));
      newPdfs.forEach(p => formData.append("commonPdfs", p.file));

      await editCourse({ formData, courseId }).unwrap();
      setNewVideos([]);
      setNewPdfs([]);
      toast.success("Course details updated successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update course");
    }
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action }).unwrap();
      toast.success(response.message);
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (courseByIdLoading) return <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="animate-spin text-teal-600" />
  </div>;

  return (
    <Card className="border-none shadow-2xl overflow-hidden rounded-2xl bg-white">
      <CardHeader className="bg-gray-50/50 border-b p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900">Fill in the details for your Case-Study</CardTitle>
          {/* <CardDescription className="text-gray-500 font-medium italic">
            Refine your curriculum's core identity, categorization, and foundational assets.
          </CardDescription> */}
          <CardDescription className="text-gray-500 font-medium italic">
            Fine-tune your content and associated case-study materials.
          </CardDescription>
        </div>
        <div className="flex gap-3">
          <Button
            disabled={(!courseByIdData?.course?.lectures?.length && !courseByIdData?.course?.commonPdfs?.length && !courseByIdData?.course?.commonVideos?.length) || isUpdating || isDeleting}
            variant="outline"
            className={`font-bold transition-all ${courseByIdData?.course.isPublished ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}
            onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
          >
            <Send className="mr-2 h-4 w-4" />
            {courseByIdData?.course.isPublished ? "Shift to Draft" : "Live Launch"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-12">
        {/* SECTION 1: IDENTITY */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
              <Layout size={16} />
              Title and Description
            </h3>
            {/* <p className="text-xs text-gray-500 italic leading-relaxed">Establish the basic narrative and focus of your training program.</p> */}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Program Title<span className="text-red-500">*</span></Label>
              <Input
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandler}
                className="bg-gray-50/30 font-medium h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Sub-headline</Label>
              <Input
                name="subTitle"
                value={input.subTitle}
                onChange={changeEventHandler}
                className="bg-gray-50/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Comprehensive Curriculum Overview</Label>
              <div className="bg-gray-50/10 rounded-xl overflow-hidden border">
                <RichTextEditor input={input} setInput={setInput} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CATEGORIZATION */}
        <div className="grid lg:grid-cols-3 gap-10 border-t pt-12">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
              <Layers size={16} />
              Categorization
            </h3>
            {/* <p className="text-xs text-gray-500 italic leading-relaxed">Categorize your program to ensure it reaches the right audience.</p> */}
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Resource Classification<span className="text-red-500">*</span></Label>
              <select
                name="resource"
                value={input.resource}
                onChange={changeEventHandler}
                className="w-full h-11 px-3 bg-gray-50/30 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select Resource Type</option>
                {resourceData?.resources?.map(res => (
                  <option key={res._id} value={res._id}>{res.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Domain Classification (Multi-select)<span className="text-red-500">*</span></Label>
              <div className="border rounded-xl p-4 h-40 overflow-y-auto bg-gray-50/30 space-y-2.5 custom-scrollbar">
                {domainData?.domains?.map(dom => (
                  <div key={dom._id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      id={`ct-${dom._id}`}
                      checked={input.domain?.includes(dom._id)}
                      onChange={(e) => {
                        const current = Array.isArray(input.domain) ? input.domain : [];
                        if (e.target.checked) {
                          setInput({ ...input, domain: [...current, dom._id] });
                        } else {
                          setInput({ ...input, domain: current.filter(id => id !== dom._id) });
                        }
                      }}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 accent-teal-600"
                    />
                    <label htmlFor={`ct-${dom._id}`} className="text-sm font-medium text-gray-600 group-hover:text-teal-700 cursor-pointer">
                      {dom.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SPECIFICATIONS */}
        <div className="grid lg:grid-cols-3 gap-10 border-t pt-12">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
              <Trophy size={16} />
              Level, Pricing & Validity
            </h3>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Course Level</Label>
              <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                <SelectTrigger className="bg-gray-50/30 h-11 focus:ring-teal-500">
                  <SelectValue placeholder="Beginner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Total Time (in hrs)</Label>
              <Input
                name="courseDuration"
                value={input.courseDuration}
                onChange={changeEventHandler}
                className="bg-gray-50/30 h-11"
                placeholder="eg: 40h"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Price (INR)</Label>
              {/* <div className="relative"> */}
              {/* <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-teal-600" /> */}
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                className="bg-gray-50/30 h-11"
              />
              {/* </div> */}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700">Access Validity</Label>
              <Select value={input.validityPeriod} onValueChange={selectValidityPeriod}>
                <SelectTrigger className="bg-gray-50/30 h-11 focus:ring-teal-500">
                  <SelectValue placeholder="Lifetime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="3 Months">3 Months</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>

        {/* SECTION 4: MEDIA ASSETS */}
        <div className="grid lg:grid-cols-3 gap-10 border-t pt-12">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
              <ImageIcon size={16} />
              Visual Presence (Thumbnail)
            </h3>
            {/* <p className="text-xs text-gray-500 italic leading-relaxed">Upload a thumbnail that captures the essence of this course.</p> */}
          </div>
          <div className="lg:col-span-2 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <Input
                type="file"
                onChange={selectThumbnail}
                accept="image/*"
                className="bg-gray-50 border-dashed border-2 hover:border-teal-400 cursor-pointer w-full sm:w-fit h-fit"
              />
              {previewThumbnail ? (
                <img src={previewThumbnail} className="w-56 h-32 object-cover rounded-xl shadow-lg border-4 border-white" alt="Thumbnail Preview" />
              ) : courseByIdData?.course?.courseThumbnail && (
                <img src={courseByIdData.course.courseThumbnail} className="w-56 h-32 object-fill rounded-xl shadow-lg border-4 border-gray-50" alt="Current Thumbnail" />
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: SYLLABUS MEDIA */}
        <div className="grid lg:grid-cols-3 gap-10 border-t pt-12">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
              <FileVideo size={16} />
              Common Assets
            </h3>
            {/* <p className="text-xs text-gray-500 italic leading-relaxed">Add universal videos or study guides available to all students in this program.</p> */}
          </div>
          <div className="lg:col-span-2 space-y-8">
            {/* Videos */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Label className="font-bold text-gray-700 flex items-center gap-2">
                  <FileVideo size={16} className="text-teal-600" />
                  Video Assets
                </Label>
                <Button size="sm" variant="ghost" className="text-teal-600 hover:bg-teal-50 font-bold" onClick={() => videoInputRef.current.click()}>
                  <Plus className="mr-1 h-4 w-4" /> Add Videos
                </Button>
                <input ref={videoInputRef} hidden multiple type="file" accept="video/*" onChange={addCommonVideos} />
              </div>
              <div className="space-y-3">
                {savedVideos.map(video => (
                  <div key={video.public_id} className="flex items-center justify-between bg-teal-50/30 p-4 rounded-xl border border-teal-100/50">
                    <span className="text-sm font-semibold text-teal-800 truncate max-w-sm">{video.originalName}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 border-teal-200 text-teal-700" onClick={() => window.open(video.url, "_blank")}>Preview</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-rose-600 hover:bg-rose-50" disabled={isDeleting || isUpdating} onClick={() => handleDeleteMedia(video.public_id, "video")}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
                {newVideos.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-orange-50/30 p-4 rounded-xl border border-orange-100 border-dashed">
                    <span className="text-sm font-medium text-orange-700 italic truncate max-w-sm">{v.file.name} (Pending Upload)</span>
                    <Button size="sm" variant="ghost" className="h-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemoveNewVideo(v.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs */}
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Label className="font-bold text-gray-700 flex items-center gap-2">
                  <FileText size={16} className="text-teal-600" />
                  Case Study Handouts (PDF)
                </Label>
                <Button size="sm" variant="ghost" className="text-teal-600 hover:bg-teal-50 font-bold" onClick={() => pdfInputRef.current.click()}>
                  <Plus className="mr-1 h-4 w-4" /> Add PDFs
                </Button>
                <input ref={pdfInputRef} hidden multiple type="file" accept=".pdf" onChange={addCommonPdfs} />
              </div>
              <div className="space-y-3">
                {savedPdfs.map(pdf => (
                  <div key={pdf.public_id} className="flex items-center justify-between bg-teal-50/30 p-4 rounded-xl border border-teal-100/50">
                    <span className="text-sm font-semibold text-teal-800 truncate max-w-sm">{pdf.originalName}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="h-8 border-teal-200 text-teal-700" onClick={() => window.open(pdf.url, "_blank")}>View</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-rose-600 hover:bg-rose-50" disabled={isDeleting || isUpdating} onClick={() => handleDeleteMedia(pdf.public_id, "pdf")}><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
                {newPdfs.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-orange-50/30 p-4 rounded-xl border border-orange-100 border-dashed">
                    <span className="text-sm font-medium text-orange-700 italic truncate max-w-sm">{p.file.name} (Pending Upload)</span>
                    <Button size="sm" variant="ghost" className="h-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700" onClick={() => handleRemoveNewPdf(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-12 border-t mt-12">
          <Button disabled={isUpdating || isDeleting} onClick={() => navigate("/instructor/course")} variant="outline" className="px-10 border-gray-200 hover:bg-gray-50 font-medium">
            Cancel Changes
          </Button>
          <Button
            disabled={isUpdating}
            onClick={updateCourseHandler}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-12 shadow-lg shadow-teal-100"
          >
            {isUpdating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Update</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;
