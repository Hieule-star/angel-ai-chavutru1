import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Knowledge from "./pages/Knowledge";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/admin/AdminDashboard";
import KnowledgeUpload from "./pages/admin/KnowledgeUpload";
import UserManagement from "./pages/admin/UserManagement";
import KnowledgeList from "./pages/admin/KnowledgeList";
import ChatAnalytics from "./pages/admin/ChatAnalytics";
import RoleManagement from "./pages/admin/RoleManagement";
import ApiKeys from "./pages/admin/ApiKeys";
import ApiAnalytics from "./pages/admin/ApiAnalytics";
import Developers from "./pages/Developers";
import DeveloperKeys from "./pages/DeveloperKeys";
import Install from "./pages/Install";
import Platform from "./pages/docs/Platform";
import LightConstitution from "./pages/LightConstitution";
import CTOChat from "./pages/CTOChat";
import RagDebug from "./pages/admin/RagDebug";
import ApplicationKeys from "./pages/admin/ApplicationKeys";
import InternalAuth from "./pages/docs/InternalAuth";

const queryClient = new QueryClient();

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-divine">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-angel-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kết nối với ánh sáng...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/knowledge" element={<Knowledge />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/settings" element={<Settings />} />
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/knowledge" element={<KnowledgeUpload />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/knowledge-list" element={<KnowledgeList />} />
      <Route path="/admin/chat" element={<ChatAnalytics />} />
      <Route path="/admin/roles" element={<RoleManagement />} />
      <Route path="/admin/api-keys" element={<ApiKeys />} />
      <Route path="/admin/api-analytics" element={<ApiAnalytics />} />
      <Route path="/admin/rag-debug" element={<RagDebug />} />
      <Route path="/admin/security/application-keys" element={<ApplicationKeys />} />
      <Route path="/docs/internal-auth" element={<InternalAuth />} />
      <Route path="/developers" element={<Developers />} />
      <Route path="/developers/keys" element={<DeveloperKeys />} />
      <Route path="/install" element={<Install />} />
      <Route path="/docs/platform" element={<Platform />} />
      <Route path="/light-constitution" element={<LightConstitution />} />
      <Route path="/cto" element={<CTOChat />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
