import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAddEbookMutation } from "@/features/api/ebookApi";
import { Loader2, BookPlus, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddEbook = () => {
    const [title, setTitle] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [validityPeriod, setValidityPeriod] = useState("Lifetime");

    const [addEbook, { data, isLoading, error, isSuccess }] = useAddEbookMutation();
    const navigate = useNavigate();

    const createEbookHandler = async () => {
        if (!title || !authorName || !description || !price) {
            toast.error("Please fill in all the required fields.");
            return;
        }
        await addEbook({ title, authorName, description, price: Number(price), validityPeriod });
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "E-book created successfully.");
            navigate(`/instructor/ebook`);
        }
        if (error) {
            toast.error(error?.data?.message || "Failed to create e-book");
        }
    }, [isSuccess, error, data, navigate]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-teal-50 hover:text-teal-600 transition-all"
                    onClick={() => navigate("/instructor/ebook")}
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="font-bold text-3xl text-gray-900 flex items-center gap-2">
                        <BookPlus className="text-teal-600" />
                        New E-Book Creation
                    </h1>
                    <p className="text-gray-500 mt-1 italic">Provide the foundational details for your E-Book.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">E-Book Title<span className="text-red-500 text-lg">*</span></Label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Supply Chain Terms Made Simple"
                            className="focus-visible:ring-teal-500 border-gray-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">Author Name<span className="text-red-500 text-lg">*</span></Label>
                        <Input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="e.g. Mr. Mohit Gauba"
                            className="focus-visible:ring-teal-500 border-gray-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">Short Description<span className="text-red-500 text-lg">*</span></Label>
                    <Input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe what readers will learn from this book..."
                        className="focus-visible:ring-teal-500 border-gray-200"
                    />
                </div>

                <div className="space-y-2 w-full md:w-1/2">
                    <Label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">Price (INR)<span className="text-red-500 text-lg">*</span></Label>
                    <Input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="e.g. 1999  "
                        className="focus-visible:ring-teal-500 border-gray-200"
                    />
                </div>

                <div className="space-y-2 w-full md:w-1/2">
                    <Label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">Access Validity</Label>
                    <Select value={validityPeriod} onValueChange={setValidityPeriod}>
                        <SelectTrigger className="focus:ring-teal-500 border-gray-200">
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

                <div className="pt-6 border-t flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/instructor/ebook")}
                        className="px-8 border-gray-200 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isLoading}
                        onClick={createEbookHandler}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-10 shadow-lg shadow-teal-100 font-bold"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Create E-Book"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddEbook;
