import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import Index from "./pages/Index";

const ARDemo = lazy(() => lazyWithRetry(() => import("./pages/ARDemo"), "ar-demo"));
const SignIn = lazy(() => lazyWithRetry(() => import("./pages/SignIn"), "sign-in"));
const SignUp = lazy(() => lazyWithRetry(() => import("./pages/SignUp"), "sign-up"));
const Pricing = lazy(() => lazyWithRetry(() => import("./pages/Pricing"), "pricing"));
const NotFound = lazy(() => lazyWithRetry(() => import("./pages/NotFound"), "not-found"));

const DashboardLayout = lazy(() => lazyWithRetry(() => import("./components/dashboard/DashboardLayout"), "dashboard-layout"));
const DashboardOverview = lazy(() => lazyWithRetry(() => import("./pages/DashboardOverview"), "dashboard-overview"));
const MyModels = lazy(() => lazyWithRetry(() => import("./pages/MyModels"), "my-models"));
const MyRooms = lazy(() => lazyWithRetry(() => import("./pages/MyRooms"), "my-rooms"));
const Profile = lazy(() => lazyWithRetry(() => import("./pages/Profile"), "profile"));
const Billing = lazy(() => lazyWithRetry(() => import("./pages/Billing"), "billing"));
const DashboardSettings = lazy(() => lazyWithRetry(() => import("./pages/DashboardSettings"), "dashboard-settings"));
const RoomEditor = lazy(() => lazyWithRetry(() => import("./pages/RoomEditor"), "room-editor"));
const FurnitureLibrary = lazy(() => lazyWithRetry(() => import("./pages/FurnitureLibrary"), "furniture-library"));
const AILayoutGenerator = lazy(() => lazyWithRetry(() => import("./pages/AILayoutGenerator"), "ai-layout-generator"));
const ARViewer = lazy(() => lazyWithRetry(() => import("./pages/ARViewer"), "ar-viewer"));
const RoomScan = lazy(() => lazyWithRetry(() => import("./pages/RoomScan"), "room-scan"));
const ARObjectViewer = lazy(() => lazyWithRetry(() => import("./pages/ARObjectViewer"), "ar-object-viewer"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="text-center space-y-2">
      <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading view…</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/ar-demo" element={<ARDemo />} />
              <Route path="/ar-viewer/:layoutId" element={<ARViewer />} />
              <Route path="/ar-object/:furnitureId" element={<ARObjectViewer />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/pricing" element={<Pricing />} />

              {/* Dashboard (private) */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="models" element={<MyModels />} />
                <Route path="rooms" element={<MyRooms />} />
                <Route path="furniture" element={<FurnitureLibrary />} />
                <Route path="ai-generator" element={<AILayoutGenerator />} />
                <Route path="room-scan" element={<RoomScan />} />
                <Route path="profile" element={<Profile />} />
                <Route path="billing" element={<Billing />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>

              {/* Full-screen editor (outside dashboard layout) */}
              <Route path="/dashboard/editor" element={<RoomEditor />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
