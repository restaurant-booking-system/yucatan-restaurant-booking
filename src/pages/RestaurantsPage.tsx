import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchFilters from '@/components/SearchFilters';
import RestaurantCard from '@/components/RestaurantCard';
import { restaurants } from '@/data/mockData';

const RestaurantsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('Todos');
  const [selectedCuisine, setSelectedCuisine] = useState('Todos');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = selectedZone === 'Todos' || restaurant.zone === selectedZone;
      const matchesCuisine = selectedCuisine === 'Todos' || restaurant.cuisine === selectedCuisine;
      const matchesAvailable = !showAvailableOnly || restaurant.isOpen;

      return matchesSearch && matchesZone && matchesCuisine && matchesAvailable;
    });
  }, [searchQuery, selectedZone, selectedCuisine, showAvailableOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Restaurantes en Mérida
            </h1>
            <p className="text-muted-foreground">
              Encuentra el lugar perfecto para tu próxima experiencia gastronómica
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
              showAvailableOnly={showAvailableOnly}
              onAvailableChange={setShowAvailableOnly}
            />
          </motion.div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} encontrado{filteredRestaurants.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Restaurant Grid */}
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No se encontraron restaurantes</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros o buscar con otros términos
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;
