import BuyCourseButton from '@/components/BuyCourseButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BadgeInfo, Lock, PlayCircle, GraduationCap, Phone, Globe, Users, Star, Play, Video, FileText, CheckCircle2, Circle } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGetCourseByIdQuery, useRateCourseMutation } from '@/features/api/courseApi'
import { useLoadUserQuery } from '@/features/api/authApi'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useGetCourseProgressQuery, useUpdateLectureProgressMutation } from '@/features/api/progressApi'
import 'react-quill/dist/quill.snow.css'

const CourseDetail = () => {
    const params = useParams();
    const courseId = params.courseId;
    const { data: userData } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
    const user = userData?.user;
    const { data, isLoading, isError } = useGetCourseByIdQuery(courseId, { skip: !courseId });

    // Server-side progress tracking
    const { data: progressData, isLoading: isProgressLoading } = useGetCourseProgressQuery(courseId, { skip: !courseId });
    const [updateLectureProgress] = useUpdateLectureProgressMutation();
    const [rateCourse, { isLoading: isRatingLoading }] = useRateCourseMutation();

    const instructorSectionRef = useRef(null);

    // Current lecture state
    const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
    const [activeMedia, setActiveMedia] = useState(null);

    const scrollToInstructor = () => {
        if (instructorSectionRef.current) {
            instructorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const course = data?.course;
    const isCourseInCart = user?.cart?.some(
        item => item.resourceType === "course" && String(item.resourceId) === String(courseId)
    );
    const purchasedCourse = user?.enrolledCourses?.some(c => (c._id || c) === courseId) || user?._id === (course?.creator?._id || course?.creator);
    const hasCourseAccess = purchasedCourse || (Number(course?.coursePrice || 0) === 0 && isCourseInCart);
    const courseAccessExpiration = user?.accessExpirations?.find(
        (exp) => String(exp.resourceId?._id || exp.resourceId) === courseId
    );
    const courseAccessLabel =
        course?.validityPeriod === "Lifetime"
            ? "Full lifetime access"
            : hasCourseAccess && courseAccessExpiration?.expiresAt
                ? `Access until ${new Date(courseAccessExpiration.expiresAt).toLocaleDateString("en-GB")}`
                : `${course?.validityPeriod || "Lifetime"} access from purchase`;

    // Keep activeMedia synced with course progression if no custom common resource is overridden
    useEffect(() => {
        if (hasCourseAccess && course?.lectures?.[currentLectureIndex]) {
            setActiveMedia({
                type: 'video',
                url: course.lectures[currentLectureIndex].videoUrl,
                title: course.lectures[currentLectureIndex].lectureTitle,
                isLecture: true
            });
        }
    }, [hasCourseAccess, currentLectureIndex, course]);

    if (isLoading || isProgressLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
    );

    if (isError || !course) return (
        <div className="text-center mt-20 text-red-500 font-semibold text-lg italic">
            Error loading course details. Please try again later.
        </div>
    );

    const courseRatings = course?.ratings || [];
    const avgRating = courseRatings.length > 0
        ? (courseRatings.reduce((sum, r) => sum + r.rating, 0) / courseRatings.length).toFixed(1)
        : "0.0";

    const handleRateCourse = async (ratingVal) => {
        if (!user) return toast.error("Please login to rate.");
        try {
            const res = await rateCourse({ courseId: course._id, rating: ratingVal }).unwrap();
            if (res.success) {
                toast.success(res.message);
                window.location.reload();
            }
        } catch (error) {
            toast.error(error?.data?.message || "Rating failed");
        }
    }

    // Get completed lecture IDs from server data
    const completedLectures = progressData?.data?.progress?.map(p => p.lectureId) || [];
    const currentLecture = course.lectures?.[currentLectureIndex];

    const markAsCompleted = async (lectureId) => {
        try {
            await updateLectureProgress({ courseId, lectureId }).unwrap();
            toast.success("Lesson completed!");
        } catch (error) {
            toast.error("Failed to update progress.");
        }
    };

    const isLectureUnlocked = (index) => {
        if (!hasCourseAccess) return false;
        if (index === 0) return true;
        const previousLectureId = course.lectures[index - 1]._id;
        return completedLectures.includes(previousLectureId);
    };

    const handleSelectLecture = (index) => {
        if (!hasCourseAccess) {
            toast.error("Please enroll in the course to watch this lecture.");
            return;
        }

        if (isLectureUnlocked(index)) {
            setCurrentLectureIndex(index);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error("Finish the previous lecture to unlock this one!");
        }
    };

    return (
        <div className='mt-24 space-y-10 pb-20'>
            {/* HERO SECTION */}
            <div className='bg-[#1c1d1f] text-white'>
                <div className='max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4'>
                    <div className='flex flex-wrap gap-2'>
                        <Badge className="bg-teal-600 hover:bg-teal-700 border-none">{course.courseLevel}</Badge>
                    </div>
                    <h1 className='font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight'>{course.courseTitle}</h1>
                    <p className='text-lg md:text-xl text-gray-300 max-w-3xl'>{course.subTitle || "Master the skills needed to excel in this domain with our comprehensive curriculum."}</p>

                    <div className='flex flex-wrap items-center gap-6 mt-2'>
                        <div className='flex items-center gap-2'>
                            <p className='text-sm'>Created by <span onClick={scrollToInstructor} className='text-teal-400 font-bold hover:underline cursor-pointer'>{course.creator?.name}</span></p>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                            <BadgeInfo size={16} className="text-gray-500" />
                            <p>Last updated (DD/MM/YYYY): {new Date(course.updatedAt).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                            <Users size={16} className="text-gray-500" />
                            <p>{course.enrolledStudents?.length || 0} students enrolled</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-12'>
                {/* LEFT SIDE: CONTENT & INSTRUCTOR */}
                <div className='w-full lg:w-2/3 space-y-12'>

                    {/* DESCRIPTION */}
                    <div className='space-y-4'>
                        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2'>Description</h2>
                        <div className="ql-snow">
                            <div
                                className="ql-editor p-0 text-gray-700 leading-relaxed prose prose-teal max-w-none"
                                dangerouslySetInnerHTML={{ __html: course.description }}
                            />
                        </div>
                    </div>

                    {/* COMMON RESOURCES SECTION */}
                    {(course.commonVideos?.length > 0 || course.commonPdfs?.length > 0) && (
                        <div className='space-y-4 pt-4'>
                            <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2'>
                                <BadgeInfo size={24} className="text-teal-600" />
                                <span>Common Resource</span>
                                <span className="text-sm font-normal text-gray-500 ml-auto">General materials for this course</span>
                            </h2>
                            <Card className="border-gray-200 shadow-sm overflow-hidden">
                                <CardContent className="p-0 divide-y divide-gray-100">
                                    {/* Common Videos */}
                                    {course.commonVideos?.map((video, idx) => {
                                        const handleResourceClick = (e) => {
                                            if (!hasCourseAccess) {
                                                e.preventDefault();
                                                toast.error("Please enroll in the course to access this resource.");
                                            }
                                        };

                                        return (
                                            <div key={video.public_id || idx} className="flex items-center justify-between p-4 hover:bg-teal-50/30 transition-colors group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-teal-100">
                                                        <Video size={18} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{video.originalName || `Course Video ${idx + 1}`}</span>
                                                </div>
                                                <a
                                                    href={hasCourseAccess ? video.url : "#"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleResourceClick(e);
                                                        if (hasCourseAccess) {
                                                            setActiveMedia({ type: 'video', url: video.url, title: video.originalName || "Common Video", isLecture: false });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all shadow-sm",
                                                        hasCourseAccess
                                                            ? "text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-600 hover:text-white"
                                                            : "text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed"
                                                    )}
                                                >
                                                    Play Video
                                                </a>
                                            </div>
                                        );
                                    })}

                                    {/* Common PDFs */}
                                    {course.commonPdfs?.map((pdf, idx) => {
                                        const handleResourceClick = (e) => {
                                            if (!hasCourseAccess) {
                                                e.preventDefault();
                                                toast.error("Please enroll in the course to access this resource.");
                                            }
                                        };

                                        return (
                                            <div key={pdf.public_id || idx} className="flex items-center justify-between p-4 hover:bg-teal-50/30 transition-colors group cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-teal-100">
                                                        <FileText size={18} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700">{pdf.originalName || `Course Resource ${idx + 1}`}</span>
                                                </div>
                                                <a
                                                    href={hasCourseAccess ? pdf.url : "#"}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleResourceClick(e);
                                                        if (hasCourseAccess) {
                                                            setActiveMedia({ type: 'pdf', url: pdf.url, title: pdf.originalName || "Course Resource", isLecture: false });
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all shadow-sm",
                                                        hasCourseAccess
                                                            ? "text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-600 hover:text-white"
                                                            : "text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed"
                                                    )}
                                                >
                                                    View / Download PDF
                                                </a>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* COURSE CONTENT */}
                    <div className='space-y-4'>
                        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center justify-between'>
                            <span>Course Content</span>
                            <span className="text-sm font-normal text-gray-500">{course.lectures?.length || 0} sections • {course.lectures?.reduce((acc, lec) => acc + (lec.subLectures?.length || 0), 0) || 0} sub-lectures</span>
                        </h2>

                        <div className="space-y-3">
                            {course.lectures?.map((lecture, idx) => {
                                const isUnlocked = isLectureUnlocked(idx);
                                const isCompleted = completedLectures.includes(lecture._id);
                                const isCurrent = currentLectureIndex === idx;

                                return (
                                    <Card
                                        key={lecture._id}
                                        className={cn(
                                            "border-gray-200 shadow-sm overflow-hidden group transition-all",
                                            !isUnlocked && "opacity-60 cursor-not-allowed grayscale",
                                            (isCurrent && hasCourseAccess) && "border-teal-500 ring-1 ring-teal-500 bg-teal-50/10"
                                        )}
                                    >
                                        <CardHeader className="bg-gray-50/50 py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <CardTitle className="text-base flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                        isCompleted ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600"
                                                    )}>
                                                        {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                                                    </div>
                                                    <span className={cn("font-bold", (isCurrent && hasCourseAccess) ? "text-teal-700" : "text-gray-800")}>
                                                        {lecture.lectureTitle}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {!isUnlocked && <Lock size={14} className="text-gray-400" />}
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {lecture.subLectures?.length || 0} sub-lectures
                                                    </span>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='p-0 bg-white'>
                                            {/* Main Lecture Content */}
                                            <div className="flex flex-col border-b border-gray-50">
                                                {lecture.videoUrl && (
                                                    <div
                                                        className={cn(
                                                            "flex items-center justify-between p-4 hover:bg-teal-50/30 transition-colors group/item cursor-pointer",
                                                            !isUnlocked && "pointer-events-none"
                                                        )}
                                                        onClick={() => handleSelectLecture(idx)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                {isCompleted ? (
                                                                    <CheckCircle2 size={18} className="text-teal-600" />
                                                                ) : (
                                                                    <div className="w-[18px] h-[18px] rounded border-2 border-gray-300" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Video size={16} className={(isCurrent && hasCourseAccess) ? "text-teal-600" : "text-gray-400"} />
                                                                <span className={cn("text-sm font-medium", (isCurrent && hasCourseAccess) ? "text-teal-700 font-bold" : "text-gray-700")}>
                                                                    Watch Video
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
                                                            (isCurrent && hasCourseAccess) ? "bg-teal-600 text-white" : (isUnlocked ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-500")
                                                        )}>
                                                            {(isCurrent && hasCourseAccess) ? "Playing" : isUnlocked ? "Unlocked" : "Locked"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* INSTRUCTOR SECTION */}
                    <div className='space-y-6 pt-8 scroll-mt-32' ref={instructorSectionRef}>
                        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2'>About the Instructor</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex flex-col items-center gap-4 shrink-0">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-teal-50 shadow-lg">
                                    <AvatarImage
                                        src={course.creator?.photoUrl || "https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"}
                                        className="object-cover"
                                    />
                                    <AvatarFallback>{course.creator?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>

                                <div className="space-y-2 w-full">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-teal-500" />
                                        <span className="truncate max-w-[150px]">{course.creator?.mobileNo}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {course.creator?.socialLinks?.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-gray-100 hover:bg-teal-100 text-gray-600 hover:text-teal-700 rounded-lg transition-colors"
                                                title={link.title}
                                            >
                                                <Globe size={16} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-teal-700">{course.creator?.name}</h3>
                                    <p className="text-gray-500 font-medium">Instructor</p>
                                </div>
                                <div className="flex gap-6 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-sm font-bold">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            <span>{avgRating} Average Rating</span>
                                            <span className="text-xs font-normal text-gray-400">({courseRatings.length})</span>
                                        </div>
                                        {user && (
                                            <div className="mt-2 flex items-center gap-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Rate Course:</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => {
                                                        const userInitialReview = courseRatings.find(r => r.userId === user?._id)?.rating || 0;
                                                        return (
                                                            <Star
                                                                key={star}
                                                                size={18}
                                                                onClick={() => handleRateCourse(star)}
                                                                className={cn(
                                                                    "cursor-pointer transition-all hover:scale-125 hover:text-yellow-500",
                                                                    star <= userInitialReview ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                                                )}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold mt-1 h-fit">
                                        <Users size={16} className="text-teal-500" />
                                        <span>{course.enrolledStudents?.length || 0} Students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm font-bold">
                                        <Play size={16} className="text-red-500" />
                                        <span>{course.lectures?.length || 0} Lectures</span>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                                    {course.creator?.bio || "Enthusiastic educator dedicated to making complex supply chain concepts simple and accessible for everyone."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: PURCHASE CARD & PLAYER */}
                <div className='w-full lg:w-1/3'>
                    <div className='sticky top-28'>
                        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl group">
                            <CardContent className="p-0 flex flex-col">
                                <div className='w-full aspect-video relative overflow-hidden rounded-t-2xl bg-black border-b border-gray-100/10'>
                                    {hasCourseAccess && activeMedia?.url ? (
                                        activeMedia.type === 'video' ? (
                                            <video
                                                key={activeMedia.url}
                                                src={activeMedia.url}
                                                className="w-full h-full object-contain"
                                                controls
                                                playsInline
                                                controlsList="nodownload"
                                                onEnded={() => activeMedia.isLecture && markAsCompleted(currentLecture._id)}
                                                autoPlay={!activeMedia.isLecture || currentLectureIndex > 0}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <iframe
                                                key={activeMedia.url}
                                                src={activeMedia.url}
                                                title={activeMedia.title}
                                                className="w-full h-full bg-white"
                                                allowFullScreen
                                            />
                                        )
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={course.courseThumbnail}
                                                alt="Course Thumbnail"
                                                className="w-full h-full object-cover"
                                            />
                                            {!hasCourseAccess && (
                                                <div className='absolute inset-0 bg-black/60 flex items-center justify-center z-20'>
                                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white text-[10px] uppercase font-bold tracking-widest shadow-2xl flex flex-col items-center gap-3">
                                                        <Lock size={20} className="text-teal-400" />
                                                        <span>Enroll to unlock this course</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 space-y-4">
                                    {hasCourseAccess && activeMedia && (
                                        <div className="pb-4 border-b">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter text-teal-600 border-teal-200 mb-1">
                                                {activeMedia.type === 'video' ? 'Now Playing' : 'Now Viewing'}
                                            </Badge>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                                                {activeMedia.isLecture ? `${currentLectureIndex + 1}. ` : ""}{activeMedia.title}
                                            </h3>
                                        </div>
                                    )}

                                    <div className="flex items-baseline gap-2 pt-2">
                                        <h1 className='text-3xl font-extrabold text-gray-900'>INR {course.coursePrice}</h1>
                                        {course.coursePrice > 0 && <span className="text-sm text-gray-400 line-through">INR {course.coursePrice * 2}</span>}
                                        <span className="text-xs font-bold text-teal-600 ml-auto bg-teal-50 px-2 py-0.5 rounded">50% OFF</span>
                                    </div>

                                    <div className='space-y-3'>
                                        {!hasCourseAccess && (
                                            <BuyCourseButton courseId={courseId} coursePrice={course.coursePrice} />
                                        )}
                                        {hasCourseAccess && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span>Course Progress</span>
                                                    <span className="text-teal-600">{Math.round((completedLectures.length / course.lectures.length) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-teal-600 h-full transition-all duration-500"
                                                        style={{ width: `${(completedLectures.length / course.lectures.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 space-y-3 border-t">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">This course includes:</p>
                                        <ul className="space-y-2">
                                            <li className="flex items-center gap-2 text-xs text-gray-600"><Play size={14} className="text-teal-500" /> {courseAccessLabel}</li>
                                            <li className="flex items-center gap-2 text-xs text-gray-600"><BadgeInfo size={14} className="text-teal-500" /> Certificate of completion</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseDetail;
