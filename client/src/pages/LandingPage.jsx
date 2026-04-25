import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";

import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// import Navbar from "../components/Navbar";
import LMSBanner from "../assets/images/LandingPageBanner.jpg"
// TODO: Replace "LMSbanner.png" with the actual name of your mobile/tab banner image.
import LMSMobileBanner from "../assets/images/LandingPageBanner.jpg"


export default function LandingPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("login"); // login | signup

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  /* =======================
      FORM STATES
  ======================= */
  const [signupInput, setSignupInput] = useState({
    name: "",
    password: "",
    role: "student", // default role
  });

  const [loginInput, setLoginInput] = useState({
    name: "",
    password: "",
  });

  /* =======================
      API MUTATIONS
  ======================= */
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  /* =======================
      INPUT HANDLER
  ======================= */
  const changeInputHandler = (e, formType) => {
    const { name, value } = e.target;
    const normalizedValue =
      name === "name" ? value.replace(/\D/g, "").slice(0, 10) : value;

    if (formType === "signup") {
      setSignupInput((prev) => ({ ...prev, [name]: normalizedValue }));
    } else {
      setLoginInput((prev) => ({ ...prev, [name]: normalizedValue }));
    }
  };

  /* =======================
      FORM VALIDATION
  ======================= */
  const isValidMobile = (number) => /^\d{10}$/.test(number.trim());

  const isLoginFormValid =
    isValidMobile(loginInput.name) && loginInput.password.trim().length >= 6;

  const isSignupFormValid =
    isValidMobile(signupInput.name) &&
    signupInput.password.trim().length >= 6 &&
    signupInput.role !== "";

  /* =======================
      SUBMIT HANDLER
  ======================= */
  const handleRegistration = async (formType) => {
    if (formType === "signup") {
      if (!isValidMobile(signupInput.name)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      if (signupInput.password.trim().length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (!isSignupFormValid) {
        toast.error("Please fill all signup fields correctly");
        return;
      }
      await registerUser(signupInput);
    } else {
      if (!isValidMobile(loginInput.name)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }
      if (loginInput.password.trim().length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (!isLoginFormValid) {
        toast.error("Please fill all login fields correctly");
        return;
      }
      await loginUser(loginInput);
    }
  };

  /* =======================
      EFFECTS
  ======================= */
  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "Signup successful");
      setType("login");
    }

    if (registerError) {
      toast.error(registerError?.data?.message || "Signup failed");
    }

    if (loginError) {
      toast.error(loginError?.data?.message || "Login failed");
    }

    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "Login successful");

      // ✅ REDIRECT AFTER SUCCESSFUL LOGIN BASED ON ROLE
      if (loginData?.user?.role === "instructor") {
        navigate("/instructor/course");
      } else {
        navigate("/resources");
      }
    }
  }, [
    registerIsSuccess,
    registerData,
    registerError,
    loginIsSuccess,
    loginData,
    loginError,
    navigate,
  ]);

  return (
    <>
      {/* <Navbar /> */}

      <div className="min-h-screen flex flex-col mt-12">
        {/* HERO */}
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

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-[#192a5699]/60 pointer-events-none -z-10" />

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

        {/* CONTENT */}
        <section className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20 px-6 sm:px-12 lg:px-20 py-12 lg:py-12 bg-white">
          <div className="flex-1" >
            <div>
              <div className="w-full border-b-[5px] border-black pb-2 mb-6">
                <h1 className="text-3xl md:text-[48px] tracking-[-0.02em] leading-[50px] font-semibold text-[#005599] uppercase">
                  Capability Building for Modern Supply Chains
                </h1>
              </div>
              <h2 className="text-[20px] font-semibold text-[#495057] mt-8 line-height-[20px]">Overview</h2>
              <p className="text-gray-600 space-y-4 mt-2 text-[17px] line-height-[20px]">SCM Learning & Development is the capability enhancement initiative of SCM Connect, designed to build structured, practical, and performance-driven supply chain competencies.<br />
                Our programs are developed and delivered by industry practitioners, with a clear focus on execution, measurable outcomes, and business impact.
              </p>
              <h2 className="text-[20px] font-semibold text-[#495057] mt-8 line-height-[20px]">Our Focus Areas</h2>
              <ul className="list-disc ml-8 text-gray-600 mt-2">
                <li>Supply Chain Strategy & Operating Models</li>
                <li>Demand Planning & Forecasting</li>
                <li>Inventory & Working Capital Optimization</li>
                <li>Procurement & Strategic Sourcing</li>
                <li>Sales & Operations Planning (S&OP)</li>
                <li>Logistics & Distribution Management</li>
                <li>Supply Chain Analytics & Digital Transformation</li>
              </ul>

              <h2 className="text-[20px] font-semibold text-[#495057] mt-8 line-height-[20px]">Learning Essentials</h2>
              <p className="text-gray-600 mt-2">Our methodology emphasizes clarity, structure, and application.</p>
              <ul className="list-disc ml-8 text-gray-600">
                <li>Industry-led curriculum</li>
                <li>Case-based discussions</li>
                <li>Practical tools and frameworks</li>
                <li>Structured learning pathways</li>
              </ul>


              <h2 className="text-[20px] font-semibold text-[#495057] mt-8 line-height-[20px]">Program Formats</h2>
              <h3 className="text-[18px] font-semibold text-[#495057] mt-2 line-height-[20px]">Corporate Training Programs</h3>
              <p className="text-gray-600 mt-2">Customized interventions aligned to process, function, or leadership level.</p>
              <h3 className="text-[18px] font-semibold text-[#495057] mt-2 line-height-[20px]">Executive Workshops</h3>
              <p className="text-gray-600 mt-2">Focused sessions for senior management on strategy, transformation, and performance improvement.</p>
              <h3 className="text-[18px] font-semibold text-[#495057] mt-2 line-height-[20px]">Certification Programs</h3>
              <p className="text-gray-600 mt-2">Industry-recognized certifications to validate and enhance supply chain expertise.</p>
              <h3 className="text-[18px] font-semibold text-[#495057] mt-2 line-height-[20px]">Embedded Learning Engagements</h3>
              <p className="text-gray-600 mt-2">Capability development integrated within live projects and transformation initiatives.</p>
              <h3 className="text-[18px] font-semibold text-[#495057] mt-8 line-height-[20px]">Intended Audience</h3>
              <ul className="list-disc ml-8 text-gray-600">
                <li>Supply Chain & Operations Leaders</li>
                <li>Planning & Procurement Teams</li>
                <li>Logistics & Distribution Professionals</li>
                <li>Business Analysts</li>
                <li>Cross-functional Managers</li>
                <li>Organizations building internal supply chain capability</li>
              </ul>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN */}
            {type === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md sticky top-32 lg:top-40 self-start z-10"
              >
                <Card className="rounded-2xl shadow-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white text-center py-6">
                    <CardTitle className="text-3xl font-semibold">Login</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5 pt-6">
                    <div className="grid gap-2">
                      <Label className="text-gray-700 font-semibold">Username:</Label>
                      <Input
                        name="name"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Put your mobile number"
                        value={loginInput.name}
                        onChange={(e) => changeInputHandler(e, "login")}
                        className="bg-blue-50 border-gray-200 focus-visible:ring-[#007bff]"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-gray-700 font-semibold">Password:</Label>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? "text" : "password"}
                          name="password"
                          value={loginInput.password}
                          onChange={(e) => changeInputHandler(e, "login")}
                          className="bg-blue-50 border-gray-200 focus-visible:ring-[#007bff]"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      // disabled={!isLoginFormValid || loginIsLoading}
                      onClick={() => handleRegistration("login")}
                      className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white rounded-full py-6 font-bold shadow-md text-base"
                    >
                      {loginIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>

                    <button
                      onClick={() => setType("signup")}
                      className="text-sm text-[#005599] hover:underline"
                    >
                      Don’t have an account? Sign up
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* SIGNUP */}
            {type === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md sticky top-32 lg:top-40 self-start z-10"
              >
                <Card className="rounded-2xl shadow-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white text-center py-6">
                    <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-5 pt-6">
                    <div className="grid gap-2">
                      <Label className="text-gray-700 font-semibold">Username:</Label>
                      <Input
                        name="name"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Put your mobile number"
                        value={signupInput.name}
                        onChange={(e) => changeInputHandler(e, "signup")}
                        className="bg-blue-50 border-gray-200 focus-visible:ring-[#007bff]"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-gray-700 font-semibold">Password:</Label>
                      <div className="relative">
                        <Input
                          type={showSignupPassword ? "text" : "password"}
                          name="password"
                          value={signupInput.password}
                          onChange={(e) => changeInputHandler(e, "signup")}
                          className="bg-blue-50 border-gray-200 focus-visible:ring-[#007bff]"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-2 mt-2">
                      <Label className="mb-2">Role</Label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setSignupInput((prev) => ({ ...prev, role: "student" }))}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg border-2 transition-all font-semibold text-sm",
                            signupInput.role === "student"
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
                          )}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupInput((prev) => ({ ...prev, role: "instructor" }))}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg border-2 transition-all font-semibold text-sm",
                            signupInput.role === "instructor"
                              ? "border-[#0a73e8] bg-blue-50 text-[#0a73e8]"
                              : "border-gray-200 text-gray-400 hover:border-gray-300"
                          )}
                        >
                          Instructor
                        </button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4">
                    <Button
                      // disabled={!isSignupFormValid || registerIsLoading}
                      onClick={() => handleRegistration("signup")}
                      className="w-full bg-[#007bff] hover:bg-[#0056b3] text-white rounded-full py-6 font-bold shadow-md text-base"
                    >
                      {registerIsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        "Signup"
                      )}
                    </Button>

                    <button
                      onClick={() => setType("login")}
                      className="text-sm text-[#005599] hover:underline"
                    >
                      Already have an account? Login
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="text-center py-4 text-sm text-gray-500 bg-white">
          © 2026 SCM Connect Pvt. Ltd. All rights reserved.
        </footer>
      </div>
    </>
  );
}
