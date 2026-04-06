import React from "react";
import { Navigate } from "react-router-dom";
import { useLoadUserQuery } from "@/features/api/authApi";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }) => {
    const { data, isLoading } = useLoadUserQuery();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        );
    }

    // If no user data or the backend rejected verification, kick them to login
    if (!data?.user) {
        return <Navigate to="/" replace />;
    }

    // Normal authorized users can proceed (Both Instructor and Student)
    return children;
};

export const StudentRoute = ({ children }) => {
    const { data, isLoading } = useLoadUserQuery();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        );
    }

    // If no user data, kick them to login
    if (!data?.user) {
        return <Navigate to="/" replace />;
    }

    // If they are an instructor, they shouldn't be wandering in student-exclusive areas
    if (data?.user?.role === "instructor") {
        return <Navigate to="/instructor/course" replace />;
    }

    // Authorized students can proceed
    return children;
};

export const InstructorRoute = ({ children }) => {
    const { data, isLoading } = useLoadUserQuery();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!data?.user) {
        return <Navigate to="/" replace />;
    }

    // Double lock: If they are logged in but NOT an instructor, kick them to the student landing zone
    if (data?.user?.role !== "instructor") {
        return <Navigate to="/resources" replace />;
    }

    // Authorized instructors can proceed
    return children;
};

export const AuthenticatedAdminRoute = ({ children }) => {
    const { data, isLoading } = useLoadUserQuery();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            </div>
        );
    }

    // If the user is already logged in securely, prevent them from seeing the 'Login' landing page!
    if (data?.user) {
        return data.user.role === "instructor"
            ? <Navigate to="/instructor/course" replace />
            : <Navigate to="/resources" replace />;
    }

    // Only real, unauthenticated guests can see the landing page
    return children;
};
