import { Head, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Monitor, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type Category = { id: number; name: string };
type MenuScreen = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    position: number;
    active: boolean;
    categories: Category[];
};
type Props = { screens: MenuScreen[]; categories: Category[] };
type ScreenForm = {
    name: string;
    slug: string;
    description: string;
    position: number;
    active: boolean;
    category_ids: number[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'TV Menu Screens', href: '/menu-screens' },
];
const emptyForm: ScreenForm = { name: '', slug: '', description: '', position: 0, active: true, category_ids: [] };

export default function MenuScreensIndex({ screens, categories }: Props) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<MenuScreen | null>(null);
    const [deleting, setDeleting] = useState<MenuScreen | null>(null);
    const createForm = useForm<ScreenForm>(emptyForm);
    const editForm = useForm<ScreenForm>(emptyForm);
    const deleteForm = useForm({});

    const toggleCategory = (form: typeof createForm, id: number) => {
        const ids = form.data.category_ids;
        form.setData('category_ids', ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
    };

    const moveCategory = (form: typeof createForm, index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= form.data.category_ids.length) return;
        const ids = [...form.data.category_ids];
        [ids[index], ids[target]] = [ids[target], ids[index]];
        form.setData('category_ids', ids);
    };

    const openEdit = (screen: MenuScreen) => {
        setEditing(screen);
        editForm.setData({
            name: screen.name,
            slug: screen.slug,
            description: screen.description ?? '',
            position: screen.position,
            active: screen.active,
            category_ids: screen.categories.map(category => category.id),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TV Menu Screens" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold"><Monitor className="h-6 w-6 text-primary" /> TV Menu Screens</h1>
                        <p className="text-sm text-muted-foreground">Define which product categories appear on each TV menu screen.</p>
                    </div>
                    <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" /> New Screen</Button>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <table className="w-full text-sm">
                        <thead><tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Screen</th><th className="px-4 py-3 text-left">Public Slug</th><th className="px-4 py-3 text-left">Categories</th><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                        <tbody>
                            {screens.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No menu screens have been configured.</td></tr>}
                            {screens.map(screen => (
                                <tr key={screen.id} className="border-t hover:bg-muted/30">
                                    <td className="px-4 py-3 font-semibold">{screen.position}</td>
                                    <td className="px-4 py-3"><div className="font-semibold">{screen.name}</div><div className="max-w-xs truncate text-xs text-muted-foreground">{screen.description}</div></td>
                                    <td className="px-4 py-3"><code className="rounded bg-muted px-2 py-1 text-xs">{screen.slug}</code></td>
                                    <td className="px-4 py-3"><div className="flex max-w-md flex-wrap gap-1">{screen.categories.map(category => <Badge key={category.id} variant="secondary">{category.name}</Badge>)}</div></td>
                                    <td className="px-4 py-3 text-center"><Badge variant={screen.active ? 'default' : 'secondary'}>{screen.active ? 'Active' : 'Inactive'}</Badge></td>
                                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(screen)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleting(screen)}><Trash2 className="h-4 w-4" /></Button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ScreenDialog title="New TV Menu Screen" description="Create a screen and choose its categories in display order." open={creating} onClose={() => setCreating(false)} form={createForm} categories={categories} toggleCategory={toggleCategory} moveCategory={moveCategory} onSubmit={event => { event.preventDefault(); createForm.post('/menu-screens', { onSuccess: () => { setCreating(false); createForm.reset(); } }); }} />
            <ScreenDialog title="Edit TV Menu Screen" description="Update the screen settings and category display order." open={!!editing} onClose={() => setEditing(null)} form={editForm} categories={categories} toggleCategory={toggleCategory} moveCategory={moveCategory} onSubmit={event => { event.preventDefault(); if (editing) editForm.put(`/menu-screens/${editing.id}`, { onSuccess: () => setEditing(null) }); }} />

            <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
                <DialogContent><DialogHeader><DialogTitle>Delete Menu Screen</DialogTitle><DialogDescription>This removes the screen configuration but does not delete its categories or products.</DialogDescription></DialogHeader><p className="text-sm">Delete <strong>{deleting?.name}</strong>?</p><DialogFooter><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="destructive" disabled={deleteForm.processing} onClick={() => deleting && deleteForm.delete(`/menu-screens/${deleting.id}`, { onSuccess: () => setDeleting(null) })}>Delete</Button></DialogFooter></DialogContent>
            </Dialog>
        </AppLayout>
    );
}

type ScreenDialogProps = {
    title: string;
    description: string;
    open: boolean;
    onClose: () => void;
    form: ReturnType<typeof useForm<ScreenForm>>;
    categories: Category[];
    toggleCategory: (form: ReturnType<typeof useForm<ScreenForm>>, id: number) => void;
    moveCategory: (form: ReturnType<typeof useForm<ScreenForm>>, index: number, direction: -1 | 1) => void;
    onSubmit: (event: React.FormEvent) => void;
};

function ScreenDialog({ title, description, open, onClose, form, categories, toggleCategory, moveCategory, onSubmit }: ScreenDialogProps) {
    const selected = form.data.category_ids.map(id => categories.find(category => category.id === id)).filter((category): category is Category => !!category);
    return <Dialog open={open} onOpenChange={value => !value && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label>Name *</Label><Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} />{form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}</div><div className="space-y-1.5"><Label>Slug</Label><Input value={form.data.slug} onChange={e => form.setData('slug', e.target.value)} placeholder="screen-1" />{form.errors.slug && <p className="text-xs text-destructive">{form.errors.slug}</p>}</div></div>
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]"><div className="space-y-1.5"><Label>Description</Label><Input value={form.data.description} onChange={e => form.setData('description', e.target.value)} /></div><div className="space-y-1.5"><Label>Screen Order</Label><Input type="number" min={0} value={form.data.position} onChange={e => form.setData('position', Number(e.target.value))} /></div></div>
        <div className="flex items-center gap-2"><Checkbox checked={form.data.active} onCheckedChange={value => form.setData('active', !!value)} id={`${title}-active`} /><Label htmlFor={`${title}-active`}>Active screen</Label></div>
        <div className="space-y-2"><Label>Available Categories *</Label><div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">{categories.map(category => <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted"><Checkbox checked={form.data.category_ids.includes(category.id)} onCheckedChange={() => toggleCategory(form, category.id)} /><span className="text-sm">{category.name}</span></label>)}</div>{form.errors.category_ids && <p className="text-xs text-destructive">{form.errors.category_ids}</p>}</div>
        <div className="space-y-2"><Label>Category Display Order</Label>{selected.length === 0 ? <p className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">Select at least one category.</p> : <div className="space-y-1">{selected.map((category, index) => <div key={category.id} className="flex items-center gap-2 rounded border bg-background px-3 py-2"><span className="w-6 text-sm font-bold text-muted-foreground">{index + 1}</span><span className="flex-1 text-sm font-medium">{category.name}</span><Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => moveCategory(form, index, -1)}><ArrowUp className="h-4 w-4" /></Button><Button type="button" size="sm" variant="ghost" disabled={index === selected.length - 1} onClick={() => moveCategory(form, index, 1)}><ArrowDown className="h-4 w-4" /></Button></div>)}</div>}</div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={form.processing}>Save Screen</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}
