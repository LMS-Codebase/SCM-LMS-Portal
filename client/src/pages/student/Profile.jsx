import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Globe, User as UserIcon, Phone, ShoppingCart } from "lucide-react";
import React from "react";
import Course from "./Course";
import { useLoadUserQuery, useUpdateUserMutation, useToggleCartMutation } from "@/features/api/authApi";
import { useCreateOrderMutation, useVerifyPaymentMutation } from "@/features/api/purchaseApi";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Profile = () => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState([{ title: "", link: "" }]);
  const [profilePhoto, setProfilePhoto] = useState("");

  const [toggleCart] = useToggleCartMutation();
  const [createOrder, { isLoading: isOrderLoading }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const { data, isLoading, refetch } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
  const [updateUser, { data: updateUserData, isLoading: updateUserIsLoading, isError, error, isSuccess }] = useUpdateUserMutation();

  const user = data?.user;
  const location = useLocation();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      if (user.socialLinks && user.socialLinks.length > 0) {
        setSocialLinks(user.socialLinks);
      } else {
        setSocialLinks([{ title: "", link: "" }]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData?.message || "Profile updated.");
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  }, [error, updateUserData, isSuccess, isError, refetch]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { title: "", link: "" }]);
  };

  const handleRemoveSocialLink = (index) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updatedLinks.length > 0 ? updatedLinks : [{ title: "", link: "" }]);
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index][field] = value;
    setSocialLinks(updatedLinks);
  };

  const handleRemoveFromCart = async (resourceId, resourceType) => {
    try {
      await toggleCart({ resourceId, resourceType }).unwrap();
      toast.success("Item removed from cart");
      refetch();
    } catch (error) {
      toast.error("Failed to remove item from cart");
    }
  };

  const handleCartCheckout = async () => {
    try {
      const orderResponse = await createOrder({ isCartCheckout: true }).unwrap();
      if (orderResponse.success) {
        if (orderResponse.free) {
          toast.success("Cart resources acquired for Free!");
          await refetch();
          return;
        }

        const order = orderResponse.order;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_API_KEY || "rzp_test_your_public_key",
          amount: order.amount,
          currency: order.currency,
          name: "LMS Portal",
          description: "Cart Checkout",
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                isCartCheckout: true
              }).unwrap();

              if (verifyRes.success) {
                toast.success("Cart Checkout Successful!");
                await refetch();
              }
            } catch (err) {
              console.error("Verification failed", err);
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.name,
            mobile: user?.mobileNo,
          },
          theme: {
            color: "#0d9488",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', function (response) {
          toast.error("Payment failed: " + response.error.description);
        });
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to initiate checkout");
    }
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("profilePhoto", profilePhoto);

    // Filter out empty links before sending
    const validLinks = socialLinks.filter(link => link.title.trim() !== "" && link.link.trim() !== "");
    formData.append("socialLinks", JSON.stringify(validLinks));

    await updateUser(formData);
  };

  useEffect(() => {
    if (location.hash === '#cart-section') {
      setTimeout(() => {
        const element = document.getElementById('cart-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Wait for potential data loads
    } else if (location.hash === '') {
      // Navigated to profile top specifically
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.key, location.hash]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
    </div>
  );

  if (!isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-semibold mb-2">No user logged in yet</h1>
        <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
        <Button asChild>
          <a href="/">Go to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 my-24 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
          <UserIcon size={24} />
        </div>
        <h1 className="font-bold text-3xl text-gray-900 tracking-tight">PROFILE</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden mb-12">
        <div className="bg-teal-700 h-32 w-full relative">
          <div className="absolute -bottom-12 left-8 md:left-12">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white shadow-2xl bg-white">
              <AvatarImage
                className="object-cover w-full h-full"
                src={user?.photoUrl || "https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"}
                alt={user?.name}
              />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-16 pb-10 px-8 md:px-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <Phone size={16} />
                <span className="text-sm font-medium">{user?.mobileNo}</span>
              </div>
              <div className="mt-3">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold uppercase rounded-full tracking-wider border border-teal-100">
                  {user?.role}
                </span>
              </div>
            </div>

            {user?.bio && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About Me</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {user?.socialLinks?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {user.socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-gray-200 transition-all text-sm font-medium text-gray-700"
                    >
                      <Globe size={14} />
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 shadow-md">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information, biography, and social reach.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Jass Kaur"
                    className="h-11"
                  />
                </div>

                {user?.mobileNo && (
                  <div className="grid gap-2">
                    <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Phone size={16} className="text-teal-600" />
                      Registered Mobile Number
                    </Label>
                    <Input
                      type="text"
                      value={user.mobileNo}
                      disabled
                      className="h-11 bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                    />
                    <p className="text-[10px] text-gray-400">Your registered mobile number cannot be changed here.</p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">About Me </Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell students about your background, expertise, and passion..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Social Media Links</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSocialLink}
                      className="h-8 gap-1 text-teal-600 border-teal-600 hover:bg-teal-50"
                    >
                      <Plus size={14} /> Add Link
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex gap-2 items-end group animate-in slide-in-from-right-2 duration-300">
                        <div className="grid gap-1 flex-1">
                          <Input
                            placeholder="Title (e.g. LinkedIn)"
                            value={link.title}
                            onChange={(e) => handleSocialLinkChange(index, "title", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="grid gap-1 flex-[2]">
                          <Input
                            placeholder="URL (e.g. https://linkedin.com/in/...)"
                            value={link.link}
                            onChange={(e) => handleSocialLinkChange(index, "link", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Profile Photo</Label>
                  <Input onChange={onChangeHandler} type="file" accept="image/*" className="bg-white" />
                  <p className="text-[10px] text-gray-500">Recommended: Square image, max 2MB</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={updateUserIsLoading}
                  onClick={updateUserHandler}
                  className="w-full bg-teal-700 hover:bg-teal-800 h-11"
                >
                  {updateUserIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SHOPPING CART SECTION */}
      {user?.role !== "instructor" && (
        <div id="cart-section" className="scroll-mt-24 bg-white rounded-2xl border border-teal-100 shadow-sm p-6 md:p-8 mb-12 relative overflow-hidden">
          <h2 className="text-2xl font-black text-gray-900 border-b-2 border-teal-50 pb-4 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-3">
              🛍️ My Shopping Cart
            </span>
            <span className="text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              {user.cartDetails?.length || 0} items
            </span>
          </h2>
          {user?.cartDetails && user.cartDetails.length > 0 ? (
            <>
              <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {user.cartDetails.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-100 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-16 bg-gray-200 rounded-md overflow-hidden bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url(${item.details?.courseThumbnail || item.details?.thumbnail})` }}></div>
                      <div className="max-w-[200px] md:max-w-md">
                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.details?.courseTitle || item.details?.title}</h3>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">{item.resourceType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-black text-teal-700 text-lg">₹{item.price || 0}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFromCart(item.resourceId, item.resourceType)} className="text-red-400 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="text-lg">
                  <span className="text-gray-500 font-bold uppercase tracking-wide text-sm mr-4">Total Amount</span>
                  <span className="text-3xl font-black text-gray-900">INR {user.cartDetails.reduce((a, b) => a + (b.price || 0), 0)}</span>
                </div>
                <Button size="lg" onClick={handleCartCheckout} disabled={isOrderLoading} className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-100/50 py-6 px-10 rounded-xl text-lg flex items-center gap-3">
                  {isOrderLoading ? <Loader2 className="animate-spin" size={20} /> : "Secure Checkout"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4 font-medium">Your shopping cart is currently empty.</p>
              <Button asChild onClick={() => window.location.href = '/explore'} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                <span>Browse Courses</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* UNIFIED PURCHASED ITEMS "CART" SECTION */}
      {user?.role !== "instructor" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-black text-gray-900 border-b-2 border-gray-100 pb-4 mb-8 flex items-center gap-3">
            🛒 My Purchased Items
          </h2>

          {/* ENROLLED COURSES */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-2 mb-2 pb-2">
              <h3 className="text-lg font-bold text-gray-700">Course Enrollments</h3>
              <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {user?.enrolledCourses?.length || 0}
              </span>
            </div>

            <div className={user?.enrolledCourses?.length === 0 ? "" : "flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth custom-scrollbar"}>
              {user?.enrolledCourses?.length === 0 ? (
                <div className="py-12 w-full text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">You haven't enrolled in any courses yet.</p>
                  <Button asChild variant="link" className="text-teal-600 mt-2">
                    <a href="/explore">Browse Courses</a>
                  </Button>
                </div>
              ) : (
                user?.enrolledCourses?.map((item) => (
                  <div key={item._id} className="snap-start shrink-0">
                    <Course
                      courseId={item._id}
                      image={item.courseThumbnail?.url || item.courseThumbnail}
                      title={item.courseTitle}
                      price={item.coursePrice}
                      duration={item.courseDuration}
                      instructorName={item.creator?.name}
                      instructorAvatar={item.creator?.photoUrl}
                      level={item.courseLevel}
                      isEbook={false}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PURCHASED E-BOOKS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2">
              <h3 className="text-lg font-bold text-gray-700">E-Book Library</h3>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {user?.enrolledEbooks?.length || 0}
              </span>
            </div>

            <div className={user?.enrolledEbooks?.length === 0 ? "" : "flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth custom-scrollbar"}>
              {user?.enrolledEbooks?.length === 0 ? (
                <div className="py-12 w-full text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">You haven't purchased any e-books yet.</p>
                  <Button asChild variant="link" className="text-purple-600 mt-2">
                    <a href="/explore">Browse E-Books</a>
                  </Button>
                </div>
              ) : (
                user?.enrolledEbooks?.map((item) => (
                  <div key={item._id} className="snap-start shrink-0">
                    <Course
                      courseId={item._id}
                      image={item.thumbnail}
                      title={item.title}
                      price={item.price}
                      duration={item.noOfPages}
                      instructorName={item.authorName}
                      instructorAvatar={item.creator?.photoUrl}
                      level="E-Book"
                      isEbook={true}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
