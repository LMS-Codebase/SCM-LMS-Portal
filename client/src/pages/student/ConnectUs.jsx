import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { Loader2 } from 'lucide-react';
import LMSBanner from "../../assets/images/LandingPageBanner.jpg";
import LMSMobileBanner from "../../assets/images/LandingPageBanner.jpg";

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
        <div className="min-h-screen flex flex-col mt-12">
            {/* HERO SECTION matching Landing Page */}
            <section className="relative w-full h-[50vh] md:h-[55vh] flex items-center">
                {/* DESKTOP IMAGE */}
                <img
                    src={LMSBanner}
                    alt="Desktop Banner"
                    className="absolute inset-0 w-full h-full object-cover object-center hidden md:block -z-10"
                />

                {/* MOBILE/TAB IMAGE */}
                <img
                    src={LMSMobileBanner}
                    alt="Mobile Banner"
                    className="absolute inset-0 w-full h-full object-cover object-center block md:hidden -z-10"
                />

                <div className="absolute inset-0 bg-[#192A56]/60 pointer-events-none -z-10" />

                {/* BANNER CONTENT */}
                <div className="px-6 sm:px-12 lg:px-32 w-full z-10 flex flex-col items-start pt-4">
                    <h1 className="text-4xl sm:text-4xl lg:text-[42px] font-medium text-white mb-3 max-w-4xl tracking-tight drop-shadow-sm">
                        Supply Chain E-Learning Platform
                    </h1>
                    <p className="text-base sm:text-lg text-white/95 font-normal tracking-normal max-w-2xl mb-6 drop-shadow-sm">
                        Empowering Supply Chains Through Smarter Learning
                    </p>
                </div>
            </section>

            {/* CONTACT FORM CONTAINER */}
            <div className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-8 py-12 flex flex-col justify-start items-center">

                {/* Title Line matches screenshot */}
                <div className="w-full border-b-[3px] border-[#007bff] pb-3 mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#007bff] uppercase tracking-wide">
                        Contact Us
                    </h1>
                </div>

                {/* Form Wrapper */}
                <div className="w-full p-8 md:p-10 shadow-sm rounded-b-xl rounded-none border border-gray-300">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="name" className="text-[15px] font-semibold text-gray-800">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                className={`bg-blue-50 focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm h-11 ${errors.name ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
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
                                className={`bg-blue-50 focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm h-11 ${errors.mobile ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
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
                                className="bg-blue-50 border-none focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm h-11"
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
                                className="bg-blue-50 border-none focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm h-11"
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
                                className="bg-blue-50 border-none focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm h-11"
                                value={form.designation}
                                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <Label htmlFor="comments" className="text-[15px] font-semibold text-gray-800">Message / Query <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="comments"
                                placeholder="Enter your message or query"
                                className={`bg-blue-50 focus-visible:ring-1 focus-visible:ring-[#007bff] rounded-sm min-h-[100px] resize-y p-3 font-mono text-sm ${errors.comments ? 'border border-red-500 ring-1 ring-red-500' : 'border-none'}`}
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
                                className="w-full bg-[#007bff] hover:bg-blue-700 text-white rounded-md h-12 text-base font-medium tracking-wide transition-colors"
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