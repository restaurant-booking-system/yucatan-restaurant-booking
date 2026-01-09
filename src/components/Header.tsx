import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome ? 'bg-transparent' : 'bg-card/95 backdrop-blur-md shadow-soft'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display text-xl">M</span>
            </div>
            <span className={`font-display text-xl font-semibold ${isHome ? 'text-card' : 'text-foreground'}`}>
              MesaYucatán
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/restaurantes"
              className={`font-medium transition-colors hover:text-primary ${
                isHome ? 'text-card/90 hover:text-card' : 'text-foreground'
              }`}
            >
              Restaurantes
            </Link>
            <Link
              to="/ofertas"
              className={`font-medium transition-colors hover:text-primary ${
                isHome ? 'text-card/90 hover:text-card' : 'text-foreground'
              }`}
            >
              Ofertas
            </Link>
            <Link
              to="/mis-reservas"
              className={`font-medium transition-colors hover:text-primary ${
                isHome ? 'text-card/90 hover:text-card' : 'text-foreground'
              }`}
            >
              Mis Reservas
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant={isHome ? 'outline' : 'ghost'} size="icon" className={isHome ? 'border-card/30 text-card hover:bg-card/10' : ''}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant={isHome ? 'secondary' : 'default'}>
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isHome ? 'text-card' : 'text-foreground'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isHome ? 'text-card' : 'text-foreground'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card rounded-2xl mb-4 p-6 shadow-elevated"
          >
            <nav className="flex flex-col gap-4">
              <Link to="/restaurantes" className="font-medium text-foreground py-2" onClick={() => setIsMenuOpen(false)}>
                Restaurantes
              </Link>
              <Link to="/ofertas" className="font-medium text-foreground py-2" onClick={() => setIsMenuOpen(false)}>
                Ofertas
              </Link>
              <Link to="/mis-reservas" className="font-medium text-foreground py-2" onClick={() => setIsMenuOpen(false)}>
                Mis Reservas
              </Link>
              <Button className="mt-4">
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
