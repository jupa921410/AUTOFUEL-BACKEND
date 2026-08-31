import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AccountingCategory, BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Accounting', href: '/accounting' },
    { title: 'Accounting Categories', href: '/accounting-categories' },
];

type Props = {
    categories: AccountingCategory[];
};

type CatForm = {
    name: string;
    type: 'income' | 'expense';
    color: string;
};

const emptyForm: CatForm = { name: '', type: 'income', color: '#6366f1' };

const TYPE_LABEL: Record<string, string> = { income: 'Ingreso', expense: 'Gasto' };

export default function AccountingCategoriesIndex({ categories }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<AccountingCategory | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AccountingCategory | null>(null);

    const createForm = useForm<CatForm>(emptyForm);
    const editForm = useForm<CatForm>(emptyForm);
    const deleteForm = useForm({});

    function openEdit(cat: AccountingCategory) {
        setEditTarget(cat);
        editForm.setData({ name: cat.name, type: cat.type, color: cat.color });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/accounting-categories', {
            onSuccess: () => { setOpenCreate(false); createForm.reset(); },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/accounting-categories/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/accounting-categories/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const income = categories.filter(c => c.type === 'income');
    const expense = categories.filter(c => c.type === 'expense');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounting Categories" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Accounting Categories</h1>
                        <p className="text-muted-foreground text-sm">Classify your income and expenses.</p>
                    </div>
                    <Button onClick={() => { createForm.reset(); setOpenCreate(true); }}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Category
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Income */}
                    <CatTable
                        title="Ingresos"
                        categories={income}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        emptyMsg="No income categories."
                    />
                    {/* Expense */}
                    <CatTable
                        title="Gastos"
                        categories={expense}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        emptyMsg="No expense categories."
                    />
                </div>
            </div>

            {/* Create */}
            <Dialog open={openCreate} onOpenChange={(v) => { if (!createForm.processing) setOpenCreate(v); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>New Category</DialogTitle>
                        <DialogDescription>Create a new accounting category.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <CatFormFields form={createForm} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit */}
            <Dialog open={!!editTarget} onOpenChange={v => { if (!editForm.processing) { !v && setEditTarget(null); } }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the accounting category details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <CatFormFields form={editForm} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Category</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleteTarget?.name}</strong>? Associated transactions will become uncategorized.
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

function CatTable({
    title, categories, onEdit, onDelete, emptyMsg,
}: {
    title: string;
    categories: AccountingCategory[];
    onEdit: (c: AccountingCategory) => void;
    onDelete: (c: AccountingCategory) => void;
    emptyMsg: string;
}) {
    const isIncome = title === 'Ingresos';
    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className={`px-4 py-3 border-b font-semibold text-sm ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                {isIncome ? '↑' : '↓'} {title}
            </div>
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium">Color</th>
                        <th className="px-4 py-2 text-left font-medium">Name</th>
                        <th className="px-4 py-2 text-center font-medium">Transactions</th>
                        <th className="px-4 py-2 text-right font-medium">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">{emptyMsg}</td>
                        </tr>
                    )}
                    {categories.map(cat => (
                        <tr key={cat.id} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                                <span className="h-5 w-5 rounded-full border block" style={{ backgroundColor: cat.color }} />
                            </td>
                            <td className="px-4 py-3 font-medium">{cat.name}</td>
                            <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center rounded-full bg-muted w-7 h-7 text-xs font-bold">
                                    {cat.transactions_count ?? 0}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(cat)}>
                                        <PencilIcon className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(cat)}>
                                        <TrashIcon className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CatFormFields({ form }: { form: ReturnType<typeof useForm<CatForm>> }) {
    return (
        <>
            <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                    value={form.data.name}
                    onChange={e => form.setData('name', e.target.value)}
                    placeholder="Ej. Ventas, Renta..."
                />
                {form.errors.name && <p className="text-destructive text-xs">{form.errors.name}</p>}
            </div>
            <div className="space-y-1.5">
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
                {form.errors.type && <p className="text-destructive text-xs">{form.errors.type}</p>}
            </div>
            <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={form.data.color}
                        onChange={e => form.setData('color', e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-md border border-input p-0.5"
                    />
                    <span className="text-sm text-muted-foreground font-mono">{form.data.color}</span>
                </div>
            </div>
        </>
    );
}
