import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Client Pages
import Index from "./pages/Index";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantProfilePage from "./pages/RestaurantProfilePage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import RateRestaurantPage from "./pages/RateRestaurantPage";
import PaymentPage from "./pages/PaymentPage";
import ClientLoginPage from "./pages/ClientLoginPage";
import OffersPage from "./pages/OffersPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import RestaurantLoginPage from "./pages/admin/RestaurantLoginPage";
import RestaurantDashboard from "./pages/admin/RestaurantDashboard";
import ReservationsManagementPage from "./pages/admin/ReservationsManagementPage";
import TableMapOperativePage from "./pages/admin/TableMapOperativePage";
import ArrivalRegistrationPage from "./pages/admin/ArrivalRegistrationPage";
import WaitlistPage from "./pages/admin/WaitlistPage";
import OffersManagementPage from "./pages/admin/OffersManagementPage";
import MenuManagementPage from "./pages/admin/MenuManagementPage";
import ReviewsPage from "./pages/admin/ReviewsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import AISuggestionsPage from "./pages/admin/AISuggestionsPage";
import RestaurantSettingsPage from "./pages/admin/RestaurantSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<ClientLoginPage />} />
            <Route path="/restaurantes" element={<RestaurantsPage />} />
            <Route path="/ofertas" element={<OffersPage />} />
            <Route path="/restaurante/:id" element={<RestaurantProfilePage />} />
            <Route path="/reservar/:id" element={<ReservationPage />} />
            <Route path="/pago/:id" element={<PaymentPage />} />
            <Route path="/mis-reservas" element={<MyReservationsPage />} />
            <Route path="/perfil" element={<ClientProfilePage />} />
            <Route path="/calificar/:id/:reservationId" element={<RateRestaurantPage />} />
            <Route path="/calificar/:id" element={<RateRestaurantPage />} />


            {/* Admin Routes */}
            <Route path="/admin/login" element={<RestaurantLoginPage />} />
            <Route path="/admin/dashboard" element={<RestaurantDashboard />} />
            <Route path="/admin/reservas" element={<ReservationsManagementPage />} />
            <Route path="/admin/mesas" element={<TableMapOperativePage />} />
            <Route path="/admin/llegadas" element={<ArrivalRegistrationPage />} />
            <Route path="/admin/espera" element={<WaitlistPage />} />
            <Route path="/admin/ofertas" element={<OffersManagementPage />} />
            <Route path="/admin/menu" element={<MenuManagementPage />} />
            <Route path="/admin/opiniones" element={<ReviewsPage />} />
            <Route path="/admin/reportes" element={<ReportsPage />} />
            <Route path="/admin/ia-sugerencias" element={<AISuggestionsPage />} />
            <Route path="/admin/configuracion" element={<RestaurantSettingsPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

