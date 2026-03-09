import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const ModulesList = lazy(() => import("./pages/ModulesList"));
const ModuleDetail = lazy(() => import("./pages/Modules"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BottomNav = lazy(() => import("./components/BottomNav"));

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center gradient-soft">
    <div className="text-center">
      <span className="text-3xl block mb-2">✨</span>
      <span className="text-sm font-semibold text-muted-foreground">Porla</span>
    </div>
  </div>
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gradient-soft">
      <div className="text-center">
        <span className="text-3xl block mb-2">✨</span>
        <span className="text-sm font-semibold text-muted-foreground">Porla</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <div className="max-w-lg mx-auto relative">
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/modules" element={<ProtectedRoute><ModulesList /></ProtectedRoute>} />
        <Route path="/modules/:moduleId" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
        <Route path="/lesson/:lessonId" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
    <ProtectedBottomNav />
  </div>
);

const ProtectedBottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <BottomNav />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
