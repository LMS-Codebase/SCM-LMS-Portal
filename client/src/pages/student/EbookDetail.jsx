import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeInfo, Mail, Globe, Users, Star, BookOpen, FileText, Download, User, ArrowLeft, Loader2 } from 'lucide-react'
import React, { useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetEbookByIdQuery, useRateEbookMutation } from '@/features/api/ebookApi'
import { useLoadUserQuery, useToggleCartMutation } from '@/features/api/authApi'
import { useCreateOrderMutation } from '@/features/api/purchaseApi'
import { ShoppingCart, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import 'react-quill/dist/quill.snow.css'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useState } from 'react'

const EbookDetail = () => {
    const params = useParams();
    const ebookId = params.ebookId;
    const navigate = useNavigate();

    // Getting user via RTK Query
    const { data: userData, refetch: refetchUser } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
    const user = userData?.user;

    const { data, isLoading, isError } = useGetEbookByIdQuery(ebookId);
    const [toggleCart, { isLoading: isCartLoading }] = useToggleCartMutation();
    const [rateEbook] = useRateEbookMutation();
    const [createOrder, { isLoading: isEnrolling }] = useCreateOrderMutation();

    const [showViewer, setShowViewer] = useState(false);

    const authorSectionRef = useRef(null);

    const scrollToAuthor = () => {
        if (authorSectionRef.current) {
            authorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Cart Logic replaces Razorpay direct checkout

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
    );

    if (isError || !data?.ebook) return (
        <div className="text-center mt-20 text-red-500 font-semibold text-lg italic">
            Error loading e-book details. Please try again later.
        </div>
    );

    const { ebook } = data;
    const isPurchased = user?.enrolledEbooks?.some(e => (e._id || e) === ebookId);
    const isOwner = user?._id === (ebook.creator?._id || ebook.creator);
    const isInCart = user?.cart?.some(item => item.resourceType === "ebook" && String(item.resourceId) === String(ebookId));
    const hasEbookAccess = isPurchased || isOwner || (Number(ebook?.price || 0) === 0 && isInCart);
    const ebookAccessExpiration = user?.accessExpirations?.find(
        (exp) => String(exp.resourceId?._id || exp.resourceId) === ebookId
    );
    const ebookAccessLabel =
        ebook?.validityPeriod === "Lifetime"
            ? "Full lifetime access"
            : hasEbookAccess && ebookAccessExpiration?.expiresAt
                ? `Access until ${new Date(ebookAccessExpiration.expiresAt).toLocaleDateString("en-GB")}`
                : `${ebook?.validityPeriod || "Lifetime"} access from purchase`;

    const ebookRatings = ebook?.ratings || [];
    const avgRating = ebookRatings.length > 0
        ? (ebookRatings.reduce((sum, r) => sum + r.rating, 0) / ebookRatings.length).toFixed(1)
        : "0.0";

    const handleRateEbook = async (ratingVal) => {
        if (!user) return toast.error("Please login to rate.");
        try {
            const res = await rateEbook({ ebookId: ebook._id, rating: ratingVal }).unwrap();
            if (res.success) {
                toast.success(res.message);
                window.location.reload();
            }
        } catch (error) {
            toast.error(error?.data?.message || "Rating failed");
        }
    }

    const handleToggleCart = async () => {
        if (!user) {
            toast.error("Please login to proceed.");
            return;
        }
        try {
            const res = await toggleCart({ resourceId: ebookId, resourceType: 'ebook' }).unwrap();
            if (res.success) {
                toast.success(res.message);
                await refetchUser();
            }
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update cart");
        }
    };

    const handleGetFreeEbook = async () => {
        if (!user) {
            toast.error("Please login to proceed.");
            return;
        }
        try {
            const res = await createOrder({ resourceId: ebookId, resourceType: 'ebook' }).unwrap();
            if (res.success) {
                toast.success("E-Book added to My Learning!");
                await refetchUser(); // Refresh user data so isPurchased becomes true
                // Open it smoothly in the viewer
                if (ebook.filePDFUrl) {
                    setShowViewer(true);
                }
            }
        } catch (error) {
            toast.error("Failed to get free E-Book");
        }
    };

    const handleReadEbook = () => {
        if (!user) {
            toast.error("Please login to proceed.");
            return;
        }

        if (!hasEbookAccess) {
            toast.error("You don't have access to this E-Book.");
            return;
        }

        if (!ebook.filePDFUrl) {
            toast.error("E-Book file is not available right now.");
            return;
        }

        // Make the PDF visible on the webpage directly!
        setShowViewer(true);
    };
    const isActionLoading = false;
    return (
        <div className='mt-16 space-y-10 pb-20'>
            {/* HERO SECTION */}
            <div className='bg-[#1c1d1f] text-white'>
                <div className='max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4'>
                    <div className='flex items-center gap-2 mb-2'>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="text-gray-400 hover:text-white hover:bg-white/10 p-0 h-auto gap-1"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Resources</span>
                        </Button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        <Badge className="bg-teal-600 hover:bg-teal-700 border-none uppercase tracking-wider text-[10px]">E-Book</Badge>
                        <Badge variant="outline" className="text-teal-400 border-teal-900/50">
                            {ebook.noOfPages > 0 ? `${ebook.noOfPages} Pages` : "NOT MENTIONED"}
                        </Badge>
                    </div>
                    <h1 className='font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight'>{ebook.title}</h1>

                    <div className='flex flex-wrap items-center gap-6 mt-2'>
                        <div className='flex items-center gap-2'>
                            <p className='text-sm text-gray-400'>Published by <span onClick={scrollToAuthor} className='text-teal-400 font-bold hover:underline cursor-pointer'>{ebook.authorName || "LMS Publisher"}</span></p>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                            <Globe size={16} className="text-gray-500" />
                            <p>Language: {ebook.language || "NOT MENTIONED"}</p>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-400'>
                            <BadgeInfo size={16} className="text-gray-500" />
                            <p>Last updated: {new Date(ebook.updatedAt).toLocaleDateString("en-GB")}</p>
                        </div>
                    </div>

                    {/* RATING SECTION */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 border-t border-gray-700/50 pt-4 w-full max-w-xl">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-300">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span>{avgRating} Average Rating</span>
                            <span className="text-xs font-normal text-gray-400">({ebookRatings.length})</span>
                        </div>
                        {user && (
                            <div className="flex items-center gap-3 bg-[#2a2b2d] p-2 rounded-lg border border-gray-700">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rate E-Book:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const userInitialReview = ebookRatings.find(r => r.userId === user?._id)?.rating || 0;
                                        return (
                                            <Star
                                                key={star}
                                                size={18}
                                                onClick={() => handleRateEbook(star)}
                                                className={`cursor-pointer transition-all hover:scale-125 hover:text-yellow-500 ${star <= userInitialReview ? "text-yellow-500 fill-yellow-500" : "text-gray-500"}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-12'>
                {/* LEFT SIDE: CONTENT & AUTHOR */}
                <div className='w-full lg:w-2/3 space-y-12'>

                    {/* DESCRIPTION OR VIEWER */}
                    {showViewer ? (
                        <div className='space-y-4 animate-in fade-in zoom-in duration-500'>
                            <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center justify-between'>
                                <span className="flex items-center gap-2"><BookOpen size={24} className="text-teal-600" />E-Book Reader</span>
                                <Button variant="outline" size="sm" onClick={() => setShowViewer(false)}>Close Reader</Button>
                            </h2>
                            <div className="w-full bg-[#333] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                                <iframe
                                    src={`${ebook.filePDFUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    title="Ebook PDF Viewer"
                                    className="w-full h-[85vh] border-none"
                                    frameBorder="0"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2'>
                                <BookOpen size={24} className="text-teal-600" />
                                About this E-Book
                            </h2>
                            <div className="ql-snow">
                                <div
                                    className="ql-editor p-0 text-gray-700 leading-relaxed prose prose-teal max-w-none"
                                    dangerouslySetInnerHTML={{ __html: ebook.description }}
                                />
                            </div>
                        </div>
                    )}

                    {/* PUBLICATION DETAILS */}
                    <div className='space-y-6 pt-8'>
                        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2'>
                            <FileText size={24} className="text-teal-600" />
                            Publication Details
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><Globe size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Language</p>
                                    <p className='font-semibold text-gray-900'>{ebook.language || "NOT MENTIONED"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><Star size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Edition</p>
                                    <p className='font-semibold text-gray-900'>{ebook.edition || "NOT MENTIONED"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><Users size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Publisher</p>
                                    <p className='font-semibold text-gray-900'>{ebook.publisherName || "NOT MENTIONED"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><BookOpen size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Publication Year</p>
                                    <p className='font-semibold text-gray-900'>{ebook.yearOfPublication > 0 ? ebook.yearOfPublication : "NOT MENTIONED"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><FileText size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>ISBN Number</p>
                                    <p className='font-semibold text-gray-900 font-mono tracking-wider'>{ebook.isbn && ebook.isbn !== "N/A" ? ebook.isbn : "NOT MENTIONED"}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white rounded-lg shadow-sm text-teal-600'><BookOpen size={18} /></div>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Length</p>
                                    <p className='font-semibold text-gray-900'>{ebook.noOfPages > 0 ? `${ebook.noOfPages} Pages` : "NOT MENTIONED"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AUTHOR SECTION */}
                    <div className='space-y-6 pt-8 scroll-mt-32' ref={authorSectionRef}>
                        <h2 className='text-2xl font-bold text-gray-900 border-b pb-2 flex items-center gap-2'>
                            <User size={24} className="text-teal-600" />
                            About the Author
                        </h2>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex flex-col items-center gap-4 shrink-0">
                                <Avatar className="h-32 w-32 ring-4 ring-teal-50 shadow-lg"><AvatarImage src={ebook.authorImage || ebook.creator?.photoUrl} alt={ebook.authorName} />
                                    <AvatarFallback className="bg-teal-100 text-teal-700 text-4xl font-bold">
                                        {ebook.authorName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-teal-700">{ebook.authorName}</h3>
                                    <p className="text-gray-500 font-medium">Author</p>
                                </div>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                                    {ebook.authorBio || "A distinguished expert in the field, dedicated to sharing deep industry insights through comprehensive literature."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: PURCHASE CARD */}
                <div className='w-full lg:w-1/3'>
                    <div className='sticky top-28'>
                        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl group border-t-4 border-teal-600">
                            <CardContent className="p-0 flex flex-col">
                                <div className='w-full aspect-video relative overflow-hidden bg-gray-50'>
                                    {ebook.thumbnail ? (
                                        <img
                                            src={ebook.thumbnail}
                                            alt={ebook.title}
                                            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-teal-50">
                                            <FileText size={60} className="text-teal-200" />
                                        </div>
                                    )}
                                    <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors'></div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <h1 className='text-3xl font-extrabold text-gray-900'>INR {ebook.price}</h1>
                                        {ebook.price > 0 && <span className="text-sm text-gray-400 line-through">INR {ebook.price * 2}</span>}
                                        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-50 border-none ml-auto">50% OFF</Badge>
                                    </div>

                                    <div className='space-y-3'>
                                        {hasEbookAccess ? (
                                            <Button
                                                onClick={handleReadEbook}
                                                className='w-full h-12 bg-teal-600 hover:bg-teal-700 text-base font-bold shadow-lg shadow-teal-100 gap-2'
                                            >
                                                <BookOpen size={18} />
                                                Read E-Book
                                            </Button>
                                        ) : ebook.price === 0 ? (
                                            <Button
                                                onClick={handleGetFreeEbook}
                                                disabled={isEnrolling}
                                                className='w-full h-12 bg-teal-600 hover:bg-teal-700 text-base font-bold shadow-lg shadow-teal-100 gap-2'
                                            >
                                                {isEnrolling ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />}
                                                Get Free E-Book
                                            </Button>
                                        ) : (
                                            <Button
                                                disabled={isCartLoading}
                                                onClick={handleToggleCart}
                                                variant={isInCart ? "outline" : "default"}
                                                className={isInCart ? 'w-full h-12 font-bold border-teal-600 text-teal-700 hover:bg-teal-50 shadow-none' : 'w-full bg-teal-600 hover:bg-teal-700 font-bold h-12 shadow-lg shadow-teal-100'}
                                            >
                                                {isCartLoading ? (
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                                ) : isInCart ? (
                                                    <><Check className="mr-2 h-5 w-5" /> Added to Cart</>
                                                ) : (
                                                    <><ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart</>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="pt-6 space-y-4 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Included with your purchase:</p>
                                        <ul className="space-y-3 font-medium">
                                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center">
                                                    <Globe size={12} className="text-teal-600" />
                                                </div>
                                                {ebookAccessLabel}
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center">
                                                    <FileText size={12} className="text-teal-600" />
                                                </div>
                                                High-quality PDF file
                                            </li>
                                            <li className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="h-5 w-5 rounded-full bg-teal-50 flex items-center justify-center">
                                                    <BookOpen size={12} className="text-teal-600" />
                                                </div>
                                                Access on mobile and web
                                            </li>
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

export default EbookDetail;
