import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Phone, ChevronLeft, Tag, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { restaurants, menuItems, offers } from '@/data/mockData';

const RestaurantProfilePage = () => {
  const { id } = useParams();
  const restaurant = restaurants.find(r => r.id === id);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Restaurante no encontrado</h1>
          <Link to="/restaurantes">
            <Button>Volver a restaurantes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const restaurantOffers = offers.filter(o => o.restaurantId === restaurant.id);
  const menuCategories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Link
          to="/restaurantes"
          className="absolute top-24 left-4 md:left-8 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-24 right-4 md:right-8 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        >
          <Heart className={`h-6 w-6 ${isFavorite ? 'fill-secondary text-secondary' : ''}`} />
        </button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {restaurant.hasOffers && (
                <span className="badge-oferta mb-4 inline-block">{restaurant.offerText}</span>
              )}
              <h1 className="font-display text-3xl md:text-5xl font-bold text-card mb-3">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-card/90">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-card/70">({restaurant.reviewCount} reseñas)</span>
                </div>
                <Badge variant="secondary">{restaurant.cuisine}</Badge>
                <Badge variant="outline" className="border-card/30 text-card">{restaurant.priceRange}</Badge>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full justify-start mb-6 bg-muted p-1 rounded-xl">
                  <TabsTrigger value="info" className="rounded-lg">Información</TabsTrigger>
                  <TabsTrigger value="menu" className="rounded-lg">Menú</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-lg">Reseñas</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Description */}
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <h2 className="font-display text-xl font-semibold mb-4">Acerca del restaurante</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {restaurant.description}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="bg-card rounded-2xl p-6 shadow-card">
                      <h2 className="font-display text-xl font-semibold mb-4">Detalles</h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Dirección</p>
                            <p className="text-muted-foreground">{restaurant.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Horario</p>
                            <p className="text-muted-foreground">{restaurant.openTime} - {restaurant.closeTime}</p>
                            {restaurant.isOpen ? (
                              <span className="estado-abierto inline-flex items-center gap-1 mt-2">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                Abierto ahora
                              </span>
                            ) : (
                              <span className="estado-cerrado inline-block mt-2">Cerrado</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Teléfono</p>
                            <p className="text-muted-foreground">+52 999 123 4567</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Offers */}
                    {restaurantOffers.length > 0 && (
                      <div className="bg-accent rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="h-5 w-5 text-secondary" />
                          <h2 className="font-display text-xl font-semibold">Ofertas activas</h2>
                        </div>
                        <div className="space-y-3">
                          {restaurantOffers.map((offer) => (
                            <div key={offer.id} className="bg-card rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{offer.title}</p>
                                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                                </div>
                                <span className="badge-oferta">{offer.discount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="menu">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {menuCategories.map((category) => (
                      <div key={category} className="bg-card rounded-2xl p-6 shadow-card">
                        <h2 className="font-display text-xl font-semibold mb-4">{category}</h2>
                        <div className="space-y-4">
                          {menuItems
                            .filter(item => item.category === category)
                            .map((item) => (
                              <div key={item.id} className="flex justify-between items-start border-b border-border pb-4 last:border-0 last:pb-0">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{item.name}</p>
                                    {item.isHighlighted && (
                                      <Badge variant="secondary" className="text-xs">Destacado</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                </div>
                                <p className="font-semibold text-primary ml-4">${item.price}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </TabsContent>

                <TabsContent value="reviews">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-2xl p-6 shadow-card"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{restaurant.rating}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= Math.round(restaurant.rating) ? 'text-warning fill-warning' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{restaurant.reviewCount} reseñas</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-center py-8">
                      Las reseñas estarán disponibles próximamente
                    </p>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Reservation Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28"
              >
                <div className="bg-card rounded-2xl p-6 shadow-elevated">
                  <h2 className="font-display text-xl font-semibold mb-4">Reservar mesa</h2>
                  <p className="text-muted-foreground mb-6">
                    Selecciona la fecha, hora y tu mesa favorita visualmente.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Hasta 10 personas</p>
                        <p className="text-sm text-muted-foreground">Mesas disponibles de 2 a 10</p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/reservar/${restaurant.id}`}>
                    <Button className="w-full mt-6 btn-hero h-14 text-lg">
                      Reservar ahora
                    </Button>
                  </Link>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Algunos horarios pueden requerir anticipo
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantProfilePage;
