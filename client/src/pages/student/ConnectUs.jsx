import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { Loader2 } from 'lucide-react';
import LMSBanner from "../../assets/images/LMSBanner.jpeg";

const ConnectUs = () => {
    const [form, setForm] = useState({
        name: "",
        mobile: "",
        email: "",
        organization: "",
        designation: "",
        comments: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};

        if (!form.name.trim()) newErrors.name = true;
        if (!form.comments.trim()) newErrors.comments = true;

        if (!form.mobile.trim()) {
            newErrors.mobile = true;
        } else if (!/^\d{10}$/.test(form.mobile.trim())) {
            newErrors.mobile = "invalid";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.mobile === "invalid") {
                toast.error("Please enter a valid 10-digit mobile number.");
            } else {
                toast.error("Please fill all mandatory fields correctly.");
            }
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            await emailjs.send(
                'service_tbn6xnw',   // Replace with your EmailJS Service ID 
                'template_yif35ac',  // Replace with your EmailJS Template ID
                form,
                'EgLyuxCGEYbv2EOuj'    // Replace with your EmailJS Public Key 
            );

            toast.success("Message sent successfully! We'll be in touch.");
            setForm({ name: "", mobile: "", email: "", organization: "", designation: "", comments: "" });
            setErrors({});
        } catch (error) {
            console.error("Contact form error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pt-[72px]">
            {/* HERO SECTION matching Landing Page */}
            <section
                className="relative h-[300px] md:h-[380px] flex items-center px-10 text-white"
                style={{
                    backgroundImage: `url(${LMSBanner})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-[#002f4b]/10" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 max-w-xl"
                />
            </section>

            {/* CONTACT FORM CONTAINER */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-12 flex flex-col justify-start items-center">

                {/* Title Line matches screenshot */}
                <div className="w-full border-b-[3px] border-teal-500 pb-3 mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-teal-600 uppercase tracking-wide">
                        Contact Us
                    </h1>
                </div>

                {/* Form Wrapper */}
                <div className="w-full p-8 md:p-10 bg-teal-100/30 shadow-sm rounded-b-xl rounded-none border border-gray-300">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="name" className="text-[15px] font-semibold text-gray-800">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                className={`bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm h-11 ${errors.name ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                }}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="mobile" className="text-[15px] font-semibold text-gray-800">Mobile <span className="text-red-500">*</span></Label>
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="Enter your mobile number"
                                className={`bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm h-11 ${errors.mobile ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
                                value={form.mobile}
                                onChange={(e) => {
                                    setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) });
                                    if (errors.mobile) setErrors({ ...errors, mobile: undefined });
                                }}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="email" className="text-[15px] font-semibold text-gray-800">Email ID</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm h-11"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="organization" className="text-[15px] font-semibold text-gray-800">Organization</Label>
                            <Input
                                id="organization"
                                type="text"
                                placeholder="Enter your organization"
                                className="bg-white border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm h-11"
                                value={form.organization}
                                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="designation" className="text-[15px] font-semibold text-gray-800">Designation</Label>
                            <Input
                                id="designation"
                                type="text"
                                placeholder="Enter your designation"
                                className="bg-white border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm h-11"
                                value={form.designation}
                                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="comments" className="text-[15px] font-semibold text-gray-800">Message / Query <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="comments"
                                placeholder="Enter your message or query"
                                className={`bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-sm min-h-[100px] resize-y p-3 font-mono text-sm ${errors.comments ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
                                value={form.comments}
                                onChange={(e) => {
                                    setForm({ ...form, comments: e.target.value });
                                    if (errors.comments) setErrors({ ...errors, comments: undefined });
                                }}
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-md h-12 text-base font-medium tracking-wide transition-colors"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConnectUs;