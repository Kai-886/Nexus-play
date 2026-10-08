import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070B1A] text-white">
                <p className="text-sm text-slate-400">
                    Loading...
                </p>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
}

    return children;
}