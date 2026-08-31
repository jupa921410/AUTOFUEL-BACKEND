import { router, Head } from '@inertiajs/react';
import { Package, Search, ShoppingBag, AlertCircle, Calendar, Eye, User, CreditCard, Tag } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
    Sheet, 
    SheetContent, 
    SheetDescription, 
    SheetHeader, 
    SheetTitle, 
} from "@/components/ui/sheet";
import type { BreadcrumbItem } from '@/types';

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type ToastOrder = {
    guid: string;
    orderNumber: string;
    openedDate: string;
    status: string;
    source: string;
    totalAmount: number;
    customerName: string;
    itemsCount: number;
    items: OrderItem[];
};

type Props = {
    orders: ToastOrder[];
    error: string | null;
    selectedDate: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/items' },
    { title: 'Toast Orders', href: '/inventory/toast-orders' },
];

export default function ToastOrders({ orders, error, selectedDate }: Props) {
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<ToastOrder | null>(null);

    const handleDateChange = (date: string) => {
        router.get('/inventory/toast-orders', { date }, { preserveState: true });
    };

    const filteredOrders = Array.isArray(orders) 
        ? orders.filter(o => 
            o.orderNumber?.toString().includes(search) || 
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.status?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory — Toast Orders" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-primary" /> Toast POS Orders
                        </h1>
                        <p className="text-muted-foreground text-sm">Detailed view of AutoFuel Tampa orders and transactions.</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by order, customer, or status..." 
                            className="pl-9" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="relative w-full sm:w-48">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input 
                            type="date" 
                            className="pl-9" 
                            value={selectedDate} 
                            onChange={e => handleDateChange(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Order #</th>
                                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                <th className="px-4 py-3 text-left font-semibold">Date / Hora</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">Fuente</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                                <th className="px-4 py-3 text-center font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        {error ? 'Orders could not be loaded.' : 'No orders were found for the selected date.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.guid} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-xs text-muted-foreground">{order.itemsCount} products</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                            {order.openedDate ? new Date(order.openedDate).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                order.status === 'APPROVED' || order.status === 'CLOSED' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground font-medium">
                                                {order.source}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-base">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 gap-1"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Detalles
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Sheet */}
            <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            Order #{selectedOrder?.orderNumber}
                        </SheetTitle>
                        <SheetDescription>
                            Details of the transaction processed by Toast POS.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="space-y-8">
                            {/* General Info Card */}
                            <div className="bg-muted/40 p-4 rounded-lg space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Customer</div>
                                        <div className="font-semibold">{selectedOrder.customerName}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Fuente / Origen</div>
                                        <div className="font-semibold">{selectedOrder.source}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Products</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start border-b border-dashed pb-3 last:border-0">
                                            <div className="flex gap-3">
                                                <div className="bg-primary/10 text-primary font-bold w-6 h-6 flex items-center justify-center rounded text-xs shrink-0">
                                                    {item.quantity}
                                                </div>
                                                <div className="font-medium text-sm">{item.name}</div>
                                            </div>
                                            <div className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">${selectedOrder.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded justify-center">
                                <CreditCard className="w-3.5 h-3.5" /> Transaction {selectedOrder.status}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
