import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, PromotionGroup } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Promotion Groups', href: '/promotion-groups' },
];

type Props = {
    groups: PromotionGroup[];
};

type GroupForm = {
    name: string;
    slug: string;
    description: string;
    active: boolean;
};

const emptyForm: GroupForm = { name: '', slug: '', description: '', active: true };

export default function PromotionGroupsIndex({ groups }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<PromotionGroup | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PromotionGroup | null>(null);

    const createForm = useForm<GroupForm>(emptyForm);
    const editForm = useForm<GroupForm>(emptyForm);
    const deleteForm = useForm({});

    function openEdit(group: PromotionGroup) {
        setEditTarget(group);
        editForm.setData({
            name: group.name,
            slug: group.slug,
            description: group.description ?? '',
            active: group.active,
        });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/promotion-groups', {
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/promotion-groups/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/promotion-groups/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotion Groups" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Promotion Groups</h1>
                        <p className="text-muted-foreground text-sm">
                            Group promotions into a collection with a unique URL slug.
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nuevo Grupo
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Slug (URL)</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-center font-semibold">Promotions</th>
                                <th className="px-4 py-3 text-center font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No groups have been added.
                                    </td>
                                </tr>
                            )}
                            {groups.map(group => (
                                <tr key={group.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{group.name}</td>
                                    <td className="px-4 py-3">
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                            {group.slug}
                                        </code>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{group.description ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center rounded-full bg-muted w-7 h-7 text-xs font-bold">
                                            {group.promotions_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {group.active
                                            ? <Badge variant="default">Active</Badge>
                                            : <Badge variant="secondary">Inactive</Badge>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(group)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(group)}>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nuevo Grupo de Promotions</DialogTitle>
                        <DialogDescription>Enter the details to create a new promotion group.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Name *</Label>
                            <Input
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="Ej. Viewano 2025"
                            />
                            {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>
                                Slug <span className="text-muted-foreground text-xs">(generated automatically if left blank)</span>
                            </Label>
                            <Input
                                value={createForm.data.slug}
                                onChange={e => createForm.setData('slug', e.target.value)}
                                placeholder="verano-2025"
                            />
                            {createForm.errors.slug && <p className="text-destructive text-xs">{createForm.errors.slug}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Input
                                value={createForm.data.description}
                                onChange={e => createForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="c-active-group"
                                checked={createForm.data.active}
                                onCheckedChange={v => createForm.setData('active', !!v)}
                            />
                            <Label htmlFor="c-active-group">Grupo activo</Label>
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Grupo</DialogTitle>
                        <DialogDescription>Update the promotion group details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Name *</Label>
                            <Input
                                value={editForm.data.name}
                                onChange={e => editForm.setData('name', e.target.value)}
                            />
                            {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Slug</Label>
                            <Input
                                value={editForm.data.slug}
                                onChange={e => editForm.setData('slug', e.target.value)}
                            />
                            {editForm.errors.slug && <p className="text-destructive text-xs">{editForm.errors.slug}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Input
                                value={editForm.data.description}
                                onChange={e => editForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="e-active-group"
                                checked={editForm.data.active}
                                onCheckedChange={v => editForm.setData('active', !!v)}
                            />
                            <Label htmlFor="e-active-group">Grupo activo</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Grupo</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the group <strong>{deleteTarget?.name}</strong>?
                        Promotions in this group will become unassigned.
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
