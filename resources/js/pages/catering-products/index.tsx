import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

export type CateringProduct = {
    id: number;
    name: string;
    description: string | null;
    price: string | number;
    image: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Catering Products', href: '/catering-products' },
];

function imgSrc(image: string | null): string | null {
    if (!image) return null;
    if (image.startsWith('images/')) return `/${image}`;
    return `/storage/${image}`;
}

type Props = {
    cateringProducts: CateringProduct[];
};

type FormState = {
    name: string;
    description: string;
    price: string;
    image: File | null;
};

export default function CateringProductsIndex({ cateringProducts }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<CateringProduct | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CateringProduct | null>(null);
    
    // Preview States
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const createFileRef = useRef<HTMLInputElement>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const createForm = useForm<FormState>({ name: '', description: '', price: '', image: null });
    const editForm = useForm<FormState>({ name: '', description: '', price: '', image: null });
    const deleteForm = useForm({});

    function openEdit(prod: CateringProduct) {
        setEditTarget(prod);
        setEditPreview(imgSrc(prod.image));
        editForm.setData({ 
            name: prod.name, 
            description: prod.description ?? '', 
            price: String(prod.price),
            image: null
        });
    }

    function handleCreateImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        createForm.setData('image', file);
        setCreatePreview(file ? URL.createObjectURL(file) : null);
    }

    function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        editForm.setData('image', file);
        setEditPreview(file ? URL.createObjectURL(file) : imgSrc(editTarget?.image ?? null));
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.transform(data => {
            const payload: Record<string, unknown> = { ...data };
            if (!payload.image) delete payload.image;
            return payload;
        });
        createForm.post('/catering-products', {
            forceFormData: true,
            onSuccess: () => {
                setOpenCreate(false);
                setCreatePreview(null);
                createForm.reset();
                if (createFileRef.current) createFileRef.current.value = '';
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.transform(data => {
            const payload: Record<string, unknown> = { ...data, _method: 'PUT' };
            if (!payload.image) delete payload.image;
            return payload;
        });
        editForm.post(`/catering-products/${editTarget.id}`, {
            forceFormData: true,
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/catering-products/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catering Products" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Catering Products</h1>
                        <p className="text-muted-foreground text-sm">Manage the products included in catering packages.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Product
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Imagen</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-left font-semibold">Price</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cateringProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No products have been added.
                                    </td>
                                </tr>
                            )}
                            {cateringProducts.map((prod) => (
                                <tr key={prod.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        {prod.image ? (
                                            <img
                                                src={imgSrc(prod.image)!}
                                                alt={prod.name}
                                                className="h-10 w-10 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-[10px]">
                                                No image
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{prod.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{prod.description ?? '—'}</td>
                                    <td className="px-4 py-3 font-semibold">${Number(prod.price).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(prod)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(prod)}>
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
            <Dialog open={openCreate} onOpenChange={v => {
                setOpenCreate(v);
                if (!v) { setCreatePreview(null); createForm.reset(); }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Product</DialogTitle>
                        <DialogDescription>Enter the details to create a new product.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name">Name *</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="Example: Cheese Stick Platter"
                            />
                            {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-desc">Description</Label>
                            <Input
                                id="create-desc"
                                value={createForm.data.description}
                                onChange={e => createForm.setData('description', e.target.value)}
                                placeholder="Description opcional"
                            />
                            {createForm.errors.description && <p className="text-destructive text-xs">{createForm.errors.description}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-price">Price *</Label>
                            <Input
                                id="create-price"
                                type="number"
                                min="0" step="0.01"
                                value={createForm.data.price}
                                onChange={e => createForm.setData('price', e.target.value)}
                            />
                            {createForm.errors.price && <p className="text-destructive text-xs">{createForm.errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-img">Imagen</Label>
                            <Input 
                                id="create-img" 
                                type="file" 
                                accept="image/*" 
                                ref={createFileRef} 
                                onChange={handleCreateImageChange} 
                                className="cursor-pointer" 
                            />
                            {createForm.errors.image && <p className="text-destructive text-xs">{createForm.errors.image}</p>}
                        </div>
                        {createPreview && (
                            <img src={createPreview} alt="preview" className="h-32 w-full rounded-lg object-cover border" />
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Update the product details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">Name *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)}
                            />
                            {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-desc">Description</Label>
                            <Input
                                id="edit-desc"
                                value={editForm.data.description}
                                onChange={e => editForm.setData('description', e.target.value)}
                            />
                            {editForm.errors.description && <p className="text-destructive text-xs">{editForm.errors.description}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-price">Price *</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                min="0" step="0.01"
                                value={editForm.data.price}
                                onChange={e => editForm.setData('price', e.target.value)}
                            />
                            {editForm.errors.price && <p className="text-destructive text-xs">{editForm.errors.price}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-img">Cambiar Imagen</Label>
                            <Input 
                                id="edit-img" 
                                type="file" 
                                accept="image/*" 
                                ref={editFileRef} 
                                onChange={handleEditImageChange} 
                                className="cursor-pointer" 
                            />
                            {editForm.errors.image && <p className="text-destructive text-xs">{editForm.errors.image}</p>}
                        </div>
                        {editPreview && (
                            <img src={editPreview} alt="preview" className="h-32 w-full rounded-lg object-cover border" />
                        )}
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
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the product <strong>{deleteTarget?.name}</strong>?
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
