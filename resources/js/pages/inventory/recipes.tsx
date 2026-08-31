import { useForm, router } from '@inertiajs/react';
import { Head, usePage } from '@inertiajs/react';
import {
    UtensilsCrossed, Edit, Search, Save, Plus, X, List,
    Trash2, AlertCircle, CheckCircle, Link2, RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type InventoryItem = { id: number; name: string; unit: string; cost_per_unit: number | null };

type RecipeIngredient = {
    id: number;
    inventory_item_id: number;
    quantity: number;
    inventory_item: InventoryItem;
};

type Recipe = {
    id: number;
    name: string;
    toast_name: string | null;
    description: string | null;
    price: number;
    active: boolean;
    ingredients: RecipeIngredient[];
};

type Props = {
    recipes: Recipe[];
    inventoryItems: InventoryItem[];
    toastItemNames: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/items' },
    { title: 'Recipes', href: '/inventory/recipes' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function InventoryRecipes({ recipes, inventoryItems, toastItemNames }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    const [search, setSearch]             = useState('');
    const [editTarget, setEditTarget]     = useState<Recipe | null>(null);
    const [createOpen, setCreateOpen]     = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
    const [syncing, setSyncing]           = useState(false);

    // ── Sync form ──────────────────────────────────────────────────────────
    const syncForm = useForm({});

    // ── Edit form ──────────────────────────────────────────────────────────
    const editForm = useForm({
        name:        '',
        toast_name:  '' as string,
        description: '' as string,
        price:       '' as string | number,
        active:      true as boolean,
        ingredients: [] as { inventory_item_id: number; quantity: number | string }[],
    });

    // ── Create form ────────────────────────────────────────────────────────
    const createForm = useForm({
        name:        '',
        toast_name:  '' as string,
        description: '' as string,
        price:       '' as string | number,
    });

    const filtered = recipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.toast_name ?? '').toLowerCase().includes(search.toLowerCase())
    );

    function handleSync() {
        setSyncing(true);
        syncForm.post('/inventory/recipes/sync', {
            onFinish: () => setSyncing(false),
        });
    }

    // ── Open edit ──────────────────────────────────────────────────────────
    function openEdit(recipe: Recipe) {
        setEditTarget(recipe);
        editForm.setData({
            name:        recipe.name,
            toast_name:  recipe.toast_name ?? '',
            description: recipe.description ?? '',
            price:       recipe.price,
            active:      recipe.active,
            ingredients: recipe.ingredients.map(i => ({
                inventory_item_id: i.inventory_item_id,
                quantity:          i.quantity,
            })),
        });
    }

    // ── Ingredient helpers ─────────────────────────────────────────────────
    function addIngredient() {
        editForm.setData('ingredients', [...editForm.data.ingredients, { inventory_item_id: 0, quantity: '' }]);
    }

    function removeIngredient(idx: number) {
        editForm.setData('ingredients', editForm.data.ingredients.filter((_, i) => i !== idx));
    }

    function updateIngredient(idx: number, field: 'inventory_item_id' | 'quantity', value: any) {
        const next = [...editForm.data.ingredients];
        next[idx] = { ...next[idx], [field]: value };
        editForm.setData('ingredients', next);
    }

    // ── Save edit ──────────────────────────────────────────────────────────
    function handleSave() {
        if (!editTarget) return;
        const cleanIngredients = editForm.data.ingredients
            .filter(i => i.inventory_item_id !== 0 && i.quantity !== '')
            .map(i => ({ inventory_item_id: i.inventory_item_id, quantity: parseFloat(i.quantity.toString()) }));

        editForm.put(`/inventory/recipes/${editTarget.id}`, {
            data: {
                ...editForm.data,
                ingredients: cleanIngredients,
                toast_name:  editForm.data.toast_name.trim() || null,
            },
            onSuccess: () => { setEditTarget(null); editForm.reset(); },
        });
    }

    // ── Create ─────────────────────────────────────────────────────────────
    function handleCreate() {
        createForm.post('/inventory/recipes', {
            data: {
                ...createForm.data,
                toast_name: createForm.data.toast_name.trim() || null,
            },
            onSuccess: () => { setCreateOpen(false); createForm.reset(); },
        });
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(`/inventory/recipes/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    // ── Cost calc ──────────────────────────────────────────────────────────
    const recipeCost = (ingredients: RecipeIngredient[]) =>
        ingredients.reduce((sum, i) => sum + i.quantity * (i.inventory_item.cost_per_unit ?? 0), 0);

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory — Recipes" />

            <div className="flex flex-1 flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <UtensilsCrossed className="w-6 h-6 text-primary" /> Recipes
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Link each recipe to a Toast name to deduct inventory automatically when orders arrive.
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" onClick={handleSync} disabled={syncing} className="gap-2">
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Synchronizing…' : 'Synchronize with Toast'}
                        </Button>
                        <Button onClick={() => setCreateOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" /> New Recipe
                        </Button>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50 text-red-800">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or Toast name…"
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Banner Toast */}
                {toastItemNames.length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50 text-blue-800">
                        <Link2 className="h-4 w-4 shrink-0" />
                        <AlertDescription>
                            Toast has sent <strong>{toastItemNames.length}</strong> item name(s) via webhook.
                            Assign the <strong>"Toast Name"</strong> in each recipe to enable automatic deductions.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Counters */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{recipes.length} recetas totales</span>
                    <span>·</span>
                    <span className="text-green-600 font-medium">
                        {recipes.filter(r => r.toast_name).length} vinculadas a Toast
                    </span>
                    <span>·</span>
                    <span className="text-amber-600">
                        {recipes.filter(r => !r.toast_name).length} unlinked
                    </span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            <List className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            {recipes.length === 0
                                ? 'No recipes yet. Create the first one with "New Recipe".'
                                : 'No recipes match your search.'}
                        </div>
                    )}

                    {filtered.map(recipe => {
                        const cost = recipeCost(recipe.ingredients);
                        return (
                            <div key={recipe.id} className="rounded-xl border bg-card shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate text-base">{recipe.name}</div>

                                        {/* Toast link badge */}
                                        {recipe.toast_name ? (
                                            <div className="flex items-center gap-1 mt-1">
                                                <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                                                <span className="text-xs text-green-700 font-medium truncate">
                                                    "{recipe.toast_name}"
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                                                <span className="text-xs text-amber-600">No Toast name</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                        <Button size="icon" variant="ghost" onClick={() => openEdit(recipe)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteTarget(recipe)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                                        Ingredientes ({recipe.ingredients.length})
                                    </h4>
                                    {recipe.ingredients.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No ingredients configured.</p>
                                    ) : (
                                        <ul className="space-y-1 text-sm">
                                            {recipe.ingredients.map(ing => (
                                                <li key={ing.id} className="flex justify-between border-b pb-1 last:border-0">
                                                    <span className="text-foreground">{ing.inventory_item.name}</span>
                                                    <span className="font-medium tabular-nums">
                                                        {ing.quantity}
                                                        <span className="text-muted-foreground text-xs ml-1">{ing.inventory_item.unit}</span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex justify-between items-center mt-auto pt-3 border-t text-xs text-muted-foreground">
                                    {recipe.price > 0 && <span>Reference price: <strong className="text-foreground">${recipe.price.toFixed(2)}</strong></span>}
                                    {cost > 0 && <span>Costo: <strong className="text-amber-600">${cost.toFixed(2)}</strong></span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── CREAR ─────────────────────────────────────────────────────── */}
            <Dialog open={createOpen} onOpenChange={v => !v && setCreateOpen(false)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" /> New Recipe
                        </DialogTitle>
                        <DialogDescription>
                            Create the recipe, then edit it to add ingredients.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Recipe Name *</Label>
                            <Input
                                value={createForm.data.name}
                                onChange={e => createForm.setData('name', e.target.value)}
                                placeholder="Ej: Cortadito"
                                className="mt-1"
                            />
                            {createForm.errors.name && <p className="text-xs text-destructive mt-1">{createForm.errors.name}</p>}
                        </div>

                        <div>
                            <Label className="flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5 text-primary" />
                                Toast Name (displayName)
                            </Label>
                            <p className="text-xs text-muted-foreground mb-1.5">
                                When an order arrives with this exact name, its ingredients will be deducted.
                            </p>
                            {toastItemNames.length > 0 ? (
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    value={createForm.data.toast_name}
                                    onChange={e => createForm.setData('toast_name', e.target.value)}
                                >
                                    <option value="">— Unlinked —</option>
                                    {toastItemNames.map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    value={createForm.data.toast_name}
                                    onChange={e => createForm.setData('toast_name', e.target.value)}
                                    placeholder="Exact name in Toast orders"
                                />
                            )}
                            {createForm.errors.toast_name && <p className="text-xs text-destructive mt-1">{createForm.errors.toast_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Reference Price</Label>
                                <Input
                                    type="number" min="0" step="0.01"
                                    className="mt-1"
                                    value={createForm.data.price}
                                    onChange={e => createForm.setData('price', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    className="mt-1"
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={createForm.processing || !createForm.data.name}>
                            <Save className="w-4 h-4 mr-2" />
                            {createForm.processing ? 'Creating…' : 'Create Recipe'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── EDITAR ────────────────────────────────────────────────────── */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5" /> Edit: {editTarget?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the Toast name and ingredients that will be deducted from inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Recipe Name *</Label>
                                <Input
                                    className="mt-1"
                                    value={editForm.data.name}
                                    onChange={e => editForm.setData('name', e.target.value)}
                                />
                                {editForm.errors.name && <p className="text-xs text-destructive mt-1">{editForm.errors.name}</p>}
                            </div>
                            <div>
                                <Label className="flex items-center gap-1.5">
                                    <Link2 className="w-3.5 h-3.5 text-primary" /> Toast Name
                                </Label>
                                {toastItemNames.length > 0 ? (
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm mt-1"
                                        value={editForm.data.toast_name}
                                        onChange={e => editForm.setData('toast_name', e.target.value)}
                                    >
                                        <option value="">— Unlinked —</option>
                                        {toastItemNames.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        className="mt-1"
                                        value={editForm.data.toast_name}
                                        onChange={e => editForm.setData('toast_name', e.target.value)}
                                        placeholder="displayName exacto de Toast"
                                    />
                                )}
                                {editForm.errors.toast_name && <p className="text-xs text-destructive mt-1">{editForm.errors.toast_name}</p>}
                            </div>
                        </div>

                        {/* Ingredients table */}
                        <div>
                            <h4 className="text-sm font-semibold mb-2">Ingredientes</h4>
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Item de Inventory</th>
                                            <th className="px-3 py-2 text-left font-medium w-44">Cantidad</th>
                                            <th className="w-12" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editForm.data.ingredients.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground italic">
                                                    No ingredients. Click "Add Ingredient".
                                                </td>
                                            </tr>
                                        ) : (
                                            editForm.data.ingredients.map((ing, idx) => {
                                                const selected = inventoryItems.find(i => i.id === ing.inventory_item_id);
                                                return (
                                                    <tr key={idx} className="border-t">
                                                        <td className="px-3 py-2">
                                                            <select
                                                                className="w-full h-9 rounded border border-input bg-background px-2 text-sm"
                                                                value={ing.inventory_item_id}
                                                                onChange={e => updateIngredient(idx, 'inventory_item_id', parseInt(e.target.value))}
                                                            >
                                                                <option value={0}>Select item…</option>
                                                                {inventoryItems.map(item => (
                                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    className="h-9 w-24"
                                                                    type="number" min="0.001" step="0.001"
                                                                    value={ing.quantity}
                                                                    onChange={e => updateIngredient(idx, 'quantity', e.target.value)}
                                                                    placeholder="0"
                                                                />
                                                                <span className="text-muted-foreground text-xs w-12 truncate">
                                                                    {selected?.unit ?? '—'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeIngredient(idx)}>
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Button variant="outline" size="sm" onClick={addIngredient} className="w-full border-dashed mt-2">
                                <Plus className="w-4 h-4 mr-1" /> Add Ingrediente
                            </Button>
                            {editForm.errors.ingredients && <p className="text-xs text-destructive mt-1">{editForm.errors.ingredients}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={editForm.processing}>
                            <Save className="w-4 h-4 mr-2" />
                            {editForm.processing ? 'Saving…' : 'Save Recipe'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── ELIMINAR ──────────────────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" /> Delete Recipe
                        </DialogTitle>
                        <DialogDescription>
                            Delete <strong>"{deleteTarget?.name}"</strong>? Its ingredients will also be deleted.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
