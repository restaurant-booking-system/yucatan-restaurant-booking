import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { restaurants } from '@/data/mockData';

type ReservationStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

interface MockReservation {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  mesa: number;
  status: ReservationStatus;
  code: string;
  occasion?: string;
}

// Mock reservations
const mockReservations: MockReservation[] = [
  {
    id: 'res-1',
    restaurantId: '1',
    date: '2024-02-15',
    time: '20:00',
    guests: 2,
    mesa: 3,
    status: 'confirmed',
    code: 'RES-ABC123',
    occasion: 'Cena romántica',
  },
  {
    id: 'res-2',
    restaurantId: '2',
    date: '2024-02-20',
    time: '14:00',
    guests: 4,
    mesa: 5,
    status: 'pending',
    code: 'RES-DEF456',
  },
];

const pastReservations: MockReservation[] = [
  {
    id: 'res-3',
    restaurantId: '3',
    date: '2024-01-10',
    time: '21:00',
    guests: 6,
    mesa: 7,
    status: 'completed',
    code: 'RES-GHI789',
  },
];

const MyReservationsPage = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return null;
    }
  };

  const ReservationCard = ({ reservation, isPast = false }: { reservation: typeof mockReservations[0], isPast?: boolean }) => {
    const restaurant = restaurants.find(r => r.id === reservation.restaurantId);
    if (!restaurant) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-48 h-40 sm:h-auto">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {restaurant.zone}
                </p>
              </div>
              {getStatusBadge(reservation.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(reservation.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{reservation.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{reservation.guests} personas</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs">{reservation.code}</span>
              </div>
            </div>

            {reservation.occasion && (
              <p className="text-sm text-muted-foreground mt-3">
                Ocasión: {reservation.occasion}
              </p>
            )}

            {!isPast && (
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm">Ver detalles</Button>
                {reservation.status !== 'cancelled' && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Cancelar
                  </Button>
                )}
              </div>
            )}

            {isPast && (
              <div className="flex gap-3 mt-4">
                <Link to={`/restaurante/${restaurant.id}`}>
                  <Button variant="outline" size="sm">Reservar de nuevo</Button>
                </Link>
                <Button variant="ghost" size="sm">Dejar reseña</Button>
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
              <TabsTrigger value="active" className="rounded-lg">Activas</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {mockReservations.length > 0 ? (
                <div className="space-y-6">
                  {mockReservations.map((reservation) => (
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
                  <h3 className="font-display text-xl font-semibold mb-2">No tienes reservas activas</h3>
                  <p className="text-muted-foreground mb-6">
                    Explora los mejores restaurantes de Mérida y haz tu primera reserva
                  </p>
                  <Link to="/restaurantes">
                    <Button>Explorar restaurantes</Button>
                  </Link>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {pastReservations.length > 0 ? (
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
                    <Calendar className="h-10 w-10 text-muted-foreground" />
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

      <Footer />
    </div>
  );
};

export default MyReservationsPage;
