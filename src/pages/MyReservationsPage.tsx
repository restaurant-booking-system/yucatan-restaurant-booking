import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, QrCode, Star, ExternalLink, X, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/reservation/StatusBadge';
import RatingModal from '@/components/rating/RatingModal';
import { useRestaurants, useUserReservations, useCancelReservation } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Reservation } from '@/types';

const MyReservationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: restaurants = [] } = useRestaurants();
  const { data: reservations = [], isLoading: reservationsLoading, refetch } = useUserReservations(user?.id);
  const cancelReservation = useCancelReservation();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingReservation, setRatingReservation] = useState<Reservation | null>(null);

  // Split reservations into upcoming and past
  const today = new Date().toISOString().split('T')[0];
  const upcomingReservations = reservations.filter(r => r.date >= today && r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'no_show');
  const pastReservations = reservations.filter(r => r.date < today || r.status === 'completed' || r.status === 'cancelled' || r.status === 'no_show');

  const handleCancelClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const handleQrClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setQrDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    try {
      await cancelReservation.mutateAsync({ reservationId: selectedReservation.id });
      toast.success('Reserva cancelada exitosamente');
      refetch();
    } catch (error) {
      toast.error('Error al cancelar la reserva');
    }
    setCancelDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleRateClick = (reservation: Reservation) => {
    setRatingReservation(reservation);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = (data: any) => {
    console.log('Rating submitted:', data);
    toast.success('¡Gracias por tu opinión!');
    setRatingModalOpen(false);
  };

  const ReservationCard = ({ reservation, isPast = false }: { reservation: Reservation, isPast?: boolean }) => {
    const restaurant = restaurants.find(r => r.id === reservation.restaurantId);
    if (!restaurant) return null;

    const canRate = isPast && reservation.status === 'completed';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card overflow-hidden border border-border hover:shadow-lg transition-shadow"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-56 h-48 md:h-auto relative group">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <Link
              to={`/restaurante/${restaurant.id}`}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center"
            >
              <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <Link to={`/restaurante/${restaurant.id}`} className="hover:underline">
                  <h3 className="font-display text-lg font-semibold">{restaurant.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {restaurant.zone}
                </p>
              </div>
              <StatusBadge status={reservation.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(reservation.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <p className="font-medium">{reservation.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Personas</p>
                  <p className="font-medium">{reservation.guests}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded">
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Código</p>
                  <p className="font-mono text-xs font-medium">{reservation.qrCode || reservation.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {reservation.specialRequest && (
              <p className="text-sm text-muted-foreground mb-3">
                📝 {reservation.specialRequest}
              </p>
            )}

            {/* Actions */}
            {!isPast && (
              <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => handleQrClick(reservation)}>
                  <QrCode className="h-4 w-4 mr-1" />
                  Ver código QR
                </Button>
                <Link to={`/restaurante/${restaurant.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver restaurante
                  </Button>
                </Link>
                {reservation.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancelClick(reservation)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            )}

            {isPast && (
              <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
                <Link to={`/reservar/${restaurant.id}`}>
                  <Button variant="outline" size="sm">
                    Reservar de nuevo
                  </Button>
                </Link>
                {canRate && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRateClick(reservation)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Calificar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Mis Reservas</h1>
            <p className="text-muted-foreground">Gestiona todas tus reservaciones</p>
          </motion.div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-8 bg-muted p-1 rounded-xl">
              <TabsTrigger value="active" className="rounded-lg gap-2">
                <Calendar className="h-4 w-4" />
                Próximas
                {upcomingReservations.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{upcomingReservations.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg gap-2">
                <Clock className="h-4 w-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {reservationsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : upcomingReservations.length > 0 ? (
                <div className="space-y-6">
                  {upcomingReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">No tienes reservas próximas</h3>
                  <p className="text-muted-foreground mb-6">
                    Explora los mejores restaurantes de Mérida y haz tu primera reserva
                  </p>
                  <Link to="/restaurantes">
                    <Button size="lg">Explorar restaurantes</Button>
                  </Link>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {reservationsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pastReservations.length > 0 ? (
                <div className="space-y-6">
                  {pastReservations.map((reservation) => (
                    <ReservationCard key={reservation.id} reservation={reservation} isPast />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">Sin historial de reservas</h3>
                  <p className="text-muted-foreground">
                    Tus reservas pasadas aparecerán aquí
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-xs flex flex-col items-center justify-center text-center p-8">
          <DialogHeader>
            <DialogTitle className="text-xl">Código de Reserva</DialogTitle>
            <DialogDescription>Muestra este código al llegar al restaurante</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="mt-4 p-4 bg-white rounded-xl shadow-inner">
              <QRCode
                value={selectedReservation.qrCode || selectedReservation.id}
                size={200}
                viewBox={`0 0 256 256`}
              />
            </div>
          )}
          {selectedReservation && (
            <div className="mt-4">
              <p className="font-mono text-2xl font-bold tracking-widest">
                {selectedReservation.qrCode || selectedReservation.id.split('-')[0].toUpperCase()}
              </p>
              <Badge variant={selectedReservation.status === 'confirmed' ? 'success' : 'outline'} className="mt-2">
                {selectedReservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cancelar reserva?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar tu reserva?
            </p>
            {selectedReservation && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">Código: {selectedReservation.qrCode || selectedReservation.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-muted-foreground">
                  {new Date(selectedReservation.date).toLocaleDateString('es-MX')} - {selectedReservation.time}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              No, mantener
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelReservation.isPending}>
              {cancelReservation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sí, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      {ratingReservation && (
        <RatingModal
          open={ratingModalOpen}
          onOpenChange={setRatingModalOpen}
          restaurantName={restaurants.find(r => r.id === ratingReservation.restaurantId)?.name || ''}
          onSubmit={handleSubmitRating}
        />
      )}

      <Footer />
    </div>
  );
};

export default MyReservationsPage;
