import { Head, router } from '@inertiajs/react';
import { Package, Search, Webhook, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { BreadcrumbItem } from '@/types';

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type WebhookOrder = {
    id: number;
    toast_guid: string;
    order_number: string;
    customer_name: string;
    source: string;
    approval_status: string;
    status: string;
    total_amount: number;
    opened_date: string | null;
    inventory_deducted: boolean;
    items: OrderItem[];
    created_at: string;
};

type PaginatedOrders = {
    data: WebhookOrder[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type Props = {
    orders: PaginatedOrders;
    filters: { search?: string; status?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Administration', href: '/admin/toast/products' },
    { title: 'Webhook Orders', href: '/admin/toast/webhook-orders' },
];

const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    delivered: 'bg-blue-100 text-blue-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    confirmed: 'Confirmado',
    delivered: 'Entregado',
    pending:   'Pending',
    cancelled: 'Cancelado',
};

export default function ToastWebhookOrders({ orders, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedOrder, setSelectedOrder] = useState<WebhookOrder | null>(null);

    const handleSearch = () => {
        router.get('/admin/toast/webhook-orders', { search }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/admin/toast/webhook-orders', { search, status: status || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration — Webhook Orders" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Webhook className="w-6 h-6 text-primary" /> Orders Received via Webhook
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Orders sent by Toast in real time — {orders.total} en total
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.reload()} className="gap-2 shrink-0">
                        <RefreshCw className="w-4 h-4" /> Update
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order, customer, or status…"
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <select
                        className="border rounded-md px-3 py-2 text-sm bg-background"
                        value={filters.status ?? ''}
                        onChange={e => handleStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Order #</th>
                                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                <th className="px-4 py-3 text-left font-semibold">Recibida</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-center font-semibold">Inventory</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                                <th className="px-4 py-3 text-center font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        No webhook orders have been received yet.
                                    </td>
                                </tr>
                            ) : (
                                orders.data.map(order => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono font-bold">#{order.order_number ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{order.customer_name}</div>
                                            <div className="text-xs text-muted-foreground">{order.source}</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabels[order.status] ?? order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.inventory_deducted
                                                ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" title="Inventory deducted" />
                                                : <XCircle className="w-4 h-4 text-muted-foreground mx-auto" title="Not deducted" />}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">
                                            ${order.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: orders.last_page }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={page === orders.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/toast/webhook-orders', { ...filters, page })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail Sheet */}
            <Sheet open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl">
                            Order #{selectedOrder?.order_number}
                        </SheetTitle>
                        <SheetDescription>
                            Received via webhook on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-muted/40 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer</div>
                                    <div className="font-semibold">{selectedOrder.customer_name}</div>
                                </div>
                                <div className="bg-muted/40 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fuente</div>
                                    <div className="font-semibold">{selectedOrder.source}</div>
                                </div>
                                <div className="bg-muted/40 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status Toast</div>
                                    <div className="font-semibold">{selectedOrder.approval_status}</div>
                                </div>
                                <div className="bg-muted/40 rounded-lg p-3">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Inventory</div>
                                    <div className={`font-semibold flex items-center gap-1 ${selectedOrder.inventory_deducted ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {selectedOrder.inventory_deducted
                                            ? <><CheckCircle className="w-4 h-4" /> Descontado</>
                                            : <><XCircle className="w-4 h-4" /> Pending</>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Products</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-dashed pb-2 last:border-0">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-primary/10 text-primary font-bold w-6 h-6 flex items-center justify-center rounded text-xs shrink-0">
                                                    {item.quantity}
                                                </div>
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span className="text-primary">${selectedOrder.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
