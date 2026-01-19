import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurantAuth } from '@/contexts/RestaurantAuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Protected route for customer pages
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children, redirectTo = '/login' }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

/**
 * Protected route for restaurant admin pages
 * Redirects to admin login if not authenticated
 */
export const ProtectedAdminRoute = ({ children, redirectTo = '/admin/login' }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useRestaurantAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

/**
 * Public only route - redirects authenticated users away
 * Useful for login/register pages
 */
interface PublicOnlyRouteProps extends ProtectedRouteProps {
    authenticatedRedirect?: string;
}

export const PublicOnlyRoute = ({
    children,
    authenticatedRedirect = '/'
}: PublicOnlyRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={authenticatedRedirect} replace />;
    }

    return <>{children}</>;
};

/**
 * Public only route for admin - redirects authenticated restaurant users away
 */
export const PublicOnlyAdminRoute = ({
    children,
    authenticatedRedirect = '/admin/dashboard'
}: PublicOnlyRouteProps) => {
    const { isAuthenticated, isLoading } = useRestaurantAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={authenticatedRedirect} replace />;
    }

    return <>{children}</>;
};
