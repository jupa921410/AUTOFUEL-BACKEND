import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Camera,
    CheckCircle,
    Loader2,
    Sparkles,
    ScanLine,
    Trash2,
    TrendingUp,
    Wallet,
    X,
    Upload,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Accounting', href: '/accounting' },
];

type Kpis = {
    income: number;
    expense: number;
    balance: number;
    transaction_count: number;
};

type MonthRow = {
    month: string;
    income: number;
    expense: number;
    balance: number;
};

type RecentTransaction = {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    description: string | null;
    date: string;
    category: { name: string; color: string } | null;
};

type AccountingCategory = {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
};

type Props = {
    kpis: Kpis;
    monthly: MonthRow[];
    recent: RecentTransaction[];
    categories: AccountingCategory[];
    filters: { from: string; to: string; category_id: number | null };
};

type ScannedItem = {
    description: string;
    amount: number;
    date: string;
    category_id: number | null;
    category_name: string | null;
};

function fmt(n: number) {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(n);
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
function monthLabel(m: string) {
    const [year, month] = m.split('-');
    return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

// ─── Ticket Scanner Modal ──────────────────────────────────────────────────────

type ModalStep = 'upload' | 'analyzing' | 'review' | 'saving' | 'done';

function TicketScannerModal({ onClose }: { onClose: () => void }) {
    const { props } = usePage<{ ziggy?: { url: string } }>();
    const [step, setStep] = useState<ModalStep>('upload');
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [items, setItems] = useState<ScannedItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        setFile(f);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f && f.type.startsWith('image/')) handleFile(f);
        },
        [handleFile],
    );

    const analyze = async () => {
        if (!file) return;
        setStep('analyzing');
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        // Get CSRF token from meta tag
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        try {
            const res = await axios.post('/accounting/scan-ticket', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            if (res.data.items && res.data.items.length > 0) {
                setItems(res.data.items);
                setStep('review');
            } else {
                setError('Gemini found no items on the receipt. Try another image.');
                setStep('upload');
            }
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                'Error analyzing the receipt. Check your connection.';
            setError(message);
            setStep('upload');
        }
    };

    const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

    const updateItem = (idx: number, field: keyof ScannedItem, value: string | number | null) => {
        setItems(prev => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
    };

    const saveAll = async () => {
        setStep('saving');
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

        try {
            await Promise.all(
                items.map(item =>
                    axios.post(
                        '/transactions',
                        {
                            type: 'expense',
                            description: item.description,
                            amount: item.amount,
                            date: item.date,
                            accounting_category_id: item.category_id ?? null,
                            notes: 'Imported from receipt with Gemini AI',
                        },
                        { headers: { 'X-CSRF-TOKEN': csrfToken } },
                    ),
                ),
            );
            setStep('done');
            setTimeout(() => {
                onClose();
                router.reload();
            }, 1500);
        } catch {
            setError('Error saving transactions.');
            setStep('review');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                            <Sparkles className="h-4 w-4 text-violet-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">Receipt Scanner</h2>
                            <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-0 border-b bg-muted/30 px-6 py-3">
                    {(['upload', 'analyzing', 'review', 'done'] as const).map((s, i) => {
                        const labels = ['Subir', 'Analizando', 'Revisar', 'Listo'];
                        const active = step === s || (step === 'saving' && s === 'review');
                        const done =
                            (s === 'upload' && ['analyzing', 'review', 'saving', 'done'].includes(step)) ||
                            (s === 'analyzing' && ['review', 'saving', 'done'].includes(step)) ||
                            (s === 'review' && step === 'done');
                        return (
                            <div key={s} className="flex items-center">
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                            done
                                                ? 'bg-emerald-500 text-white'
                                                : active
                                                  ? 'bg-violet-500 text-white'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <span
                                        className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}
                                    >
                                        {labels[i]}
                                    </span>
                                </div>
                                {i < 3 && <div className="mx-3 h-px w-6 bg-border" />}
                            </div>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Error banner */}
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    {/* ── Step: Upload ── */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex min-h-52 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
                                    dragOver
                                        ? 'border-violet-500 bg-violet-500/5'
                                        : preview
                                          ? 'border-emerald-500/50 bg-emerald-500/5'
                                          : 'border-border hover:border-violet-500/50 hover:bg-muted/30'
                                }`}
                            >
                                {preview ? (
                                    <>
                                        <img
                                            src={preview}
                                            alt="Receipt preview"
                                            className="max-h-40 max-w-full rounded-lg object-contain shadow"
                                        />
                                        <p className="text-xs text-muted-foreground">Click to change the image</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10">
                                            <Upload className="h-6 w-6 text-violet-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">Drag a receipt photo here</p>
                                            <p className="text-xs text-muted-foreground">or click to select</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 10 MB</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFile(f);
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={analyze}
                                    disabled={!file}
                                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                                >
                                    <ScanLine className="h-4 w-4" />
                                    Analyze with Gemini
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Analyzing ── */}
                    {step === 'analyzing' && (
                        <div className="flex min-h-52 flex-col items-center justify-center gap-4">
                            <div className="relative flex h-20 w-20 items-center justify-center">
                                <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Analizando ticket...</p>
                                <p className="text-sm text-muted-foreground">Gemini is extracting items from the receipt</p>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Review ── */}
                    {(step === 'review' || step === 'saving') && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{items.length}</span> item
                                    {items.length !== 1 ? 's' : ''} detected{items.length !== 1 ? 's' : ''}. Edit before saving.
                                </p>
                            </div>

                            <div className="max-h-64 overflow-y-auto rounded-xl border divide-y">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                value={item.description}
                                                onChange={e => updateItem(idx, 'description', e.target.value)}
                                                className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 font-medium"
                                                placeholder="Description"
                                            />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {item.category_name ?? 'Uncategorized'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">·</span>
                                                <input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={e => updateItem(idx, 'date', e.target.value)}
                                                    className="text-xs text-muted-foreground bg-transparent border-0 outline-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-muted-foreground">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={item.amount}
                                                onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                                                className="w-20 rounded border bg-transparent px-2 py-1 text-right text-sm font-semibold text-red-500 outline-none focus:ring-1 focus:ring-ring"
                                            />
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                                <span className="text-sm text-muted-foreground">Total a registrar</span>
                                <span className="font-bold text-red-500">
                                    {fmt(items.reduce((s, i) => s + i.amount, 0))}
                                </span>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setStep('upload');
                                        setError(null);
                                    }}
                                    disabled={step === 'saving'}
                                >
                                    ← Volver
                                </Button>
                                <Button
                                    onClick={saveAll}
                                    disabled={items.length === 0 || step === 'saving'}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {step === 'saving' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    {step === 'saving' ? 'Saving...' : `Save ${items.length} expense${items.length !== 1 ? 's' : ''}`}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Step: Done ── */}
                    {step === 'done' && (
                        <div className="flex min-h-52 flex-col items-center justify-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-emerald-500">Expenses recorded!</p>
                                <p className="text-sm text-muted-foreground">Updating the dashboard...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AccountingDashboard({ kpis, monthly, recent, categories, filters }: Props) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const [categoryId, setCategoryId] = useState<string>(filters.category_id?.toString() ?? '');
    const [showScanner, setShowScanner] = useState(false);

    function applyFilter() {
        const params: Record<string, string> = { from, to };
        if (categoryId) params.category_id = categoryId;
        router.get('/accounting', params, { preserveScroll: true });
    }

    const balanceColor = kpis.balance >= 0 ? 'text-emerald-500' : 'text-red-500';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounting" />

            {showScanner && <TicketScannerModal onClose={() => setShowScanner(false)} />}

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header + Filters */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                            Accounting Dashboard
                        </h1>
                        <p className="text-muted-foreground text-sm">Resumen financiero de AutoFuel.</p>
                    </div>
                    <div className="flex items-end gap-3 flex-wrap">
                        <div className="space-y-1">
                            <Label className="text-xs">Desde</Label>
                            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-36" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hasta</Label>
                            <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-36" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Category</Label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="h-9 w-44 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All categories</option>
                                {['income', 'expense'].map(type => {
                                    const group = categories.filter(c => c.type === type);
                                    if (group.length === 0) return null;
                                    return (
                                        <optgroup key={type} label={type === 'income' ? '↑ Ingresos' : '↓ Gastos'}>
                                            {group.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                            </select>
                        </div>
                        <Button onClick={applyFilter}>Filtrar</Button>
                        <Button
                            onClick={() => setShowScanner(true)}
                            variant="outline"
                            className="gap-2 border-violet-500/30 text-violet-500 hover:bg-violet-500/10 hover:text-violet-600"
                        >
                            <Camera className="h-4 w-4" />
                            Escanear Ticket
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard
                        label="Total Ingresos"
                        value={fmt(kpis.income)}
                        icon={<ArrowUpCircle className="h-6 w-6 text-emerald-500" />}
                        color="bg-emerald-500/10 border-emerald-500/20"
                        valueClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <KpiCard
                        label="Total Gastos"
                        value={fmt(kpis.expense)}
                        icon={<ArrowDownCircle className="h-6 w-6 text-red-500" />}
                        color="bg-red-500/10 border-red-500/20"
                        valueClass="text-red-600 dark:text-red-400"
                    />
                    <KpiCard
                        label="Balance"
                        value={fmt(kpis.balance)}
                        icon={<Wallet className="h-6 w-6 text-blue-500" />}
                        color="bg-blue-500/10 border-blue-500/20"
                        valueClass={balanceColor}
                    />
                    <KpiCard
                        label="Transactions"
                        value={kpis.transaction_count.toString()}
                        icon={<TrendingUp className="h-6 w-6 text-violet-500" />}
                        color="bg-violet-500/10 border-violet-500/20"
                        valueClass="text-violet-600 dark:text-violet-400"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Breakdown */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b font-semibold text-sm">Resumen Mensual</div>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Mes</th>
                                    <th className="px-4 py-2 text-right font-medium text-emerald-600">Ingresos</th>
                                    <th className="px-4 py-2 text-right font-medium text-red-500">Gastos</th>
                                    <th className="px-4 py-2 text-right font-medium">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthly.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                                            No data for this period.
                                        </td>
                                    </tr>
                                )}
                                {monthly.map(row => (
                                    <tr key={row.month} className="border-t hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2 font-medium">{monthLabel(row.month)}</td>
                                        <td className="px-4 py-2 text-right text-emerald-600">{fmt(row.income)}</td>
                                        <td className="px-4 py-2 text-right text-red-500">{fmt(row.expense)}</td>
                                        <td
                                            className={`px-4 py-2 text-right font-semibold ${row.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
                                        >
                                            {fmt(row.balance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Recent Transactions */}
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b font-semibold text-sm flex items-center justify-between">
                            Latest Transactions
                            <a href="/transactions" className="text-xs text-primary hover:underline">
                                View todas →
                            </a>
                        </div>
                        <div className="divide-y">
                            {recent.length === 0 && (
                                <p className="px-4 py-6 text-center text-muted-foreground text-sm">No transactions.</p>
                            )}
                            {recent.map(t => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor:
                                                    t.category?.color ?? (t.type === 'income' ? '#10b981' : '#ef4444'),
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{t.description ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {t.category?.name ?? (t.type === 'income' ? 'Ingreso' : 'Gasto')} · {t.date}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}
                                    >
                                        {t.type === 'income' ? '+' : '-'}
                                        {fmt(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function KpiCard({
    label,
    value,
    icon,
    color,
    valueClass,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    valueClass: string;
}) {
    return (
        <div className={`rounded-xl border p-5 flex flex-col gap-3 ${color} shadow-sm`}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
                {icon}
            </div>
            <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        </div>
    );
}
