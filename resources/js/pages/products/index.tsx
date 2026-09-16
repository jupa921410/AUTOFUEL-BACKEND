import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, StarIcon, TrashIcon, XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem, Category, Product, ProductSize } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Products', href: '/products' },
];

/** Resolves the correct URL for a product image regardless of where it is stored */
function imgSrc(image: string | null): string | null {
    if (!image) return null;
    // Seeded images live directly in public/images/
    if (image.startsWith('images/')) return `/${image}`;
    // Admin-uploaded images are in the storage public disk
    return `/storage/${image}`;
}

type SizeRow = {
    label: string;
    price: string;
};

type Props = {
    products: Product[];
    categories: Category[];
};

type ProductForm = {
    category_id: string;
    name: string;
    description: string;
    price: string;
    image: File | null;
    featured: boolean;
    sizes: SizeRow[];
};

// ─── Size editor sub-component ────────────────────────────────────────────────
function SizesEditor({
    sizes,
    onChange,
}: {
    sizes: SizeRow[];
    onChange: (sizes: SizeRow[]) => void;
}) {
    function addRow() {
        onChange([...sizes, { label: '', price: '' }]);
    }

    function updateRow(idx: number, field: keyof SizeRow, value: string) {
        const next = sizes.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
        onChange(next);
    }

    function removeRow(idx: number) {
        onChange(sizes.filter((_, i) => i !== idx));
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Sizes &amp; Prices</Label>
                <Button type="button" size="sm" variant="outline" onClick={addRow}>
                    <PlusIcon className="mr-1 h-3.5 w-3.5" />
                    Add size
                </Button>
            </div>

            {sizes.length === 0 && (
                <p className="text-muted-foreground text-xs italic py-1">
                    No sizes added — use the single price field above, or add sizes below.
                </p>
            )}

            {sizes.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <Input
                        placeholder="16OZ"
                        value={row.label}
                        onChange={e => updateRow(idx, 'label', e.target.value)}
                        className="flex-1"
                    />
                    <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={row.price}
                            onChange={e => updateRow(idx, 'price', e.target.value)}
                            className="pl-6"
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeRow(idx)}
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
}

// ─── Sizes display badge ───────────────────────────────────────────────────────
function SizesBadges({ sizes, fallbackPrice }: { sizes?: ProductSize[]; fallbackPrice: string }) {
    if (!sizes || sizes.length === 0) {
        return <span className="font-semibold">${Number(fallbackPrice).toFixed(2)}</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {sizes.map(s => (
                <span
                    key={s.id}
                    className="inline-flex items-center gap-0.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                >
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="mx-0.5 text-muted-foreground/50">·</span>
                    <span>${Number(s.price).toFixed(2)}</span>
                </span>
            ))}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsIndex({ products, categories }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const createFileRef = useRef<HTMLInputElement>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const createForm = useForm<ProductForm>({
        category_id: '',
        name: '',
        description: '',
        price: '',
        image: null,
        featured: false,
        sizes: [],
    });

    const editForm = useForm<ProductForm>({
        category_id: '',
        name: '',
        description: '',
        price: '',
        image: null,
        featured: false,
        sizes: [],
    });

    const deleteForm = useForm({});

    function openEdit(product: Product) {
        setEditTarget(product);
        setEditPreview(imgSrc(product.image));
        editForm.setData({
            category_id: String(product.category_id),
            name: product.name,
            description: product.description ?? '',
            price: product.price,
            image: null,
            featured: product.featured,
            sizes: (product.sizes ?? []).map(s => ({ label: s.label, price: s.price })),
        });
    }

    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

    function handleCreateImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_IMAGE_BYTES) {
            createForm.setError('image', 'The image cannot exceed 5 MB.');
            e.target.value = '';
            return;
        }
        createForm.clearErrors('image');
        createForm.setData('image', file);
        setCreatePreview(file ? URL.createObjectURL(file) : null);
    }

    function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_IMAGE_BYTES) {
            editForm.setError('image', 'The image cannot exceed 5 MB.');
            e.target.value = '';
            return;
        }
        editForm.clearErrors('image');
        editForm.setData('image', file);
        setEditPreview(file ? URL.createObjectURL(file) : imgSrc(editTarget?.image ?? null));
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.transform((data) => {
            const payload = { ...data } as Record<string, unknown>;
            if (!payload.image) delete payload.image;
            if ((payload.sizes as SizeRow[]).length === 0) delete payload.sizes;
            return payload as typeof data;
        });
        createForm.post('/products', {
            forceFormData: true,
            onSuccess: () => {
                setOpenCreate(false);
                setCreatePreview(null);
                createForm.reset();
                createForm.transform((d) => d); // reset transform
                if (createFileRef.current) createFileRef.current.value = '';
            },
            onError: (errors) => {
                console.error('Errors creating product:', errors);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.transform((data) => {
            const payload = { ...data, _method: 'PUT' } as Record<string, unknown>;
            if (!payload.image) delete payload.image;
            return payload as typeof data;
        });
        editForm.post(`/products/${editTarget.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditTarget(null);
                setEditPreview(null);
                editForm.transform((d) => d); // reset transform
                if (editFileRef.current) editFileRef.current.value = '';
            },
            onError: (errors) => {
                console.error('Errors updating product:', errors);
            },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/products/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground text-sm">Manage the AutoFuel product catalog.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Product
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Image</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Category</th>
                                <th className="px-4 py-3 text-left font-semibold">Price / Sizes</th>
                                <th className="px-4 py-3 text-left font-semibold">Featured</th>
                                <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No products have been added.
                                    </td>
                                </tr>
                            )}
                            {products.map((product) => (
                                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        {product.image ? (
                                            <img
                                                src={imgSrc(product.image)!}
                                                alt={product.name}
                                                className="h-12 w-12 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                                No image
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {product.name}
                                        {product.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <SizesBadges sizes={product.sizes} fallbackPrice={product.price} />
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.featured ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                                <StarIcon className="h-3.5 w-3.5 fill-current" /> Featured
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(product)}>
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
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Product</DialogTitle>
                        <DialogDescription>Enter the details to add a new product.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Category *</Label>
                                <Select value={createForm.data.category_id} onValueChange={v => createForm.setData('category_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {createForm.errors.category_id && <p className="text-destructive text-xs">{createForm.errors.category_id}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="c-name">Name *</Label>
                                <Input id="c-name" value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} />
                                {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="c-desc">Description</Label>
                                <Input id="c-desc" value={createForm.data.description} onChange={e => createForm.setData('description', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-price">Base Price <span className="text-muted-foreground text-xs">(optional if sizes defined)</span></Label>
                                <Input id="c-price" type="number" min="0" step="0.01" value={createForm.data.price} onChange={e => createForm.setData('price', e.target.value)} />
                                {createForm.errors.price && <p className="text-destructive text-xs">{createForm.errors.price}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-img">Image</Label>
                                <Input id="c-img" type="file" accept="image/*" ref={createFileRef} onChange={handleCreateImageChange} className="cursor-pointer" />
                                {createForm.errors.image && <p className="text-destructive text-xs">{createForm.errors.image}</p>}
                            </div>
                            <div className="col-span-2 flex items-center gap-2 rounded-lg border p-3">
                                <Checkbox id="c-featured" checked={createForm.data.featured} onCheckedChange={checked => createForm.setData('featured', checked === true)} />
                                <Label htmlFor="c-featured" className="cursor-pointer">Featured Product</Label>
                            </div>

                            {/* Sizes */}
                            <div className="col-span-2 rounded-lg border p-3 space-y-2 bg-muted/30">
                                <SizesEditor
                                    sizes={createForm.data.sizes}
                                    onChange={rows => createForm.setData('sizes', rows)}
                                />
                            </div>
                        </div>
                        {createPreview && (
                            <img src={createPreview} alt="preview" className="h-32 w-full rounded-lg object-cover border" />
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setOpenCreate(false); setCreatePreview(null); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Update the product details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Category *</Label>
                                <Select value={editForm.data.category_id} onValueChange={v => editForm.setData('category_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.category_id && <p className="text-destructive text-xs">{editForm.errors.category_id}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Name *</Label>
                                <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} />
                                {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Description</Label>
                                <Input value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Base Price <span className="text-muted-foreground text-xs">(optional if sizes defined)</span></Label>
                                <Input type="number" min="0" step="0.01" value={editForm.data.price} onChange={e => editForm.setData('price', e.target.value)} />
                                {editForm.errors.price && <p className="text-destructive text-xs">{editForm.errors.price}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Change Image</Label>
                                <Input type="file" accept="image/*" ref={editFileRef} onChange={handleEditImageChange} className="cursor-pointer" />
                                {editForm.errors.image && <p className="text-destructive text-xs">{editForm.errors.image}</p>}
                            </div>
                            <div className="col-span-2 flex items-center gap-2 rounded-lg border p-3">
                                <Checkbox id="e-featured" checked={editForm.data.featured} onCheckedChange={checked => editForm.setData('featured', checked === true)} />
                                <Label htmlFor="e-featured" className="cursor-pointer">Featured Product</Label>
                            </div>

                            {/* Sizes */}
                            <div className="col-span-2 rounded-lg border p-3 space-y-2 bg-muted/30">
                                <SizesEditor
                                    sizes={editForm.data.sizes}
                                    onChange={rows => editForm.setData('sizes', rows)}
                                />
                            </div>
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
                        Are you sure you want to permanently delete the product <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
