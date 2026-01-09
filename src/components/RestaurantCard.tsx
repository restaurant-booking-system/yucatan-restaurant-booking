import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

const RestaurantCard = ({ restaurant, index }: RestaurantCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/restaurante/${restaurant.id}`}>
        <div className="card-restaurant group">
          {/* Image Container */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {restaurant.isOpen ? (
                <span className="estado-abierto flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Abierto
                </span>
              ) : (
                <span className="estado-cerrado">Cerrado</span>
              )}
            </div>

            {/* Offer Badge */}
            {restaurant.hasOffers && (
              <div className="absolute top-4 right-4">
                <span className="badge-oferta">{restaurant.offerText}</span>
              </div>
            )}

            {/* Rating */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <span className="font-semibold text-foreground">{restaurant.rating}</span>
                <span className="text-muted-foreground text-sm">({restaurant.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              <Badge variant="secondary" className="shrink-0">
                {restaurant.priceRange}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {restaurant.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {restaurant.zone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {restaurant.openTime} - {restaurant.closeTime}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <Badge variant="outline">{restaurant.cuisine}</Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;
