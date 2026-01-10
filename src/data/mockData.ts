import restaurant1 from '@/assets/restaurant-1.jpg';
import restaurant2 from '@/assets/restaurant-2.jpg';
import restaurant3 from '@/assets/restaurant-3.jpg';
import restaurant4 from '@/assets/restaurant-4.jpg';
import { Restaurant, Mesa, TimeSlot, MenuItem, Offer } from '@/types/restaurant';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'La Casa de los Abuelos',
    description: 'Cocina yucateca tradicional en una hermosa casona colonial del siglo XIX. Especialidad en cochinita pibil y papadzules.',
    image: restaurant1,
    rating: 4.8,
    reviewCount: 324,
    cuisine: 'Yucateca',
    zone: 'Centro',
    priceRange: '$$$',
    isOpen: true,
    openTime: '12:00',
    closeTime: '23:00',
    address: 'Calle 60 #456, Centro Histórico',
    hasOffers: true,
    offerText: '20% en cenas románticas',
  },
  {
    id: '2',
    name: 'Mar y Cielo',
    description: 'Mariscos frescos del Golfo con vista al atardecer. Ceviches, tikinxic y pescados del día.',
    image: restaurant2,
    rating: 4.6,
    reviewCount: 189,
    cuisine: 'Mariscos',
    zone: 'Montejo',
    priceRange: '$$$$',
    isOpen: true,
    openTime: '13:00',
    closeTime: '22:00',
    address: 'Paseo de Montejo #890',
    hasOffers: false,
  },
  {
    id: '3',
    name: 'Fusión MX',
    description: 'Cocina mexicana contemporánea con toques internacionales. Bar de mezcales artesanales.',
    image: restaurant3,
    rating: 4.5,
    reviewCount: 256,
    cuisine: 'Fusión',
    zone: 'Norte',
    priceRange: '$$$',
    isOpen: true,
    openTime: '18:00',
    closeTime: '01:00',
    address: 'Plaza Altabrisa Local 45',
    hasOffers: true,
    offerText: '2x1 en cocktails',
  },
  {
    id: '4',
    name: 'Hacienda Xcanatún',
    description: 'Alta cocina yucateca en una hacienda histórica del siglo XVII. Experiencia gastronómica única.',
    image: restaurant4,
    rating: 4.9,
    reviewCount: 512,
    cuisine: 'Yucateca Gourmet',
    zone: 'Norte',
    priceRange: '$$$$',
    isOpen: false,
    openTime: '19:00',
    closeTime: '23:00',
    address: 'Carretera Mérida-Progreso Km 12',
    hasOffers: true,
    offerText: 'Menú degustación especial',
  },
];

export const mesas: Mesa[] = [
  { id: 'm1', number: 1, capacity: 2, status: 'disponible', x: 10, y: 10, shape: 'round', width: 60, height: 60 },
  { id: 'm2', number: 2, capacity: 2, status: 'disponible', x: 85, y: 10, shape: 'round', width: 60, height: 60 },
  { id: 'm3', number: 3, capacity: 4, status: 'ocupada', x: 160, y: 10, shape: 'square', width: 80, height: 80 },
  { id: 'm4', number: 4, capacity: 4, status: 'disponible', x: 10, y: 100, shape: 'square', width: 80, height: 80 },
  { id: 'm5', number: 5, capacity: 6, status: 'pendiente', x: 110, y: 100, shape: 'rectangle', width: 120, height: 70 },
  { id: 'm6', number: 6, capacity: 2, status: 'disponible', x: 250, y: 10, shape: 'round', width: 60, height: 60 },
  { id: 'm7', number: 7, capacity: 8, status: 'reservada', x: 10, y: 200, shape: 'rectangle', width: 160, height: 80 },
  { id: 'm8', number: 8, capacity: 4, status: 'disponible', x: 190, y: 200, shape: 'square', width: 80, height: 80 },
  { id: 'm9', number: 9, capacity: 2, status: 'disponible', x: 290, y: 100, shape: 'round', width: 60, height: 60 },
  { id: 'm10', number: 10, capacity: 6, status: 'disponible', x: 250, y: 200, shape: 'rectangle', width: 100, height: 70 },
];

export const timeSlots: TimeSlot[] = [
  { time: '12:00', available: true, isPeak: false, requiresDeposit: false },
  { time: '13:00', available: true, isPeak: false, requiresDeposit: false },
  { time: '14:00', available: true, isPeak: true, requiresDeposit: true, depositAmount: 200 },
  { time: '15:00', available: false, isPeak: false, requiresDeposit: false },
  { time: '18:00', available: true, isPeak: false, requiresDeposit: false },
  { time: '19:00', available: true, isPeak: true, requiresDeposit: true, depositAmount: 200 },
  { time: '20:00', available: true, isPeak: true, requiresDeposit: true, depositAmount: 300 },
  { time: '21:00', available: true, isPeak: true, requiresDeposit: true, depositAmount: 300 },
  { time: '22:00', available: true, isPeak: false, requiresDeposit: false },
];

export const menuItems: MenuItem[] = [
  { id: 'mi1', name: 'Cochinita Pibil', description: 'Cerdo marinado en achiote, cocido en hoja de plátano', price: 180, category: 'Platillos Principales', isHighlighted: true },
  { id: 'mi2', name: 'Papadzules', description: 'Tortillas bañadas en salsa de pepita con huevo', price: 140, category: 'Entradas', isHighlighted: true },
  { id: 'mi3', name: 'Sopa de Lima', description: 'Caldo de pollo con lima, tortilla y aguacate', price: 95, category: 'Entradas', isHighlighted: false },
  { id: 'mi4', name: 'Poc Chuc', description: 'Cerdo asado con cebolla morada y naranja agria', price: 195, category: 'Platillos Principales', isHighlighted: false },
  { id: 'mi5', name: 'Tikin Xic', description: 'Pescado al achiote asado en hoja de plátano', price: 280, category: 'Mariscos', isHighlighted: true },
  { id: 'mi6', name: 'Marquesitas', description: 'Barquillo crujiente con queso de bola y Nutella', price: 65, category: 'Postres', isHighlighted: false },
];

export const offers: Offer[] = [
  { id: 'o1', title: '20% Cena Romántica', description: 'Válido para parejas en mesas para 2', discount: '20%', validUntil: '2026-02-14', restaurantId: '1' },
  { id: 'o2', title: '2x1 Cocktails', description: 'En toda nuestra carta de cocktails', discount: '2x1', validUntil: '2026-01-31', restaurantId: '3' },
  { id: 'o3', title: 'Menú Degustación', description: '7 tiempos con maridaje incluido', discount: '$1,500', validUntil: '2026-02-28', restaurantId: '4' },
];

export const zones = ['Todos', 'Centro', 'Montejo', 'Norte'];
export const cuisines = ['Todos', 'Yucateca', 'Mariscos', 'Fusión', 'Yucateca Gourmet'];
