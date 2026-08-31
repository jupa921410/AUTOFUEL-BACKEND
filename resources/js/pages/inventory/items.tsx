import { useForm, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { AlertTriangle, ArrowDown, ArrowUp, Boxes, CheckCircle, Edit, FileDown, Filter, Package, Plus, RefreshCw, Search, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

type Category = { id: number; name: string; color: string };
type Item = { id: number; name: string; unit: string; current_stock: number; min_stock: number; cost_per_unit: number | null; notes: string | null; active: boolean; category: Category | null };
type LowItem = { id: number; name: string; unit: string; current_stock: number; min_stock: number; cost_per_unit: number | null };
type Props = { items: Item[]; categories: Category[]; filters: { category?: string; search?: string; low_stock?: string }; lowStockItems: LowItem[]; allItems: { id: number; name: string; unit: string; cost_per_unit: number | null }[] };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory — Items', href: '/inventory/items' },
];

const UNITS = ['unidad','kg','g','lb','oz','litro','ml','caja','bolsa','docena','paquete','lata','botella','rollo'];

type CartLine = { inventory_item_id: string; quantity: string; unit_price: string };

export default function InventoryItems({ items, categories, filters, lowStockItems, allItems }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showAddItem, setShowAddItem] = useState(false);
    const [showMovement, setShowMovement] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showPurchase, setShowPurchase] = useState(false);
    const [editTarget, setEditTarget] = useState<Item | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
    const [movementTarget, setMovementTarget] = useState<Item | null>(null);

    const itemForm = useForm({ name: '', inventory_category_id: '', unit: 'unidad', current_stock: '0', min_stock: '0', cost_per_unit: '', notes: '' });
    const editForm = useForm({ name: '', inventory_category_id: '', unit: 'unidad', min_stock: '0', cost_per_unit: '', notes: '', active: true as boolean });
    const movementForm = useForm({ inventory_item_id: '', type: 'in' as 'in'|'out'|'adjustment', quantity: '', reason: '' });
    const categoryForm = useForm({ name: '', color: '#6366f1' });
    const deleteForm = useForm({});
    const purchaseForm = useForm({ supplier: '', ordered_at: '', notes: '', items: [] as { inventory_item_id: number; quantity: number; unit_price: number }[] });

    // Initialize the cart with low-stock items
    const initCart = (): CartLine[] => lowStockItems.map(i => ({
        inventory_item_id: i.id.toString(),
        quantity: Math.max(0, i.min_stock - i.current_stock + 1).toFixed(3),
        unit_price: i.cost_per_unit?.toString() ?? '0',
    }));
    const [cartLines, setCartLines] = useState<CartLine[]>([]);

    function openPurchase() { setCartLines(initCart()); setShowPurchase(true); }

    function updateLine(i: number, f: keyof CartLine, v: string) {
        setCartLines(p => { const n = [...p]; n[i] = { ...n[i], [f]: v }; if (f === 'inventory_item_id') { const found = allItems.find(x => x.id === parseInt(v)); if (found?.cost_per_unit) n[i].unit_price = found.cost_per_unit.toString(); } return n; });
    }

    function addLine() { setCartLines(p => [...p, { inventory_item_id: '', quantity: '', unit_price: '' }]); }

    function submitPurchase() {
        const mapped = cartLines.filter(l => l.inventory_item_id && l.quantity).map(l => ({ inventory_item_id: parseInt(l.inventory_item_id), quantity: parseFloat(l.quantity), unit_price: parseFloat(l.unit_price) || 0 }));
        purchaseForm.transform((data) => ({ ...data, items: mapped }));
        purchaseForm.post('/inventory/purchases', { onSuccess: () => { purchaseForm.reset(); setCartLines([]); setShowPurchase(false); } });
    }

    const cartTotal = cartLines.reduce((s, l) => s + (parseFloat(l.quantity)||0)*(parseFloat(l.unit_price)||0), 0);

    function openEdit(item: Item) {
        editForm.setData({ name: item.name, inventory_category_id: item.category?.id?.toString() ?? '', unit: item.unit, min_stock: item.min_stock.toString(), cost_per_unit: item.cost_per_unit?.toString() ?? '', notes: item.notes ?? '', active: item.active });
        setEditTarget(item);
    }

    function openMovement(item: Item) {
        movementForm.setData({ inventory_item_id: item.id.toString(), type: 'in', quantity: '', reason: '' });
        setMovementTarget(item);
        setShowMovement(true);
    }

    function applyFilters(extra?: Record<string, string>) {
        router.get('/inventory/items', { search, ...filters, ...extra }, { preserveScroll: true });
    }

    const lowCount = items.filter(i => i.current_stock <= i.min_stock).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory — Items" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Boxes className="w-6 h-6 text-primary" /> Inventory Items
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {items.length} item{items.length !== 1 ? 's' : ''}.
                            {lowCount > 0 && <span className="ml-2 text-amber-600 font-medium">⚠️ {lowCount} low-stock</span>}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => setShowAddCategory(true)}><Tag className="w-4 h-4 mr-1" /> Category</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)}><Plus className="w-4 h-4 mr-1" /> New Item</Button>
                        {lowStockItems.length > 0 && (
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5" onClick={openPurchase}>
                                <ShoppingCart className="w-4 h-4" /> Realizar Purchase
                                <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{lowStockItems.length}</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search items…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={filters.category ?? ''} onChange={e => applyFilters({ category: e.target.value })}>
                            <option value="">All categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <Button size="sm" variant={filters.low_stock ? 'default' : 'outline'} onClick={() => applyFilters({ low_stock: filters.low_stock ? '' : '1' })} className={filters.low_stock ? 'bg-amber-500 hover:bg-amber-600 border-0' : ''}>
                            <AlertTriangle className="w-4 h-4 mr-1" /> Stock bajo
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            No items match the current filters.
                        </div>
                    )}
                    {items.map(item => {
                        const isLow = item.current_stock <= item.min_stock;
                        const pct = item.min_stock > 0 ? Math.min(100, (item.current_stock / (item.min_stock * 2)) * 100) : 100;
                        return (
                            <div key={item.id} className={`rounded-xl border bg-card shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-all ${isLow ? 'border-amber-300 bg-amber-50/50' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{item.name}</div>
                                        {item.category && (
                                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: item.category.color + '22', color: item.category.color }}>
                                                {item.category.name}
                                            </span>
                                        )}
                                    </div>
                                    {isLow && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Stock actual</span>
                                        <span className={`font-bold ${isLow ? 'text-amber-600' : ''}`}>{item.current_stock} {item.unit}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className={`h-full rounded-full ${isLow ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">Minimum: {item.min_stock} {item.unit}</div>
                                </div>
                                {item.cost_per_unit != null && <div className="text-xs text-muted-foreground">Costo: <strong>${item.cost_per_unit.toFixed(2)}</strong> / {item.unit}</div>}
                                <div className="flex gap-1 mt-auto pt-2 border-t">
                                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-green-700 border-green-200 hover:bg-green-50" onClick={() => openMovement(item)}>
                                        <RefreshCw className="w-3 h-3" /> Movimiento
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(item)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal: New Item */}
            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> New Item</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                            <Label>Name *</Label>
                            <Input value={itemForm.data.name} onChange={e => itemForm.setData('name', e.target.value)} placeholder="Ej: Arroz Largo" />
                            {itemForm.errors.name && <p className="text-xs text-destructive">{itemForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Category</Label>
                            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={itemForm.data.inventory_category_id} onChange={e => itemForm.setData('inventory_category_id', e.target.value)}>
                                <option value="">Uncategorized</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Unidad *</Label>
                            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={itemForm.data.unit} onChange={e => itemForm.setData('unit', e.target.value)}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Stock Inicial</Label>
                            <Input type="number" min="0" step="0.001" value={itemForm.data.current_stock} onChange={e => itemForm.setData('current_stock', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Minimum Stock (alerta)</Label>
                            <Input type="number" min="0" step="0.001" value={itemForm.data.min_stock} onChange={e => itemForm.setData('min_stock', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Costo / Unidad ($)</Label>
                            <Input type="number" min="0" step="0.01" value={itemForm.data.cost_per_unit} onChange={e => itemForm.setData('cost_per_unit', e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Notas</Label>
                            <Input value={itemForm.data.notes} onChange={e => itemForm.setData('notes', e.target.value)} placeholder="Opcional" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
                        <Button onClick={() => itemForm.post('/inventory/items', { onSuccess: () => { itemForm.reset(); setShowAddItem(false); } })} disabled={itemForm.processing}>
                            {itemForm.processing ? 'Saving…' : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Edit Item */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Edit: {editTarget?.name}</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                            <Label>Name *</Label>
                            <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Category</Label>
                            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={editForm.data.inventory_category_id} onChange={e => editForm.setData('inventory_category_id', e.target.value)}>
                                <option value="">Uncategorized</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Unidad *</Label>
                            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={editForm.data.unit} onChange={e => editForm.setData('unit', e.target.value)}>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label>Minimum Stock</Label>
                            <Input type="number" min="0" step="0.001" value={editForm.data.min_stock} onChange={e => editForm.setData('min_stock', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Costo / Unidad ($)</Label>
                            <Input type="number" min="0" step="0.01" value={editForm.data.cost_per_unit} onChange={e => editForm.setData('cost_per_unit', e.target.value)} />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label>Notas</Label>
                            <Input value={editForm.data.notes} onChange={e => editForm.setData('notes', e.target.value)} />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <input type="checkbox" id="edit-active" checked={editForm.data.active} onChange={e => editForm.setData('active', e.target.checked)} />
                            <Label htmlFor="edit-active">Item activo</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button onClick={() => editTarget && editForm.put(`/inventory/items/${editTarget.id}`, { onSuccess: () => setEditTarget(null) })} disabled={editForm.processing}>
                            {editForm.processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Movimiento */}
            <Dialog open={showMovement} onOpenChange={v => { if (!v) { setShowMovement(false); setMovementTarget(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Movimiento de Stock</DialogTitle>
                        {movementTarget && <DialogDescription>{movementTarget.name} — Stock actual: <strong>{movementTarget.current_stock} {movementTarget.unit}</strong></DialogDescription>}
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {(['in', 'out', 'adjustment'] as const).map(t => (
                                <button key={t} onClick={() => movementForm.setData('type', t)}
                                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors ${movementForm.data.type === t ? (t === 'in' ? 'border-green-500 bg-green-50 text-green-700' : t === 'out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'hover:bg-muted/50'}`}>
                                    {t === 'in' ? <ArrowUp className="w-5 h-5" /> : t === 'out' ? <ArrowDown className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                                    {t === 'in' ? 'Entrada' : t === 'out' ? 'Salida' : 'Ajuste'}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <Label>{movementForm.data.type === 'adjustment' ? 'Nuevo stock total' : 'Cantidad'}</Label>
                            <Input type="number" min="0.001" step="0.001" value={movementForm.data.quantity} onChange={e => movementForm.setData('quantity', e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-1">
                            <Label>Motivo (opcional)</Label>
                            <Input value={movementForm.data.reason} onChange={e => movementForm.setData('reason', e.target.value)} placeholder="Example: Waste, purchase, physical inventory..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowMovement(false); setMovementTarget(null); }}>Cancel</Button>
                        <Button onClick={() => movementForm.post('/inventory/movements', { onSuccess: () => { movementForm.reset(); setShowMovement(false); setMovementTarget(null); } })} disabled={movementForm.processing || !movementForm.data.quantity}>
                            {movementForm.processing ? 'Registrando…' : 'Registrar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: New Category */}
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Tag className="w-5 h-5" /> New Category</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Name *</Label>
                            <Input value={categoryForm.data.name} onChange={e => categoryForm.setData('name', e.target.value)} placeholder="Example: Dairy, Meat..." />
                            {categoryForm.errors.name && <p className="text-xs text-destructive">{categoryForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label>Color</Label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={categoryForm.data.color} onChange={e => categoryForm.setData('color', e.target.value)} className="h-9 w-16 rounded border border-input cursor-pointer" />
                                <span className="text-sm text-muted-foreground">{categoryForm.data.color}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                        <Button onClick={() => categoryForm.post('/inventory/categories', { onSuccess: () => { categoryForm.reset(); setShowAddCategory(false); } })} disabled={categoryForm.processing}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>This action will delete the item and its entire history.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteTarget && deleteForm.delete(`/inventory/items/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) })} disabled={deleteForm.processing}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Modal: Realizar Purchase */}
            <Dialog open={showPurchase} onOpenChange={v => { if (!v) setShowPurchase(false); }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-amber-500" /> Realizar Purchase — Stock Bajo</DialogTitle>
                        <DialogDescription>Low-stock items are preloaded. Adjust quantities and prices before confirming.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Proveedor</Label><input className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={purchaseForm.data.supplier} onChange={e => purchaseForm.setData('supplier', e.target.value)} placeholder="Supplier name" /></div>
                            <div className="space-y-1"><Label>Date</Label><input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm outline-none" value={purchaseForm.data.ordered_at} onChange={e => purchaseForm.setData('ordered_at', e.target.value)} /></div>
                        </div>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50"><tr>
                                    <th className="px-3 py-2 text-left font-medium">Item</th>
                                    <th className="px-3 py-2 text-left font-medium w-28">Cantidad</th>
                                    <th className="px-3 py-2 text-left font-medium w-28">Unit Price</th>
                                    <th className="px-3 py-2 text-right font-medium w-24">Subtotal</th>
                                    <th className="w-10" />
                                </tr></thead>
                                <tbody>
                                    {cartLines.map((line, i) => {
                                        const sub = (parseFloat(line.quantity)||0)*(parseFloat(line.unit_price)||0);
                                        const isLowItem = lowStockItems.find(x => x.id === parseInt(line.inventory_item_id));
                                        return (
                                            <tr key={i} className={`border-t ${isLowItem ? 'bg-amber-50/40' : ''}`}>
                                                <td className="px-3 py-2">
                                                    <select className="w-full h-8 rounded border border-input bg-background px-2 text-sm outline-none" value={line.inventory_item_id} onChange={e => updateLine(i, 'inventory_item_id', e.target.value)}>
                                                        <option value="">Select…</option>
                                                        {allItems.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit}){lowStockItems.find(x=>x.id===it.id) ? ' ⚠️' : ''}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2"><input className="w-full h-8 rounded border border-input bg-background px-2 text-sm outline-none" type="number" min="0.001" step="0.001" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} /></td>
                                                <td className="px-3 py-2"><input className="w-full h-8 rounded border border-input bg-background px-2 text-sm outline-none" type="number" min="0" step="0.01" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} /></td>
                                                <td className="px-3 py-2 text-right font-medium">${sub.toFixed(2)}</td>
                                                <td className="px-2 py-2">
                                                    {cartLines.length > 1 && <button onClick={() => setCartLines(p => p.filter((_,idx)=>idx!==i))} className="text-destructive hover:bg-destructive/10 rounded p-1"><X className="w-3.5 h-3.5" /></button>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-muted/30 border-t">
                                    <tr>
                                        <td colSpan={3} className="px-3 py-2 text-right font-semibold">Estimated total:</td>
                                        <td className="px-3 py-2 font-bold text-lg">${cartTotal.toFixed(2)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <button onClick={addLine} className="text-sm text-primary hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add another item</button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPurchase(false)}>Cancel</Button>
                        <Button
                            variant="outline"
                            className="gap-2 border-amber-400 text-amber-700 hover:bg-amber-50"
                            onClick={() => window.open('/inventory/low-stock-pdf', '_blank')}
                        >
                            <FileDown className="w-4 h-4" /> Descargar PDF
                        </Button>
                        <Button onClick={submitPurchase} disabled={purchaseForm.processing || cartLines.every(l => !l.inventory_item_id)} className="gap-2">
                            <CheckCircle className="w-4 h-4" />{purchaseForm.processing ? 'Creating…' : 'Create Purchase Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
