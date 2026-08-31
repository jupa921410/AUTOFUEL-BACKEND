import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { CheckCircle, Package, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvailableItem = { id: number; name: string; unit: string; cost_per_unit: number | null };

type PurchaseLineItem = { id: number; item_id: number; item: { id: number; name: string; unit: string } | null; quantity: number; unit_price: number; subtotal: number };

type Purchase = {
    id: number;
    supplier: string | null;
    status: 'draft' | 'ordered' | 'received' | 'cancelled';
    status_label: string;
    total: number;
    ordered_at: string | null;
    received_at: string | null;
    notes: string | null;
    user: { id: number; name: string } | null;
    items: PurchaseLineItem[];
    created_at: string;
};

type Props = { purchases: Purchase[]; items: AvailableItem[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/items' },
    { title: 'Purchases', href: '/inventory/purchases' },
];

const STATUS_STYLES: Record<string, string> = {
    draft:     'bg-zinc-100 text-zinc-600 border-zinc-200',
    ordered:   'bg-blue-100 text-blue-700 border-blue-200',
    received:  'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

// ─── Component ────────────────────────────────────────────────────────────────

type CartLine = { inventory_item_id: string; quantity: string; unit_price: string };

export default function InventoryPurchases({ purchases, items }: Props) {
    const [showNew, setShowNew]           = useState(false);
    const [detailTarget, setDetailTarget] = useState<Purchase | null>(null);
    const [receiveTarget, setReceiveTarget] = useState<Purchase | null>(null);
    const [deleteTarget, setDeleteTarget]   = useState<Purchase | null>(null);

    // Cart lines for new purchase
    const [cartLines, setCartLines] = useState<CartLine[]>([{ inventory_item_id: '', quantity: '', unit_price: '' }]);

    const purchaseForm = useForm({ supplier: '', ordered_at: '', notes: '', items: [] as { inventory_item_id: number; quantity: number; unit_price: number }[] });
    const receiveForm  = useForm({});
    const cancelForm   = useForm({});
    const deleteForm   = useForm({});

    function addLine() { setCartLines(p => [...p, { inventory_item_id: '', quantity: '', unit_price: '' }]); }

    function removeLine(i: number) { setCartLines(p => p.filter((_, idx) => idx !== i)); }

    function updateLine(i: number, field: keyof CartLine, val: string) {
        setCartLines(p => {
            const next = [...p];
            next[i] = { ...next[i], [field]: val };
            // Autofill the price when an item is selected
            if (field === 'inventory_item_id') {
                const found = items.find(it => it.id === parseInt(val));
                if (found?.cost_per_unit) next[i].unit_price = found.cost_per_unit.toString();
            }
            return next;
        });
    }

    const cartTotal = cartLines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unit_price) || 0), 0);

    function submitPurchase() {
        const mapped = cartLines
            .filter(l => l.inventory_item_id && l.quantity)
            .map(l => ({ inventory_item_id: parseInt(l.inventory_item_id), quantity: parseFloat(l.quantity), unit_price: parseFloat(l.unit_price) || 0 }));
        purchaseForm.transform((data) => ({ ...data, items: mapped }));
        purchaseForm.post('/inventory/purchases', {
            onSuccess: () => { purchaseForm.reset(); setCartLines([{ inventory_item_id: '', quantity: '', unit_price: '' }]); setShowNew(false); },
        });
    }

    function handleReceive() {
        if (!receiveTarget) return;
        receiveForm.post(`/inventory/purchases/${receiveTarget.id}/receive`, {
            onSuccess: () => setReceiveTarget(null),
        });
    }

    function handleCancel(purchase: Purchase) {
        cancelForm.post(`/inventory/purchases/${purchase.id}/cancel`, { preserveScroll: true });
    }

    function handleDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/inventory/purchases/${deleteTarget.id}`, { onSuccess: () => setDeleteTarget(null) });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory — Purchases" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-primary" /> Purchase Orders
                        </h1>
                        <p className="text-muted-foreground text-sm">{purchases.length} order{purchases.length !== 1 ? 'es' : ''} recorded{purchases.length !== 1 ? 's' : ''}.</p>
                    </div>
                    <Button size="sm" onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" /> Nueva Purchase</Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">#</th>
                                <th className="px-4 py-3 text-left font-semibold">Proveedor</th>
                                <th className="px-4 py-3 text-left font-semibold">Items</th>
                                <th className="px-4 py-3 text-left font-semibold">Total</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                <th className="px-4 py-3 text-left font-semibold">Ordered By</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    There are no purchase orders yet.
                                </td></tr>
                            )}
                            {purchases.map(p => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-muted-foreground">#{p.id}</td>
                                    <td className="px-4 py-3 font-medium">{p.supplier ?? <span className="text-muted-foreground italic">No supplier</span>}</td>
                                    <td className="px-4 py-3">
                                        <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setDetailTarget(p)}>
                                            {p.items.length} item{p.items.length !== 1 ? 's' : ''} — view details
                                        </Button>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">${p.total.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status]}`}>{p.status_label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        <div>{p.ordered_at ?? '—'}</div>
                                        {p.received_at && <div className="text-green-600">Recibido: {p.received_at}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.user?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {p.status === 'ordered' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => setReceiveTarget(p)}>
                                                    <CheckCircle className="w-3.5 h-3.5" /> Recibir
                                                </Button>
                                            )}
                                            {['draft','ordered'].includes(p.status) && (
                                                <Button size="icon" variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => handleCancel(p)} title="Cancel">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {p.status !== 'received' && (
                                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(p)} title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Nueva Purchase */}
            <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Nueva Order de Purchase</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Proveedor</Label>
                                <Input value={purchaseForm.data.supplier} onChange={e => purchaseForm.setData('supplier', e.target.value)} placeholder="Supplier name" />
                            </div>
                            <div className="space-y-1">
                                <Label>Order Date</Label>
                                <Input type="date" value={purchaseForm.data.ordered_at} onChange={e => purchaseForm.setData('ordered_at', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label>Notas</Label>
                                <Input value={purchaseForm.data.notes} onChange={e => purchaseForm.setData('notes', e.target.value)} placeholder="Opcional" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Items to Purchase</Label>
                                <Button size="sm" variant="outline" onClick={addLine}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Item</th>
                                            <th className="px-3 py-2 text-left font-medium w-28">Cantidad</th>
                                            <th className="px-3 py-2 text-left font-medium w-28">Unit Price</th>
                                            <th className="px-3 py-2 text-left font-medium w-24">Subtotal</th>
                                            <th className="w-10" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartLines.map((line, i) => {
                                            const sub = (parseFloat(line.quantity) || 0) * (parseFloat(line.unit_price) || 0);
                                            return (
                                                <tr key={i} className="border-t">
                                                    <td className="px-3 py-2">
                                                        <select className="w-full h-8 rounded border border-input bg-background px-2 text-sm outline-none" value={line.inventory_item_id} onChange={e => updateLine(i, 'inventory_item_id', e.target.value)}>
                                                            <option value="">Select…</option>
                                                            {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.unit})</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input className="h-8" type="number" min="0.001" step="0.001" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} placeholder="0" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input className="h-8" type="number" min="0" step="0.01" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} placeholder="0.00" />
                                                    </td>
                                                    <td className="px-3 py-2 font-medium text-right">${sub.toFixed(2)}</td>
                                                    <td className="px-2 py-2">
                                                        {cartLines.length > 1 && (
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeLine(i)}><X className="w-3.5 h-3.5" /></Button>
                                                        )}
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
                            {purchaseForm.errors.items && <p className="text-xs text-destructive">{purchaseForm.errors.items as unknown as string}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                        <Button onClick={submitPurchase} disabled={purchaseForm.processing || cartLines.every(l => !l.inventory_item_id)}>
                            {purchaseForm.processing ? 'Creating…' : 'Create Purchase Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Purchase details */}
            <Dialog open={!!detailTarget} onOpenChange={v => !v && setDetailTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Purchase #{detailTarget?.id} — {detailTarget?.supplier ?? 'No supplier'}</DialogTitle>
                        <DialogDescription>{detailTarget?.notes}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        {detailTarget?.items.map(line => (
                            <div key={line.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-2 text-sm">
                                <div>
                                    <span className="font-medium">{line.item?.name ?? '—'}</span>
                                    <span className="text-muted-foreground ml-2">× {line.quantity} {line.item?.unit}</span>
                                    <span className="text-muted-foreground ml-2">@ ${line.unit_price.toFixed(2)}</span>
                                </div>
                                <div className="font-semibold">${line.subtotal.toFixed(2)}</div>
                            </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t font-bold text-lg">
                            <span>Total</span>
                            <span>${detailTarget?.total.toFixed(2)}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Confirm Receipt */}
            <Dialog open={!!receiveTarget} onOpenChange={v => !v && setReceiveTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Confirm Receipt</DialogTitle>
                        <DialogDescription>After confirmation, each item’s stock will increase automatically.</DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
                        <div><span className="text-muted-foreground">Purchase:</span> <strong>#{receiveTarget?.id}</strong></div>
                        <div><span className="text-muted-foreground">Proveedor:</span> <strong>{receiveTarget?.supplier ?? '—'}</strong></div>
                        <div><span className="text-muted-foreground">Total:</span> <strong>${receiveTarget?.total.toFixed(2)}</strong></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReceiveTarget(null)}>Cancel</Button>
                        <Button onClick={handleReceive} disabled={receiveForm.processing} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {receiveForm.processing ? 'Processing…' : 'Confirm Receipt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Purchase</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete purchase <strong>#{deleteTarget?.id}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteForm.processing}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
