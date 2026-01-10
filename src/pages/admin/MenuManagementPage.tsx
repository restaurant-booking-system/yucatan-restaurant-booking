import { useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Plus, Edit, Trash2, Star, Eye, EyeOff, GripVertical, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';

const categories = ['Entradas', 'Platillos Principales', 'Mariscos', 'Postres', 'Bebidas'];

const mockMenuItems = [
    { id: 1, name: 'Cochinita Pibil', description: 'Cerdo marinado en achiote', price: 180, category: 'Platillos Principales', isHighlighted: true, isVisible: true, image: '' },
    { id: 2, name: 'Papadzules', description: 'Tortillas bañadas en salsa de pepita', price: 140, category: 'Entradas', isHighlighted: true, isVisible: true, image: '' },
    { id: 3, name: 'Sopa de Lima', description: 'Caldo de pollo con lima', price: 95, category: 'Entradas', isHighlighted: false, isVisible: true, image: '' },
    { id: 4, name: 'Tikin Xic', description: 'Pescado al achiote asado', price: 280, category: 'Mariscos', isHighlighted: true, isVisible: true, image: '' },
    { id: 5, name: 'Marquesitas', description: 'Barquillo con queso y Nutella', price: 65, category: 'Postres', isHighlighted: false, isVisible: false, image: '' },
];

const MenuManagementPage = () => {
    const [items, setItems] = useState(mockMenuItems);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<typeof mockMenuItems[0] | null>(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);
    const totalItems = items.length;
    const highlightedCount = items.filter(i => i.isHighlighted).length;

    const toggleHighlight = (id: number) => { setItems(items.map(i => i.id === id ? { ...i, isHighlighted: !i.isHighlighted } : i)); };
    const toggleVisibility = (id: number) => { setItems(items.map(i => i.id === id ? { ...i, isVisible: !i.isVisible } : i)); };
    const deleteItem = (id: number) => { setItems(items.filter(i => i.id !== id)); };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div><h1 className="text-3xl font-display font-bold">Menú Digital</h1><p className="text-muted-foreground">{totalItems} platillos • {highlightedCount} destacados</p></div>
                    <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Nuevo platillo</Button>
                </div>

                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                    <TabsList className="flex-wrap"><TabsTrigger value="all">Todos ({items.length})</TabsTrigger>{categories.map(cat => <TabsTrigger key={cat} value={cat}>{cat} ({items.filter(i => i.category === cat).length})</TabsTrigger>)}</TabsList>
                </Tabs>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                            className={`bg-card rounded-xl p-4 shadow-card border-2 ${!item.isVisible ? 'opacity-50 border-muted' : item.isHighlighted ? 'border-warning/50' : 'border-transparent'}`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"><UtensilsCrossed className="w-6 h-6 text-muted-foreground" /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2"><h3 className="font-semibold truncate">{item.name}</h3>{item.isHighlighted && <Star className="w-4 h-4 fill-warning text-warning flex-shrink-0" />}</div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div><Badge variant="outline">{item.category}</Badge><p className="text-lg font-bold mt-1">${item.price}</p></div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => toggleHighlight(item.id)} title="Destacar"><Star className={`w-4 h-4 ${item.isHighlighted ? 'fill-warning text-warning' : ''}`} /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => toggleVisibility(item.id)} title="Visibilidad">{item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingItem ? 'Editar platillo' : 'Nuevo platillo'}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div><Label>Nombre</Label><Input placeholder="Nombre del platillo" defaultValue={editingItem?.name} /></div>
                            <div><Label>Descripción</Label><Textarea placeholder="Descripción breve" defaultValue={editingItem?.description} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Precio (MXN)</Label><Input type="number" placeholder="0" defaultValue={editingItem?.price} /></div>
                                <div><Label>Categoría</Label><Select defaultValue={editingItem?.category || categories[0]}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                            <div><Label>Imagen</Label><Button variant="outline" className="w-full gap-2"><Image className="w-4 h-4" />Subir imagen</Button></div>
                            <div className="flex items-center justify-between"><Label>Destacar en menú</Label><Switch defaultChecked={editingItem?.isHighlighted} /></div>
                        </div>
                        <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button>{editingItem ? 'Guardar' : 'Crear'}</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default MenuManagementPage;
