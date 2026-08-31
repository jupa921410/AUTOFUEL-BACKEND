import { Head, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AccountingCategory, BreadcrumbItem, Transaction } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Accounting', href: '/accounting' },
    { title: 'Transactions', href: '/transactions' },
];

type Props = {
    transactions: Transaction[];
    categories: AccountingCategory[];
    filters: { from?: string; to?: string; type?: string };
    totals: { income: number; expense: number; balance: number };
};

type TxForm = {
    accounting_category_id: string;
    type: 'income' | 'expense';
    amount: string;
    description: string;
    date: string;
    notes: string;
};

const emptyForm: TxForm = {
    accounting_category_id: '',
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
};

function fmt(n: number) {
    return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function TransactionsIndex({ transactions, categories, filters, totals }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Transaction | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

    const [filterFrom, setFilterFrom] = useState(filters.from ?? '');
    const [filterTo, setFilterTo] = useState(filters.to ?? '');
    const [filterType, setFilterType] = useState(filters.type ?? '');

    const createForm = useForm<TxForm>(emptyForm);
    const editForm = useForm<TxForm>(emptyForm);
    const deleteForm = useForm({});

    function openEdit(tx: Transaction) {
        setEditTarget(tx);
        editForm.setData({
            accounting_category_id: tx.accounting_category_id ? String(tx.accounting_category_id) : '',
            type: tx.type,
            amount: tx.amount,
            description: tx.description ?? '',
            date: tx.date,
            notes: tx.notes ?? '',
        });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/transactions', {
            onSuccess: () => { setOpenCreate(false); createForm.reset(); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/transactions/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/transactions/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function applyFilter() {
        router.get('/transactions', { from: filterFrom, to: filterTo, type: filterType }, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                        <p className="text-muted-foreground text-sm">Administra ingresos y gastos.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Transaction
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
                    <div className="space-y-1">
                        <Label className="text-xs">Desde</Label>
                        <Input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-36" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Hasta</Label>
                        <Input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-36" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Tipo</Label>
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="income">Ingreso</option>
                            <option value="expense">Gasto</option>
                        </select>
                    </div>
                    <Button variant="outline" onClick={applyFilter}>Filtrar</Button>
                    {(filterFrom || filterTo || filterType) && (
                        <Button variant="ghost" onClick={() => {
                            setFilterFrom(''); setFilterTo(''); setFilterType('');
                            router.get('/transactions', {}, { preserveScroll: true });
                        }}>Limpiar</Button>
                    )}
                </div>

                {/* Totals row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border bg-emerald-500/10 border-emerald-500/20 p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Ingresos</p>
                        <p className="text-lg font-bold text-emerald-600">{fmt(totals.income)}</p>
                    </div>
                    <div className="rounded-xl border bg-red-500/10 border-red-500/20 p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Gastos</p>
                        <p className="text-lg font-bold text-red-500">{fmt(totals.expense)}</p>
                    </div>
                    <div className={`rounded-xl border p-4 text-center ${totals.balance >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
                        <p className={`text-lg font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{fmt(totals.balance)}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-left font-semibold">Category</th>
                                <th className="px-4 py-3 text-right font-semibold">Monto</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No transactions for the selected period.
                                    </td>
                                </tr>
                            )}
                            {transactions.map(tx => (
                                <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{tx.date}</td>
                                    <td className="px-4 py-3">
                                        {tx.type === 'income'
                                            ? <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0">Ingreso</Badge>
                                            : <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-0">Gasto</Badge>
                                        }
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {tx.description ?? <span className="text-muted-foreground">—</span>}
                                        {tx.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.notes}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {tx.category
                                            ? (
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: tx.category.color }} />
                                                    {tx.category.name}
                                                </span>
                                            )
                                            : <span className="text-muted-foreground text-xs">—</span>
                                        }
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{fmt(parseFloat(tx.amount))}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(tx)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(tx)}>
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
                        <DialogTitle>New Transaction</DialogTitle>
                        <DialogDescription>Record new income or expense.</DialogDescription>
                    </DialogHeader>
                    <TransactionForm form={createForm} categories={categories} onSubmit={submitCreate} />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                        <Button form="tx-create-form" type="submit" disabled={createForm.processing}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Update the transaction details.</DialogDescription>
                    </DialogHeader>
                    <TransactionForm form={editForm} categories={categories} onSubmit={submitEdit} formId="tx-edit-form" />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                        <Button form="tx-edit-form" type="submit" disabled={editForm.processing}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete the transaction <strong>{deleteTarget?.description ?? `#${deleteTarget?.id}`}</strong>? This action cannot be undone.
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

function TransactionForm({
    form,
    categories,
    onSubmit,
    formId = 'tx-create-form',
}: {
    form: ReturnType<typeof useForm<TxForm>>;
    categories: AccountingCategory[];
    onSubmit: (e: React.FormEvent) => void;
    formId?: string;
}) {
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const filteredCategories = form.data.type === 'income' ? incomeCategories : expenseCategories;

    return (
        <form id={formId} onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                    <Label>Tipo *</Label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => form.setData('type', 'income')}
                            className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${form.data.type === 'income' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-input hover:bg-muted'}`}
                        >
                            ↑ Ingreso
                        </button>
                        <button
                            type="button"
                            onClick={() => form.setData('type', 'expense')}
                            className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${form.data.type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'border-input hover:bg-muted'}`}
                        >
                            ↓ Gasto
                        </button>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Monto (USD) *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.data.amount}
                        onChange={e => form.setData('amount', e.target.value)}
                        placeholder="0.00"
                    />
                    {form.errors.amount && <p className="text-destructive text-xs">{form.errors.amount}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Date *</Label>
                    <Input
                        type="date"
                        value={form.data.date}
                        onChange={e => form.setData('date', e.target.value)}
                    />
                    {form.errors.date && <p className="text-destructive text-xs">{form.errors.date}</p>}
                </div>
                <div className="col-span-2 space-y-1.5">
                    <Label>Description</Label>
                    <Input
                        value={form.data.description}
                        onChange={e => form.setData('description', e.target.value)}
                        placeholder="Ej. Pago de renta"
                    />
                </div>
                <div className="col-span-2 space-y-1.5">
                    <Label>Category</Label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.data.accounting_category_id}
                        onChange={e => form.setData('accounting_category_id', e.target.value)}
                    >
                        <option value="">Uncategorized</option>
                        {filteredCategories.map(c => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                    <Label>Notas</Label>
                    <Input
                        value={form.data.notes}
                        onChange={e => form.setData('notes', e.target.value)}
                        placeholder="Opcional..."
                    />
                </div>
            </div>
        </form>
    );
}
