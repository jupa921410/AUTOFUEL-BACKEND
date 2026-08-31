import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem } from '@/types';

type ProductBrief = { id: number; name: string; price: string | number };

export type Catering = {
    id: number;
    name: string;
    description: string | null;
    pax: number;
    price: string | number;
    catering_products?: ProductBrief[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Caterings', href: '/caterings' },
];

type Props = {
    caterings: Catering[];
    availableProducts: ProductBrief[];
};

type FormState = {
    name: string;
    description: string;
    pax: string;
    price: string;
    products: number[];
};

export default function CateringsIndex({ caterings, availableProducts }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Catering | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Catering | null>(null);

    const createForm = useForm<FormState>({ name: '', description: '', pax: '1', price: '0', products: [] });
    const editForm = useForm<FormState>({ name: '', description: '', pax: '1', price: '0', products: [] });
    const deleteForm = useForm({});

    // Calculate suggested price for create form based on selected products
    const createSuggestedPrice = useMemo(() => {
        return createForm.data.products.reduce((acc, id) => {
            const prod = availableProducts.find(p => p.id === id);
            return acc + (prod ? Number(prod.price) : 0);
        }, 0);
    }, [createForm.data.products, availableProducts]);

    function openEdit(cat: Catering) {
        setEditTarget(cat);
        const productIds = cat.catering_products?.map(p => p.id) || [];
        editForm.setData({
            name: cat.name,
            description: cat.description ?? '',
            pax: String(cat.pax),
            price: String(cat.price),
            products: productIds,
        });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/caterings', {
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/caterings/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/caterings/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Caterings" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Caterings</h1>
                        <p className="text-muted-foreground text-sm">Manage catering packages.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Catering Package
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">#</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">PAX (Personas)</th>
                                <th className="px-4 py-3 text-left font-semibold">Price</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {caterings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No catering packages have been added.
                                    </td>
                                </tr>
                            )}
                            {caterings.map((cat, i) => (
                                <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium">
                                        {cat.name}
                                        {cat.catering_products && cat.catering_products.length > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {cat.catering_products.length} products incluidos
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{cat.pax} <span className="text-xs text-muted-foreground">personas</span></td>
                                    <td className="px-4 py-3 font-semibold">${Number(cat.price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(cat)}>
                                                <TrashIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Catering Package</DialogTitle>
                        <DialogDescription>Create a new catering package.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="create-name">Name *</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.data.name}
                                    onChange={e => createForm.setData('name', e.target.value)}
                                    placeholder="Example: Holiday Catering"
                                />
                                {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                            </div>
                            
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="create-desc">Description</Label>
                                <Input
                                    id="create-desc"
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-pax">Personas (PAX) *</Label>
                                <Input
                                    id="create-pax"
                                    type="number" min="1"
                                    value={createForm.data.pax}
                                    onChange={e => createForm.setData('pax', e.target.value)}
                                />
                                {createForm.errors.pax && <p className="text-destructive text-xs">{createForm.errors.pax}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="create-price">Price *</Label>
                                    <Button 
                                        type="button" variant="ghost" size="sm" 
                                        className="h-6 text-xs text-primary"
                                        onClick={() => createForm.setData('price', String(createSuggestedPrice))}
                                    >
                                        Sugerir (${createSuggestedPrice.toFixed(2)})
                                    </Button>
                                </div>
                                <Input
                                    id="create-price"
                                    type="number" min="0" step="0.01"
                                    value={createForm.data.price}
                                    onChange={e => createForm.setData('price', e.target.value)}
                                />
                                {createForm.errors.price && <p className="text-destructive text-xs">{createForm.errors.price}</p>}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Included Products</Label>
                                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-3 bg-muted/20">
                                    {availableProducts.length === 0 && (
                                        <p className="text-xs text-muted-foreground">No products are available. Create one first.</p>
                                    )}
                                    {availableProducts.map(prod => (
                                        <div key={prod.id} className="flex flex-row items-start space-x-3">
                                            <Checkbox
                                                id={`c-prod-${prod.id}`}
                                                checked={createForm.data.products.includes(prod.id)}
                                                onCheckedChange={(checked) => {
                                                    const current = createForm.data.products;
                                                    if (checked) {
                                                        createForm.setData('products', [...current, prod.id]);
                                                    } else {
                                                        createForm.setData('products', current.filter(id => id !== prod.id));
                                                    }
                                                }}
                                            />
                                            <div className="grid leading-none gap-1">
                                                <Label htmlFor={`c-prod-${prod.id}`} className="font-medium cursor-pointer">
                                                    {prod.name}
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    +${Number(prod.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {createForm.errors.products && <p className="text-destructive text-xs">{createForm.errors.products}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Catering</DialogTitle>
                        <DialogDescription>Update the catering package.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="edit-name">Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                            </div>
                            
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="edit-desc">Description</Label>
                                <Input
                                    id="edit-desc"
                                    value={editForm.data.description}
                                    onChange={e => editForm.setData('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-pax">Personas (PAX) *</Label>
                                <Input
                                    id="edit-pax"
                                    type="number" min="1"
                                    value={editForm.data.pax}
                                    onChange={e => editForm.setData('pax', e.target.value)}
                                />
                                {editForm.errors.pax && <p className="text-destructive text-xs">{editForm.errors.pax}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-price">Price *</Label>
                                <Input
                                    id="edit-price"
                                    type="number" min="0" step="0.01"
                                    value={editForm.data.price}
                                    onChange={e => editForm.setData('price', e.target.value)}
                                />
                                {editForm.errors.price && <p className="text-destructive text-xs">{editForm.errors.price}</p>}
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Included Products</Label>
                                <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-3 bg-muted/20">
                                    {availableProducts.map(prod => (
                                        <div key={prod.id} className="flex flex-row items-start space-x-3">
                                            <Checkbox
                                                id={`e-prod-${prod.id}`}
                                                checked={editForm.data.products.includes(prod.id)}
                                                onCheckedChange={(checked) => {
                                                    const current = editForm.data.products;
                                                    if (checked) {
                                                        editForm.setData('products', [...current, prod.id]);
                                                    } else {
                                                        editForm.setData('products', current.filter(id => id !== prod.id));
                                                    }
                                                }}
                                            />
                                            <div className="grid leading-none gap-1">
                                                <Label htmlFor={`e-prod-${prod.id}`} className="font-medium cursor-pointer">
                                                    {prod.name}
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    +${Number(prod.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Catering</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteForm.processing}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
