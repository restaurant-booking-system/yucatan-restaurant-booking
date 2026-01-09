import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { Mesa } from '@/types/restaurant';
import { cn } from '@/lib/utils';

interface TableMapProps {
  mesas: Mesa[];
  selectedMesa: Mesa | null;
  onSelectMesa: (mesa: Mesa) => void;
  guestCount: number;
}

const TableMap = ({ mesas, selectedMesa, onSelectMesa, guestCount }: TableMapProps) => {
  const getStatusClass = (mesa: Mesa) => {
    if (selectedMesa?.id === mesa.id) return 'ring-4 ring-primary ring-offset-2';
    switch (mesa.status) {
      case 'disponible':
        return mesa.capacity >= guestCount ? 'mesa-disponible' : 'mesa-disponible opacity-50';
      case 'ocupada':
        return 'mesa-ocupada';
      case 'pendiente':
        return 'mesa-pendiente';
      case 'reservada':
        return 'mesa-reservada';
      default:
        return '';
    }
  };

  const canSelect = (mesa: Mesa) => {
    return mesa.status === 'disponible' && mesa.capacity >= guestCount;
  };

  const getStatusLabel = (status: Mesa['status']) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'ocupada': return 'Ocupada';
      case 'pendiente': return 'Pendiente';
      case 'reservada': return 'Reservada';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl font-semibold mb-4">Selecciona tu mesa</h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-mesa-disponible" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-mesa-ocupada" />
          <span>Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-mesa-pendiente" />
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-mesa-reservada" />
          <span>Reservada</span>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="relative bg-muted/50 rounded-xl p-4 min-h-[350px] overflow-x-auto">
        <div className="relative" style={{ minWidth: '380px', minHeight: '300px' }}>
          {mesas.map((mesa) => (
            <motion.button
              key={mesa.id}
              whileHover={canSelect(mesa) ? { scale: 1.05 } : {}}
              whileTap={canSelect(mesa) ? { scale: 0.95 } : {}}
              onClick={() => canSelect(mesa) && onSelectMesa(mesa)}
              disabled={!canSelect(mesa)}
              className={cn(
                'absolute mesa transition-all duration-200',
                getStatusClass(mesa),
                mesa.shape === 'round' && 'rounded-full',
                mesa.shape === 'square' && 'rounded-xl',
                mesa.shape === 'rectangle' && 'rounded-xl',
                selectedMesa?.id === mesa.id && 'bg-primary text-primary-foreground'
              )}
              style={{
                left: mesa.x,
                top: mesa.y,
                width: mesa.width,
                height: mesa.height,
              }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {selectedMesa?.id === mesa.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <>
                    <span className="font-bold text-sm">{mesa.number}</span>
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <Users className="h-3 w-3" />
                      {mesa.capacity}
                    </div>
                  </>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedMesa && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary">Mesa {selectedMesa.number} seleccionada</p>
              <p className="text-sm text-muted-foreground">Capacidad: {selectedMesa.capacity} personas</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TableMap;
