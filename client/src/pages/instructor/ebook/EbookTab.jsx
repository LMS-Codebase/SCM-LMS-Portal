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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useEditEbookMutation,
    useGetEbookByIdQuery,
    usePublishEbookMutation,
} from "@/features/api/ebookApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import {
    Plus,
    Loader2,
    Save,
    Send,
    BookOpen,
    Trophy,
    User,
    ImageIcon,
    FileText,
    Layers
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const EbookTab = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        authorName: "",
        authorBio: "",
        price: "",
        noOfPages: "",
        validityPeriod: "Lifetime",
        yearOfPublication: "",
        edition: "",
        language: "",
        publisherName: "",
        isbn: "",
        thumbnail: null,
        filePDFUrl: null,
        authorImage: null,
        resource: "",
        domain: [],
    });

    const { ebookId } = useParams();
    const navigate = useNavigate();

    const {
        data: ebookData,
        isLoading: ebookLoading,
        refetch,
    } = useGetEbookByIdQuery(ebookId, { refetchOnMountOrArgChange: true });

    const [editEbook, { isLoading: isUpdating }] = useEditEbookMutation();
    const [publishEbook] = usePublishEbookMutation();

    const { data: resourceData } = useGetPublishedResourcesQuery();
    const { data: domainData } = useGetDomainsQuery();

    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const [previewAuthorImage, setPreviewAuthorImage] = useState("");

    useEffect(() => {
        if (ebookData?.ebook) {
            const ebook = ebookData.ebook;
            setInput({
                title: ebook.title || "",
                description: ebook.description || "",
                authorName: ebook.authorName || "",
                authorBio: ebook.authorBio || "",
                price: ebook.price !== undefined && ebook.price !== null ? ebook.price : "",
                noOfPages: ebook.noOfPages || "",
                validityPeriod: ebook.validityPeriod || "Lifetime",
                yearOfPublication: ebook.yearOfPublication || "",
                edition: ebook.edition || "",
                language: ebook.language || "",
                publisherName: ebook.publisherName || "",
                isbn: ebook.isbn || "",
                thumbnail: null,
                filePDFUrl: null,
                authorImage: null,
                resource: ebook.resource?._id || ebook.resource || "",
                domain: ebook.domain ? (Array.isArray(ebook.domain) ? ebook.domain.map(d => d._id || d) : [ebook.domain._id || ebook.domain]) : [],
            });
            if (ebook.thumbnail) {
                setPreviewThumbnail(ebook.thumbnail);
            }
            if (ebook.authorImage) {
                setPreviewAuthorImage(ebook.authorImage);
            }
        }
    }, [ebookData]);

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const selectValidityPeriod = (value) => {
        setInput({ ...input, validityPeriod: value });
    };

    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, thumbnail: file });
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const selectAuthorImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, authorImage: file });
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewAuthorImage(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const selectPdf = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, filePDFUrl: file });
        }
    };

    const updateEbookHandler = async () => {
        try {
            if (!input.resource || input.domain.length === 0) {
                toast.error("Resource classification and at least one Domain must be selected.");
                return;
            }

            const formData = new FormData();
            formData.append("title", input.title);
            formData.append("description", input.description);
            formData.append("authorName", input.authorName);
            formData.append("authorBio", input.authorBio);
            formData.append("price", input.price);
            formData.append("noOfPages", input.noOfPages);
            formData.append("validityPeriod", input.validityPeriod);
            formData.append("yearOfPublication", input.yearOfPublication);
            formData.append("edition", input.edition);
            formData.append("language", input.language);
            formData.append("publisherName", input.publisherName);
            formData.append("isbn", input.isbn);
            formData.append("resource", input.resource);
            input.domain?.forEach(id => formData.append("domain", id));

            if (input.thumbnail) formData.append("thumbnail", input.thumbnail);
            if (input.filePDFUrl) formData.append("filePDFUrl", input.filePDFUrl);
            if (input.authorImage) formData.append("authorImage", input.authorImage);

            await editEbook({ formData, ebookId }).unwrap();
            toast.success("E-book updated successfully");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update e-book");
        }
    };

    const publishStatusHandler = async (action) => {
        try {
            const response = await publishEbook({ ebookId, query: action }).unwrap();
            toast.success(response.message);
            refetch();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (ebookLoading) return <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-teal-600" />
    </div>;

    return (
        <Card className="border-none shadow-2xl overflow-hidden rounded-2xl bg-white">
            <CardHeader className="bg-gray-50/50 border-b p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-gray-900">Manage Your E-Book</CardTitle>
                    <CardDescription className="text-gray-500 font-medium italic">
                        Refine your e-book's presence, content, and accessibility.
                    </CardDescription>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        disabled={isUpdating}
                        className={`font-bold transition-all ${ebookData?.ebook.isPublished ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}
                        onClick={() => publishStatusHandler(ebookData?.ebook.isPublished ? "false" : "true")}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {ebookData?.ebook.isPublished ? "Unpublish E-Book" : "Launch E-Book"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-8 space-y-12">
                {/* SECTION 1: IDENTITY */}
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                            <BookOpen size={16} />
                            Book Details
                        </h3>
                        {/* <p className="text-xs text-gray-500 italic leading-relaxed">This information defines how your book appears in searches and listings.</p> */}
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">E-Book Title<span className="text-red-500">*</span></Label>
                            <Input
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="bg-gray-50/30 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Description<span className="text-red-500">*</span></Label>
                            <Textarea
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                rows={4}
                                className="bg-gray-50/30 resize-none"
                            />
                        </div>
                    </div>
                </div>


                {/* SECTION 3: SPECIFICATIONS */}
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-4">
                        {/* <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                            {/* <DollarSign size={16} /> */}
                        {/* Commercials */}
                        {/* </h3> */}
                    </div>
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Listing Price (INR)<span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="0"
                                name="price"
                                value={input.price}
                                onChange={changeEventHandler}
                                onWheel={(e) => e.target.blur()}
                                className="bg-gray-50/30 font-bold text-teal-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Total Page Count</Label>
                            <Input
                                type="number"
                                min="1"
                                name="noOfPages"
                                value={input.noOfPages}
                                onChange={changeEventHandler}
                                onWheel={(e) => e.target.blur()}
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Access Validity</Label>
                            <Select value={input.validityPeriod} onValueChange={selectValidityPeriod}>
                                <SelectTrigger className="bg-gray-50/30 h-10 focus:ring-teal-500">
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

                    {/* NEW FIELDS: YEAR, EDITION, LANGUAGE, PUBLISHER, ISBN */}
                    <div className="lg:col-span-1"></div>
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Year of Publication</Label>
                            <Input
                                type="number"
                                min="1900"
                                name="yearOfPublication"
                                value={input.yearOfPublication}
                                onChange={changeEventHandler}
                                onWheel={(e) => e.target.blur()}
                                placeholder="e.g. 2024"
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Edition</Label>
                            <Input
                                name="edition"
                                value={input.edition}
                                onChange={changeEventHandler}
                                placeholder="e.g. 1st Edition"
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Language</Label>
                            <Input
                                name="language"
                                value={input.language}
                                onChange={changeEventHandler}
                                placeholder="e.g. English"
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Publisher Name</Label>
                            <Input
                                name="publisherName"
                                value={input.publisherName}
                                onChange={changeEventHandler}
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="font-semibold text-gray-700">ISBN Number (13 digits)</Label>
                            <Input
                                name="isbn"
                                value={input.isbn}
                                onChange={changeEventHandler}
                                maxLength={17}
                                placeholder="Please provide a valid 13-digit ISBN number (hyphens allowed) e.g. 978-34-163-1410-3"
                                className="bg-gray-50/30 font-mono tracking-wider"
                            />
                            <p className="text-[15px] text-gray-400 italic">Format: 978-34-163-1410-3 (digits and hyphens allowed)</p>
                        </div>
                    </div>
                </div>





                {/* NEW SECTION: CATEGORIZATION */}
                <div className="grid lg:grid-cols-3 gap-10 border-t pt-6">
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                            <Layers size={16} />
                            Categorization
                        </h3>
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




                {/* SECTION 2: AUTHORSHIP */}
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                            <User size={16} />
                            ABOUT THE AUTHOR
                        </h3>
                        {/* <p className="text-xs text-gray-500 italic leading-relaxed">Establish credibility by providing author details.</p> */}
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Author Name<span className="text-red-500">*</span></Label>
                            <Input
                                name="authorName"
                                value={input.authorName}
                                onChange={changeEventHandler}
                                className="bg-gray-50/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Author Biography</Label>
                            <Textarea
                                name="authorBio"
                                value={input.authorBio}
                                onChange={changeEventHandler}
                                rows={3}
                                className="bg-gray-50/30 resize-none"
                            />
                        </div>

                        {/* Author Image Upload */}
                        <div className="space-y-4 pt-2">
                            <Label className="font-semibold text-gray-700 flex items-center gap-2 underline decoration-teal-200 underline-offset-4">
                                <ImageIcon size={14} />
                                Author Image
                            </Label>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                <Input
                                    type="file"
                                    onChange={selectAuthorImage}
                                    accept="image/*"
                                    className="bg-gray-50 border-dashed border-2 hover:border-teal-400 cursor-pointer w-full sm:w-fit"
                                />
                                {previewAuthorImage && (
                                    <img
                                        src={previewAuthorImage}
                                        alt="Author Preview"
                                        className="w-24 h-24 object-cover rounded-full shadow-md border-4 border-white"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* SECTION 4: ASSETS */}
                <div className="grid lg:grid-cols-3 gap-10 border-t pt-12">
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-teal-700 flex items-center gap-2">
                            <FileText size={16} />
                            Media & Assets
                        </h3>
                        <p className="text-xs text-gray-500 italic leading-relaxed">Upload cover page and Book PDF.</p>
                    </div>
                    <div className="lg:col-span-2 space-y-10">
                        {/* Thumbnail Upload */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-gray-700 flex items-center gap-2 underline decoration-teal-200 underline-offset-4">
                                <ImageIcon size={14} />
                                Cover Thumbnail (Image)
                            </Label>
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <Input
                                    type="file"
                                    onChange={selectThumbnail}
                                    accept="image/*"
                                    className="bg-gray-50 border-dashed border-2 hover:border-teal-400 cursor-pointer w-full sm:w-fit"
                                />
                                {previewThumbnail && (
                                    <img
                                        src={previewThumbnail}
                                        alt="Cover Preview"
                                        className="w-40 h-56 object-cover rounded-lg shadow-xl border-4 border-white"
                                    />
                                )}
                            </div>
                        </div>

                        {/* PDF Upload */}
                        <div className="space-y-4">
                            <Label className="font-semibold text-gray-700 flex items-center gap-2 underline decoration-teal-200 underline-offset-4">
                                <FileText size={14} />
                                E-Book Manuscript (PDF)
                            </Label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <Input
                                    type="file"
                                    onChange={selectPdf}
                                    accept=".pdf"
                                    className="bg-gray-50 border-dashed border-2 hover:border-teal-400 cursor-pointer w-full sm:w-fit"
                                />
                                {ebookData?.ebook.filePDFUrl && !input.filePDFUrl && (
                                    <a
                                        href={ebookData.ebook.filePDFUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-bold text-teal-600 hover:underline bg-teal-50 px-4 py-2 rounded-lg"
                                    >
                                        View Current PDF
                                    </a>
                                )}
                                {input.filePDFUrl && (
                                    <p className="text-sm font-bold text-teal-600 flex items-center gap-2">
                                        <FileText size={16} />
                                        {input.filePDFUrl.name} ready to save
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-4 pt-12 border-t mt-12">
                    <Button
                        onClick={() => navigate("/instructor/ebook")}
                        disabled={isUpdating}
                        variant="outline"
                        className="px-10 border-gray-200 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isUpdating}
                        onClick={updateEbookHandler}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-12 shadow-lg shadow-teal-100"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default EbookTab;
