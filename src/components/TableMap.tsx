import { motion } from 'framer-motion';
import { Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
  availability_status: 'available' | 'reserved' | 'occupied' | 'blocked';
  is_selectable: boolean;
  position_x?: number;
  position_y?: number;
  shape?: 'round' | 'square' | 'rectangle';
}

interface TableMapProps {
  tables: Table[];
  selectedTableId?: string;
  onTableSelect: (table: Table) => void;
  isLoading?: boolean;
}

const TableMap = ({ tables, selectedTableId, onTableSelect, isLoading }: TableMapProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600 border-green-600';
      case 'reserved':
        return 'bg-yellow-500 border-yellow-600 cursor-not-allowed';
      case 'occupied':
        return 'bg-red-500 border-red-600 cursor-not-allowed';
      case 'blocked':
        return 'bg-gray-400 border-gray-500 cursor-not-allowed';
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Reservada';
      case 'occupied':
        return 'Ocupada';
      case 'blocked':
        return 'Bloqueada';
      default:
        return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando mesas disponibles...</p>
        </div>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay mesas disponibles para esta fecha y horario.</p>
        <p className="text-sm text-muted-foreground mt-2">Intenta con otra fecha u horario.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-green-500 border-2 border-green-600"></div>
          <span className="text-sm">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-yellow-500 border-2 border-yellow-600"></div>
          <span className="text-sm">Reservada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-red-500 border-2 border-red-600"></div>
          <span className="text-sm">Ocupada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-400 border-2 border-gray-500"></div>
          <span className="text-sm">Bloqueada</span>
        </div>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <motion.button
            key={table.id}
            whileHover={table.is_selectable ? { scale: 1.05 } : {}}
            whileTap={table.is_selectable ? { scale: 0.95 } : {}}
            onClick={() => table.is_selectable && onTableSelect(table)}
            disabled={!table.is_selectable}
            className={cn(
              'relative p-6 rounded-xl border-2 transition-all duration-200',
              getStatusColor(table.availability_status),
              selectedTableId === table.id && 'ring-4 ring-primary ring-offset-2',
              table.is_selectable ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
            )}
          >
            {/* Selected Checkmark */}
            {selectedTableId === table.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}

            {/* Table Number */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                Mesa {table.number}
              </div>

              {/* Capacity */}
              <div className="flex items-center justify-center gap-1 text-white/90">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{table.capacity} personas</span>
              </div>

              {/* Status Label */}
              <div className="mt-2 text-xs text-white/80 font-medium">
                {getStatusLabel(table.availability_status)}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Selection Info */}
      {selectedTableId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg"
        >
          <p className="text-sm font-medium text-center">
            Has seleccionado: <span className="font-bold">Mesa {tables.find(t => t.id === selectedTableId)?.number}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TableMap;
