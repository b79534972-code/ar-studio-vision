import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ARDemo from "./pages/ARDemo";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

// Dashboard layout + pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import MyModels from "./pages/MyModels";
import MyRooms from "./pages/MyRooms";
import SavedLayouts from "./pages/SavedLayouts";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";
import DashboardSettings from "./pages/DashboardSettings";
import RoomEditor from "./pages/RoomEditor";
import FurnitureLibrary from "./pages/FurnitureLibrary";
import AILayoutGenerator from "./pages/AILayoutGenerator";
import ARViewer from "./pages/ARViewer";
import RoomScan from "./pages/RoomScan";
import ARObjectViewer from "./pages/ARObjectViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="layouts" element={<SavedLayouts />} />
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
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
