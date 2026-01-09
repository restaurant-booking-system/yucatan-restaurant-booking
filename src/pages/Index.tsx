import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ChevronRight, Utensils, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RestaurantCard from '@/components/RestaurantCard';
import { restaurants, offers } from '@/data/mockData';
import heroImage from '@/assets/hero-restaurant.jpg';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredRestaurants = restaurants.slice(0, 4);
  const activeOffers = offers.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Restaurante elegante en Mérida"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-card mb-6 text-balance">
              Reserva tu mesa en los mejores restaurantes de{' '}
              <span className="gradient-text">Mérida</span>
            </h1>
            <p className="text-card/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Descubre la gastronomía yucateca. Selecciona tu mesa visualmente y vive una experiencia única.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar restaurante, tipo de cocina o zona..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base border-0 bg-transparent"
                  />
                </div>
                <Button size="lg" className="btn-hero h-14 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {['Centro', 'Montejo', 'Yucateca', 'Mariscos'].map((filter) => (
                  <Link
                    key={filter}
                    to={`/restaurantes?filter=${filter}`}
                    className="px-4 py-2 rounded-full bg-card/20 text-card text-sm font-medium backdrop-blur-sm hover:bg-card/30 transition-colors"
                  >
                    {filter}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-card/80" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Utensils,
                title: 'Restaurantes Exclusivos',
                description: 'Los mejores restaurantes de Mérida seleccionados para ti',
              },
              {
                icon: MapPin,
                title: 'Selección Visual de Mesas',
                description: 'Elige tu mesa favorita en el mapa interactivo del restaurante',
              },
              {
                icon: Calendar,
                title: 'Reserva Instantánea',
                description: 'Confirma tu reserva en segundos y recibe tu código QR',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-8"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Restaurantes Destacados
              </h2>
              <p className="text-muted-foreground">
                Los favoritos de nuestros usuarios en Mérida
              </p>
            </div>
            <Link to="/restaurantes">
              <Button variant="outline" className="hidden sm:flex">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/restaurantes">
              <Button variant="outline">
                Ver todos los restaurantes
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-secondary" />
                <span className="text-secondary font-semibold">Ofertas Especiales</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Promociones Activas
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeOffers.map((offer, index) => {
              const restaurant = restaurants.find(r => r.id === offer.restaurantId);
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-card group"
                >
                  {restaurant && (
                    <div className="relative h-40">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="badge-oferta text-base">{offer.discount}</span>
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold mb-1">{offer.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{offer.description}</p>
                    <p className="text-sm text-muted-foreground">
                      En <span className="text-foreground font-medium">{restaurant?.name}</span>
                    </p>
                    <Link to={`/restaurante/${offer.restaurantId}`}>
                      <Button variant="outline" size="sm" className="mt-4 w-full">
                        Ver restaurante
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }} />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                ¿Tienes un restaurante?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Únete a MesaYucatán y llega a miles de comensales. Gestiona tus reservas, mesas y ofertas desde un solo lugar.
              </p>
              <Link to="/registro-restaurante">
                <Button size="lg" className="btn-secondary-hero">
                  Registrar mi restaurante
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
