import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logement from "./pages/Logement";
import Prediction from "./pages/Prediction";
import Conseils from "./pages/Conseils";
import ProfileDashboard from "./pages/Profile";
import Analytics from "./pages/Analytics";
import ScenarioCompare from "./pages/ScenarioCompare";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard pages */}
            <Route path="/logement" element={<DashboardLayout><Logement /></DashboardLayout>} />
            <Route path="/prediction" element={<DashboardLayout><Prediction /></DashboardLayout>} />
            <Route path="/conseils" element={<DashboardLayout><Conseils /></DashboardLayout>} />
            <Route path="/analyses" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/compare" element={<DashboardLayout><ScenarioCompare /></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout><ProfileDashboard /></DashboardLayout>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
