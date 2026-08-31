import { useForm, Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Public Reviews', href: '/reviews' },
];

type ReviewItem = {
    id: number;
    author_name: string;
    author_initials: string;
    avatar_color: string;
    rating: number;
    text: string;
    date: string | null;
    active: boolean;
    sort_order: number;
};

type Props = {
    reviews: ReviewItem[];
};

type ReviewForm = {
    author_name: string;
    author_initials: string;
    avatar_color: string;
    rating: number;
    text: string;
    date: string;
    active: boolean;
    sort_order: number;
};

export default function ReviewsIndex({ reviews }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<ReviewItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);

    const defaultForm = {
        author_name: '',
        author_initials: '',
        avatar_color: 'bg-orange-500',
        rating: 5,
        text: '',
        date: '',
        active: true,
        sort_order: 0,
    };

    const createForm = useForm<ReviewForm>(defaultForm);
    const editForm = useForm<ReviewForm>(defaultForm);
    const deleteForm = useForm({});

    function openEdit(item: ReviewItem) {
        setEditTarget(item);
        editForm.setData({
            author_name: item.author_name,
            author_initials: item.author_initials,
            avatar_color: item.avatar_color,
            rating: item.rating,
            text: item.text,
            date: item.date ?? '',
            active: Boolean(item.active),
            sort_order: item.sort_order,
        });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/reviews', {
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/reviews/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/reviews/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Public Reviews" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Public Reviews</h1>
                        <p className="text-muted-foreground text-sm">Manage reviews displayed on the website.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Review
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Order</th>
                                <th className="px-4 py-3 text-left font-semibold">Autor</th>
                                <th className="px-4 py-3 text-left font-semibold w-1/3">Comentario</th>
                                <th className="px-4 py-3 text-center font-semibold">Rating</th>
                                <th className="px-4 py-3 text-center font-semibold">Visible</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No reviews have been added.
                                    </td>
                                </tr>
                            )}
                            {reviews.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground">{item.sort_order}</td>
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.author_name}</span>
                                            <span className="text-xs text-muted-foreground">{item.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{item.text}</td>
                                    <td className="px-4 py-3 text-center">⭐ {item.rating}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.active ? 'Visible' : 'Oculto'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(item)}>
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
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>New Review</DialogTitle>
                        <DialogDescription>Enter the details to publish a new website review.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-name">Author Name *</Label>
                                <Input id="c-name" value={createForm.data.author_name} onChange={e => createForm.setData('author_name', e.target.value)} required />
                                {createForm.errors.author_name && <p className="text-destructive text-xs">{createForm.errors.author_name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-initials">Iniciales (2-3 letras) *</Label>
                                <Input id="c-initials" value={createForm.data.author_initials} onChange={e => createForm.setData('author_initials', e.target.value)} required />
                                {createForm.errors.author_initials && <p className="text-destructive text-xs">{createForm.errors.author_initials}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-color">Color Fondo Avatar *</Label>
                                <Input id="c-color" value={createForm.data.avatar_color} onChange={e => createForm.setData('avatar_color', e.target.value)} placeholder="Ej: bg-red-500" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-date">Month and Year (ej. May 2025)</Label>
                                <Input id="c-date" value={createForm.data.date} onChange={e => createForm.setData('date', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-rating">Rating (1-5)</Label>
                                <Input type="number" id="c-rating" min="1" max="5" value={createForm.data.rating} onChange={e => createForm.setData('rating', parseInt(e.target.value))} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-sort">Display Order</Label>
                                <Input type="number" id="c-sort" min="0" value={createForm.data.sort_order} onChange={e => createForm.setData('sort_order', parseInt(e.target.value))} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="c-text">Review Comment</Label>
                            <Input id="c-text" value={createForm.data.text} onChange={e => createForm.setData('text', e.target.value)} required />
                            {createForm.errors.text && <p className="text-destructive text-xs">{createForm.errors.text}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                                id="c-active" 
                                checked={createForm.data.active} 
                                onCheckedChange={(checked) => createForm.setData('active', checked as boolean)} 
                            />
                            <Label htmlFor="c-active" className="cursor-pointer">Visible Review</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save Review</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>Update this public review.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e-name">Author Name *</Label>
                                <Input id="e-name" value={editForm.data.author_name} onChange={e => editForm.setData('author_name', e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-initials">Iniciales *</Label>
                                <Input id="e-initials" value={editForm.data.author_initials} onChange={e => editForm.setData('author_initials', e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e-color">Color Fondo Avatar *</Label>
                                <Input id="e-color" value={editForm.data.avatar_color} onChange={e => editForm.setData('avatar_color', e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-date">Month and Year (ej. May 2025)</Label>
                                <Input id="e-date" value={editForm.data.date} onChange={e => editForm.setData('date', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="e-rating">Rating (1-5)</Label>
                                <Input type="number" id="e-rating" min="1" max="5" value={editForm.data.rating} onChange={e => editForm.setData('rating', parseInt(e.target.value))} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-sort">Display Order</Label>
                                <Input type="number" id="e-sort" min="0" value={editForm.data.sort_order} onChange={e => editForm.setData('sort_order', parseInt(e.target.value))} required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="e-text">Review Comment</Label>
                            <Input id="e-text" value={editForm.data.text} onChange={e => editForm.setData('text', e.target.value)} required />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox 
                                id="e-active" 
                                checked={editForm.data.active} 
                                onCheckedChange={(checked) => editForm.setData('active', checked as boolean)} 
                            />
                            <Label htmlFor="e-active" className="cursor-pointer">Visible Review</Label>
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
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the review by <strong>{deleteTarget?.author_name}</strong> permanently?
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
