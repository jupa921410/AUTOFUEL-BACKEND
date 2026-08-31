import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, Category } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/categories' },
];

type Props = {
    categories: Category[];
};

type CategoryForm = {
    name: string;
    description: string;
};

export default function CategoriesIndex({ categories }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    const createForm = useForm<CategoryForm>({ name: '', description: '' });
    const editForm = useForm<CategoryForm>({ name: '', description: '' });
    const deleteForm = useForm({});

    function openEdit(cat: Category) {

        setEditTarget(cat);
        editForm.setData({ name: cat.name, description: cat.description ?? '' });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/categories', {
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/categories/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/categories/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground text-sm">Manage product categories.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Category
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">#</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No categories have been added.
                                    </td>
                                </tr>
                            )}
                            {categories.map((cat, i) => (
                                <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{cat.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => { openEdit(cat) }}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => {
                                                if ([1, 2, 3, 4, 5, 6, 7].includes(cat.id)) {
                                                    alert(`The category cannot be deleted ${cat.name}`);
                                                    return false;
                                                } setDeleteTarget(cat)
                                            }}>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Category</DialogTitle>
                        <DialogDescription>Enter the details to create a new category.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name">Name *</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="Ej. Bebidas"
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
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the category details.</DialogDescription>
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
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the category <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
