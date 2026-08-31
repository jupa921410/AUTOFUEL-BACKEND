import { Head, router, usePage } from '@inertiajs/react';
import { Package, RefreshCw, UtensilsCrossed, CheckCircle, XCircle, ChevronDown, ChevronUp, FlaskConical, Settings2, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Ingredient = {
    id: number;
    inventory_item_id: number;
    inventory_item: string;
    unit: string;
    quantity: number;
    current_stock: number;
};

type ModifierOption = {
    guid: string;
    name: string;
    price: number;
};

type ModifierGroup = {
    guid: string;
    name: string;
    requiredMode: string;
    minSelections: number;
    maxSelections: number | null;
    options: ModifierOption[];
};

type ToastProduct = {
    id: number;
    toast_guid: string;
    name: string;
    description: string | null;
    image_url: string | null;
    category_name: string;
    plu: string | null;
    price: number;
    active: boolean;
    modifier_groups: ModifierGroup[];
    ingredients: Ingredient[];
};

type Props = {
    products: ToastProduct[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administration', href: '/admin/toast/products' },
    { title: 'Products Toast', href: '/admin/toast/products' },
];

export default function ToastProducts({ products }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string }; errors?: { percentage?: string } }>();
    const flash = props.flash;

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [syncing, setSyncing] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [extraInput, setExtraInput] = useState('');
    const [applyingExtra, setApplyingExtra] = useState(false);

    const categories = Array.from(new Set(products.map(p => p.category_name))).filter(Boolean).sort();

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.plu ?? '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleSync = () => {
        setSyncing(true);

        router.post('/admin/toast/products/sync', {}, {
            onFinish: () => setSyncing(false),
        });
    };

    const handleApplyExtra = () => {
        router.post('/admin/toast/products/add-extra', { percentage: extraInput }, {
            preserveScroll: true,
            onStart: () => setApplyingExtra(true),
            onSuccess: () => setExtraInput(''),
            onFinish: () => setApplyingExtra(false),
        });
    };

    const statusColor = (active: boolean) =>
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';

    const requiredLabel = (mode: string) => {
        switch (mode) {
            case 'REQUIRED': return 'Requerido';
            case 'OPTIONAL_FORCE_SHOW': return 'Opcional';
            case 'OPTIONAL': return 'Opcional';
            default: return mode;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration — Products Toast" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <UtensilsCrossed className="w-6 h-6 text-primary" /> Toast Products
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Catalog synchronized from Toast POS — {products.length} products
                        </p>
                    </div>
                    <Button onClick={handleSync} disabled={syncing} className="gap-2 shrink-0">
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Synchronizing…' : 'Synchronize from Toast'}
                    </Button>
                </div>

                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50 text-red-800">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <Input
                        placeholder="Search by name or PLU…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="ml-auto">
                        <div className="flex items-center gap-2">
                            <label htmlFor="extra-percentage" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                Porcentaje extra
                            </label>
                            <div className="relative">
                                <Input
                                    id="extra-percentage"
                                    type="number"
                                    min="0.01"
                                    max="100"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={extraInput}
                                    onChange={e => setExtraInput(e.target.value)}
                                    className="w-28 pr-8"
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">%</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyExtra}
                                disabled={applyingExtra || products.length === 0 || extraInput === ''}
                            >
                                {applyingExtra ? 'Aplicando...' : 'Aplicar a todos'}
                            </Button>
                        </div>
                        {props.errors?.percentage && (
                            <p className="mt-1 text-right text-xs text-destructive">{props.errors.percentage}</p>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold w-6"></th>
                                <th className="px-4 py-3 text-left font-semibold">Imagen</th>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Category</th>
                                <th className="px-4 py-3 text-left font-semibold">PLU</th>
                                <th className="px-4 py-3 text-right font-semibold">Price</th>
                                <th className="px-4 py-3 text-center font-semibold">Variaciones</th>
                                <th className="px-4 py-3 text-center font-semibold">Ingredientes</th>
                                <th className="px-4 py-3 text-center font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        {products.length === 0
                                            ? 'There are no products. Click "Synchronize from Toast".'
                                            : 'No search results.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(product => (
                                    <>
                                        <tr
                                            key={product.id}
                                            className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {expanded === product.id
                                                    ? <ChevronUp className="w-4 h-4" />
                                                    : <ChevronDown className="w-4 h-4" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded-lg border bg-muted shrink-0 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 flex items-center justify-center rounded-lg border bg-muted text-muted-foreground shrink-0 shadow-sm">
                                                        <ImageIcon className="w-4 h-4 opacity-40" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-foreground">{product.name}</div>
                                                {product.description && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                    {product.category_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                {product.plu ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                ${product.price.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {product.modifier_groups.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                                        <Settings2 className="w-3.5 h-3.5" />
                                                        {product.modifier_groups.length}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium">
                                                    <FlaskConical className="w-3.5 h-3.5 text-primary" />
                                                    {product.ingredients.length}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor(product.active)}`}>
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Expanded detail row */}
                                        {expanded === product.id && (
                                            <tr key={`${product.id}-exp`} className="bg-muted/20">
                                                <td colSpan={9} className="px-8 py-4">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Modifier Groups / Variaciones */}
                                                        <div>
                                                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                                <Settings2 className="w-3.5 h-3.5" /> Variaciones / Agregos
                                                            </div>
                                                            {product.modifier_groups.length === 0 ? (
                                                                <p className="text-sm text-muted-foreground italic">
                                                                    No variations are configured in Toast.
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {product.modifier_groups.map(mg => (
                                                                        <div key={mg.guid} className="bg-background rounded-lg border p-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="font-medium text-sm">{mg.name}</span>
                                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                                    mg.requiredMode === 'REQUIRED'
                                                                                        ? 'bg-red-100 text-red-700'
                                                                                        : 'bg-blue-100 text-blue-700'
                                                                                }`}>
                                                                                    {requiredLabel(mg.requiredMode)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-[11px] text-muted-foreground mb-2">
                                                                                Selecciones: {mg.minSelections}–{mg.maxSelections ?? '∞'}
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                {mg.options.map(opt => (
                                                                                    <div key={opt.guid} className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-muted/50">
                                                                                        <span>{opt.name}</span>
                                                                                        {opt.price > 0 ? (
                                                                                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-600">
                                                                                                <DollarSign className="w-3 h-3" />
                                                                                                +{opt.price.toFixed(2)}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-xs text-muted-foreground">Incluido</span>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Ingredientes */}
                                                        <div>
                                                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                                <FlaskConical className="w-3.5 h-3.5" /> Ingredientes configurados
                                                            </div>
                                                            {product.ingredients.length === 0 ? (
                                                                <p className="text-sm text-muted-foreground italic">
                                                                    No ingredients are assigned. Use the API to assign them.
                                                                </p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {product.ingredients.map(ing => (
                                                                        <div key={ing.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border text-sm">
                                                                            <div>
                                                                                <div className="font-medium">{ing.inventory_item}</div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    Consume: <span className="font-semibold text-foreground">{ing.quantity} {ing.unit}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="text-xs text-muted-foreground">Stock</div>
                                                                                <div className={`text-sm font-bold ${ing.current_stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                                                    {ing.current_stock} {ing.unit}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
