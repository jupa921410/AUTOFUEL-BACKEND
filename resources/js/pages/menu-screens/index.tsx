import { Head, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, GalleryHorizontal, List, Monitor, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type CategoryLayout = 'list' | 'slider';
type Category = { id: number; name: string; pivot?: { position?: number; layout?: CategoryLayout } };
type Product = { id: number; name: string; category_id: number };
type MenuScreen = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    position: number;
    active: boolean;
    show_info_widget: boolean;
    categories: Category[];
    products: Product[]; // screen-specific product picks; empty for a category = show all
};
type Props = { screens: MenuScreen[]; categories: Category[]; products: Product[] };
type ScreenForm = {
    name: string;
    slug: string;
    description: string;
    active: boolean;
    show_info_widget: boolean;
    category_ids: number[];
    product_ids: number[];
    category_layouts: Record<number, CategoryLayout>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'TV Menu Screens', href: '/menu-screens' },
];
const emptyForm: ScreenForm = { name: '', slug: '', description: '', active: true, show_info_widget: false, category_ids: [], product_ids: [], category_layouts: {} };

export default function MenuScreensIndex({ screens, categories, products }: Props) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<MenuScreen | null>(null);
    const [deleting, setDeleting] = useState<MenuScreen | null>(null);
    const createForm = useForm<ScreenForm>(emptyForm);
    const editForm = useForm<ScreenForm>(emptyForm);
    const deleteForm = useForm({});

    const toggleCategory = (form: typeof createForm, id: number) => {
        const ids = form.data.category_ids;
        if (ids.includes(id)) {
            // Deselecting a category also drops any product picks scoped to it.
            const categoryProductIds = products.filter(product => product.category_id === id).map(product => product.id);
            form.setData({
                ...form.data,
                category_ids: ids.filter(value => value !== id),
                product_ids: form.data.product_ids.filter(productId => !categoryProductIds.includes(productId)),
            });
        } else {
            form.setData('category_ids', [...ids, id]);
        }
    };

    const moveCategory = (form: typeof createForm, index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= form.data.category_ids.length) return;
        const ids = [...form.data.category_ids];
        [ids[index], ids[target]] = [ids[target], ids[index]];
        form.setData('category_ids', ids);
    };

    const toggleProduct = (form: typeof createForm, id: number) => {
        const ids = form.data.product_ids;
        form.setData('product_ids', ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);
    };

    const setCategoryLayout = (form: typeof createForm, categoryId: number, layout: CategoryLayout) => {
        form.setData('category_layouts', { ...form.data.category_layouts, [categoryId]: layout });
    };

    const openEdit = (screen: MenuScreen) => {
        setEditing(screen);
        editForm.setData({
            name: screen.name,
            slug: screen.slug,
            description: screen.description ?? '',
            active: screen.active,
            show_info_widget: screen.show_info_widget,
            category_ids: screen.categories.map(category => category.id),
            product_ids: screen.products.map(product => product.id),
            category_layouts: Object.fromEntries(
                screen.categories.map(category => [category.id, category.pivot?.layout ?? 'list'])
            ),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TV Menu Screens" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold"><Monitor className="h-6 w-6 text-primary" /> TV Menu Screens</h1>
                        <p className="text-sm text-muted-foreground">Define which product categories — and optionally which specific products — appear on each TV menu screen.</p>
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
                                    <td className="px-4 py-3">
                                        <div className="flex max-w-md flex-wrap gap-1">
                                            {screen.categories.map(category => {
                                                const pickedCount = screen.products.filter(product => product.category_id === category.id).length;
                                                return (
                                                    <Badge key={category.id} variant="secondary">
                                                        {category.name}
                                                        {pickedCount > 0 && <span className="ml-1 text-muted-foreground">· {pickedCount} picked</span>}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center"><Badge variant={screen.active ? 'default' : 'secondary'}>{screen.active ? 'Active' : 'Inactive'}</Badge></td>
                                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(screen)}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => setDeleting(screen)}><Trash2 className="h-4 w-4" /></Button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ScreenDialog title="New TV Menu Screen" description="Create a screen, choose its categories, and optionally narrow each category down to specific products." open={creating} onClose={() => setCreating(false)} form={createForm} categories={categories} products={products} toggleCategory={toggleCategory} moveCategory={moveCategory} toggleProduct={toggleProduct} setCategoryLayout={setCategoryLayout} onSubmit={event => { event.preventDefault(); createForm.post('/menu-screens', { onSuccess: () => { setCreating(false); createForm.reset(); } }); }} />
            <ScreenDialog title="Edit TV Menu Screen" description="Update the screen settings, category order, and product picks." open={!!editing} onClose={() => setEditing(null)} form={editForm} categories={categories} products={products} toggleCategory={toggleCategory} moveCategory={moveCategory} toggleProduct={toggleProduct} setCategoryLayout={setCategoryLayout} onSubmit={event => { event.preventDefault(); if (editing) editForm.put(`/menu-screens/${editing.id}`, { onSuccess: () => setEditing(null) }); }} />

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
    products: Product[];
    toggleCategory: (form: ReturnType<typeof useForm<ScreenForm>>, id: number) => void;
    moveCategory: (form: ReturnType<typeof useForm<ScreenForm>>, index: number, direction: -1 | 1) => void;
    toggleProduct: (form: ReturnType<typeof useForm<ScreenForm>>, id: number) => void;
    setCategoryLayout: (form: ReturnType<typeof useForm<ScreenForm>>, categoryId: number, layout: CategoryLayout) => void;
    onSubmit: (event: React.FormEvent) => void;
};

function ScreenDialog({ title, description, open, onClose, form, categories, products, toggleCategory, moveCategory, toggleProduct, setCategoryLayout, onSubmit }: ScreenDialogProps) {
    const selected = form.data.category_ids.map(id => categories.find(category => category.id === id)).filter((category): category is Category => !!category);

    return <Dialog open={open} onOpenChange={value => !value && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label>Name *</Label><Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} />{form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}</div><div className="space-y-1.5"><Label>Slug</Label><Input value={form.data.slug} onChange={e => form.setData('slug', e.target.value)} placeholder="screen-1" />{form.errors.slug && <p className="text-xs text-destructive">{form.errors.slug}</p>}</div></div>
        <div className="space-y-1.5"><Label>Description</Label><Input value={form.data.description} onChange={e => form.setData('description', e.target.value)} /></div>
        <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2"><Checkbox checked={form.data.active} onCheckedChange={value => form.setData('active', !!value)} id={`${title}-active`} /><Label htmlFor={`${title}-active`}>Active screen</Label></div>
            <div className="flex items-center gap-2"><Checkbox checked={form.data.show_info_widget} onCheckedChange={value => form.setData('show_info_widget', !!value)} id={`${title}-widget`} /><Label htmlFor={`${title}-widget`}>Show info widget column (logo, clock &amp; weather)</Label></div>
        </div>
        <div className="space-y-2"><Label>Available Categories *</Label><div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">{categories.map(category => <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted"><Checkbox checked={form.data.category_ids.includes(category.id)} onCheckedChange={() => toggleCategory(form, category.id)} /><span className="text-sm">{category.name}</span></label>)}</div>{form.errors.category_ids && <p className="text-xs text-destructive">{form.errors.category_ids}</p>}</div>
        <div className="space-y-2">
            <Label>Category Display Order &amp; Layout</Label>
            <p className="text-xs text-muted-foreground">Each category can render as a compact list, or as a full-column rotating photo slider of its products.</p>
            {selected.length === 0 ? <p className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">Select at least one category.</p> : <div className="grid gap-2 sm:grid-cols-2">{selected.map((category, index) => {
                const layout = form.data.category_layouts[category.id] ?? 'list';
                return (
                    <div key={category.id} className="flex items-center gap-2 rounded border bg-background px-3 py-2">
                        <span className="w-6 text-sm font-bold text-muted-foreground">{index + 1}</span>
                        <span className="flex-1 truncate text-sm font-medium">{category.name}</span>
                        <div className="flex items-center rounded-md border p-0.5">
                            <button type="button" title="List" onClick={() => setCategoryLayout(form, category.id, 'list')} className={`rounded p-1 ${layout === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><List className="h-3.5 w-3.5" /></button>
                            <button type="button" title="Photo slider" onClick={() => setCategoryLayout(form, category.id, 'slider')} className={`rounded p-1 ${layout === 'slider' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><GalleryHorizontal className="h-3.5 w-3.5" /></button>
                        </div>
                        <Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => moveCategory(form, index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" size="sm" variant="ghost" disabled={index === selected.length - 1} onClick={() => moveCategory(form, index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                    </div>
                );
            })}</div>}
        </div>

        {selected.length > 0 && (
            <div className="space-y-3">
                <div>
                    <Label>Products Shown Per Category</Label>
                    <p className="text-xs text-muted-foreground">Leave every product unchecked in a category to show all of its products. Check specific ones to limit the screen to just those.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {selected.map(category => {
                        const categoryProducts = products.filter(product => product.category_id === category.id);
                        const pickedInCategory = form.data.product_ids.filter(id => categoryProducts.some(product => product.id === id));
                        return (
                            <div key={category.id} className="rounded-lg border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-semibold">{category.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {pickedInCategory.length === 0 ? 'Showing all' : `${pickedInCategory.length} of ${categoryProducts.length} selected`}
                                    </span>
                                </div>
                                {categoryProducts.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">This category has no products yet.</p>
                                ) : (
                                    <div className="grid max-h-40 gap-1.5 overflow-y-auto sm:grid-cols-2">
                                        {categoryProducts.map(product => (
                                            <label key={product.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-muted">
                                                <Checkbox checked={form.data.product_ids.includes(product.id)} onCheckedChange={() => toggleProduct(form, product.id)} />
                                                <span className="text-sm">{product.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {form.errors.product_ids && <p className="text-xs text-destructive">{form.errors.product_ids}</p>}
            </div>
        )}

        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={form.processing}>Save Screen</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}
