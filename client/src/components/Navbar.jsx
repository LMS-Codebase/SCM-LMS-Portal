import React, { useEffect } from "react";
import SCM_Logo from "../assets/images/SCM_Logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuItem,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Mail, Menu, MenuIcon, MessageCircleMore, ShoppingCart } from "lucide-react";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const Navbar = () => {
  // const user = true;  --> dummy 
  const { user } = useSelector(store => store.auth);

  //   const [position, setPosition] = React.useState("bottom");
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    await logoutUser();

  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "User Logout Successfully.");
      navigate("/");
    }
  }, [isSuccess])


  return (
    <>
      <div className="fixed h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 top-0 left-0 right-0 duration-300 z-10 flex items-center justify-between">
        {/* Link tag is in react-router-dom  */}
        {/* for now : using school tag from lucide-react (automatically come with shadcn/ui)  */}
        {/* <School size={"30"}/>  --->  An icon from lucide-react */}

        {/* Desktop  */}
        <div className="w-screen hidden m-4 md:flex justify-between items-center gap-10 h-full">
          {/* Logo */}
          <Link to="/">
            <img
              src={SCM_Logo}
              alt="SCM_Logo"
              className="h-4 sm:h-5 md:h-6 lg:h-7 w-auto"
            />
          </Link>

          {/* Right side navigation items */}
          <div className="mr-8 lg:mr-16 flex items-center gap-6 lg:gap-8 font-semibold text-sm text-gray-700">


            {/* About Us */}
            <a
              href="https://www.scmconnect.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 transition-colors uppercase tracking-wider text-xs"
            >
              About Us
            </a>


            {/* Resources */}
            {(!user || user?.role !== "instructor") && (
              <div
                className="hover:text-teal-600 transition-colors cursor-pointer uppercase tracking-wider text-xs"
                onClick={() => {
                  if (!user) {
                    toast.info("Please log in to explore resources!");
                    navigate("/");
                  } else {
                    navigate("/resources");
                  }
                }}
              >
                Resources
              </div>
            )}



            {/* Connect Us / Contact Us */}
            <div
              onClick={() => navigate("/connect-us")}
              className="flex items-center gap-2 hover:text-teal-600 transition-colors cursor-pointer uppercase tracking-wider text-xs"
            >
              <span>Contact Us</span>
              {/* <MessageCircleMore size={18} /> */}
            </div>




            {/* Shopping Cart */}
            {(!user || user?.role !== "instructor") && (
              <div
                className="relative flex items-center gap-2 hover:text-teal-600 transition-colors cursor-pointer uppercase tracking-wider text-xs"
                onClick={() => {
                  if (!user) {
                    toast.info("Please log in to view your cart!");
                    navigate("/");
                  } else {
                    navigate("/profile#cart-section");
                  }
                }}
              >
                <span>Cart</span>
                <ShoppingCart size={18} />
                {user?.cart && user.cart.length > 0 && (
                  <span className="absolute -top-2.5 -right-3 bg-red-500 border border-white text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full pointer-events-none">
                    {user.cart.length}
                  </span>
                )}
              </div>
            )}



            {/* My Profile */}
            <div className="flex items-center gap-3 ml-2 border-l pl-6 border-gray-300">
              <span
                className="hover:text-teal-600 transition-colors cursor-pointer uppercase tracking-wider text-xs"
                onClick={() => {
                  if (!user) {
                    toast.info("Please log in to manage your profile!");
                    navigate("/");
                  } else {
                    navigate("/profile");
                  }
                }}
              >
                My Profile
              </span>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer border-2 border-transparent hover:border-teal-500 transition-all h-9 w-9 shadow-sm">
                      <AvatarImage
                        className="object-contain w-full h-full bg-gray-100"
                        src={
                          user?.photoUrl ||
                          "https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"
                        }
                        alt="Profile Picture"
                      />
                      <AvatarFallback>PP</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2">
                    {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                    {/* <DropdownMenuSeparator /> */}
                    <DropdownMenuGroup>
                      {user?.role === "student" && (
                        <DropdownMenuItem>
                          <Link to="/my-learning" className="w-full">
                            My Learning
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Link to="/profile" className="w-full">
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 font-medium"
                        onClick={logoutHandler}
                      >
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Avatar
                  className="cursor-pointer border-2 border-gray-200 hover:border-teal-500 transition-all h-9 w-9 shadow-sm"
                  onClick={() => {
                    toast.info("Please log in to access your dashboard!");
                    navigate("/");
                  }}
                >
                  <AvatarImage
                    src="https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"
                    alt="Default Profile"
                  />
                  <AvatarFallback>PP</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>

        {/* Mobile device  */}
        <div className="flex md:hidden items-center justify-between px-4 h-full w-full">
          <img
            src={SCM_Logo}
            alt="SCM_Logo"
            className="h-4 sm:h-5 md:h-6 lg:h-7 w-auto"
          />

          <MobileNavbar user={user} logoutHandler={logoutHandler} />
        </div>
      </div>
    </>
  );
};

export default Navbar;



const MobileNavbar = ({ user, logoutHandler }) => {
  const role = user?.role || "student";
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-400"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle>E-Learning</SheetTitle>
          {/* <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription> */}
        </SheetHeader>

        <Separator className="mr-2" />
        <nav className="flex flex-col space-y-5 mt-4 text-gray-800 font-medium">
          {/* Resources */}
          {(!user || user?.role !== "instructor") && (
            <div
              className="hover:text-teal-600 transition-colors cursor-pointer"
              onClick={() => {
                if (!user) {
                  toast.info("Please log in to explore resources!");
                  navigate("/");
                } else {
                  navigate("/resources");
                }
              }}
            >
              Resources
            </div>
          )}

          {/* About Us */}
          <a href="https://www.scmconnect.in" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">
            About Us
          </a>

          {/* Connect Us / Contact Us */}
          <div
            className="hover:text-teal-600 transition-colors cursor-pointer"
            onClick={() => navigate("/connect-us")}
          >
            Contact Us
          </div>

          <Separator className="border-gray-200" />

          {/* Cart */}
          {(!user || user?.role !== "instructor") && (
            <div
              className="flex items-center justify-between hover:text-teal-600 transition-colors cursor-pointer"
              onClick={() => {
                if (!user) {
                  toast.info("Please log in to view your cart!");
                  navigate("/");
                } else {
                  navigate("/profile#cart-section");
                }
              }}
            >
              <span>My Shopping Cart</span>
              {user?.cart && user.cart.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {user.cart.length}
                </span>
              )}
            </div>
          )}

          {/* My Learning (Student Only) */}
          {user?.role === "student" && (
            <div
              className="hover:text-teal-600 transition-colors cursor-pointer"
              onClick={() => navigate("/my-learning")}
            >
              My Learning
            </div>
          )}

          {/* Profile options */}
          <div
            className="hover:text-teal-600 transition-colors cursor-pointer"
            onClick={() => {
              if (!user) {
                toast.info("Please log in to manage your profile!");
                navigate("/");
              } else {
                navigate("/profile");
              }
            }}
          >
            {user ? "Edit Profile" : "My Profile"}
          </div>

          {/* Log Out */}
          {user && (
            <p onClick={logoutHandler} className="cursor-pointer text-red-600 font-semibold mt-4">
              Log out
            </p>
          )}
        </nav>



      </SheetContent>
    </Sheet>
  );
};
