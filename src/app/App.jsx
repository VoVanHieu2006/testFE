import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../entities/auth/AuthContext';

// Pages
import Start from '../pages/start/Start';
import Register from '../pages/register/Register';
import Login from '../pages/login/Login';
import DashboardLayout from '../widgets/Layout/DashboardLayout'; 

const Home = () => <div className="p-8"><h1>Home Page Coming Soon</h1></div>;

function PrivateRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppContent() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Start />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
                path="/home/*"
                element={
                    <PrivateRoute>
                        <DashboardLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Home />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent /> 
            </AuthProvider>
        </BrowserRouter>
    );
}
