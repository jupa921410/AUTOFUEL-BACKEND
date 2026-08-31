import { useForm, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import {
    Mail,
    MessageSquare,
    Phone,
    TrashIcon,
    CalendarIcon,
    FileTextIcon,
    CreditCard,
    SendIcon,
    DollarSign,
    User,
    Package,
    CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type CateringOrder = {
    id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    delivery_date: string;
    status: 'awaiting_payment' | 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
    payment_status: 'unpaid' | 'paid';
    total_price: string;
    notes: string | null;
    created_at: string;
    catering: {
        id: number;
        name: string;
        price?: string;
        pax?: number;
        description?: string;
    } | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Catering Orders', href: '/catering-orders' },
];

type Props = {
    cateringOrders: CateringOrder[];
};

export default function CateringOrdersIndex({ cateringOrders }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<CateringOrder | null>(null);
    const [paymentLinkTarget, setPaymentLinkTarget] = useState<CateringOrder | null>(null);
    const [markPaidTarget, setMarkPaidTarget] = useState<CateringOrder | null>(null);
    const deleteForm = useForm({});
    const paymentForm = useForm({ amount: '' });
    const markPaidForm = useForm({});

    function confirmMarkAsPaid() {
        if (!markPaidTarget) return;
        markPaidForm.post(`/catering-orders/${markPaidTarget.id}/mark-as-paid`, {
            onSuccess: () => setMarkPaidTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/catering-orders/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function handleStatusChange(order: CateringOrder, newStatus: string) {
        router.put(`/catering-orders/${order.id}/status`, { status: newStatus }, { preserveScroll: true });
    }

    function openPaymentLinkModal(order: CateringOrder) {
        paymentForm.setData('amount', Number(order.total_price).toFixed(2));
        setPaymentLinkTarget(order);
    }

    function sendPaymentLink() {
        if (!paymentLinkTarget) return;
        paymentForm.post(`/catering-orders/${paymentLinkTarget.id}/send-payment-link`, {
            onSuccess: () => {
                setPaymentLinkTarget(null);
                paymentForm.reset();
            },
        });
    }

    const getStatusColor = (status: string) => {
        const conf: Record<string, string> = {
            awaiting_payment: 'bg-orange-100 text-orange-700 border-orange-200',
            pending:          'bg-amber-100 text-amber-700 border-amber-200',
            confirmed:        'bg-blue-100 text-blue-700 border-blue-200',
            preparing:        'bg-purple-100 text-purple-700 border-purple-200',
            delivered:        'bg-green-100 text-green-700 border-green-200',
            cancelled:        'bg-rose-100 text-rose-700 border-rose-200',
        };
        return conf[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            awaiting_payment: 'Awaiting Payment',
            pending:          'Pending',
            confirmed:        'Confirmado',
            preparing:        'Preparando',
            delivered:        'Entregado',
            cancelled:        'Cancelado',
        };
        return labels[status] || status;
    };

    const PaymentBadge = ({ status }: { status: 'unpaid' | 'paid' }) => (
        <span
            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 border ${
                status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}
        >
            <CreditCard className="w-3 h-3" />
            {status === 'paid' ? 'Paid' : 'No Paid'}
        </span>
    );

    const StatusSelect = ({ order }: { order: CateringOrder }) => (
        <select
            className={`text-xs font-semibold rounded-full px-3 py-1 border outline-none cursor-pointer appearance-none transition-colors ${getStatusColor(order.status)}`}
            value={order.status}
            onChange={(e) => handleStatusChange(order, e.target.value)}
        >
            <option value="awaiting_payment" className="text-black bg-white">Awaiting Payment</option>
            <option value="pending"          className="text-black bg-white">Pending</option>
            <option value="confirmed"        className="text-black bg-white">Confirmado</option>
            <option value="preparing"        className="text-black bg-white">Preparando</option>
            <option value="delivered"        className="text-black bg-white">Entregado</option>
            <option value="cancelled"        className="text-black bg-white">Cancelado</option>
        </select>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catering Orders" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Catering Orders</h1>
                    <p className="text-muted-foreground text-sm">Manage catering requests received from the web app.</p>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                <th className="px-4 py-3 text-left font-semibold">Catering Solicitado</th>
                                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Delivery Date</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Pago</th>
                                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Price Total</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones / Contacto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cateringOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        There are no recent catering orders.
                                    </td>
                                </tr>
                            )}
                            {cateringOrders.map((order) => (
                                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground font-mono">#{order.id}</td>

                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{order.client_name}</div>
                                        <div className="text-xs text-muted-foreground">{order.client_email}</div>
                                        <div className="text-xs text-muted-foreground">{order.client_phone}</div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="font-medium text-primary">
                                            {order.catering?.name ?? 'Paquete Eliminado'}
                                        </div>
                                        {order.notes && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto text-xs flex items-center gap-1.5 mt-1">
                                                        <FileTextIcon className="w-3 h-3" />
                                                        View Customer Notes
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Order Notes #{order.id}</DialogTitle>
                                                        <DialogDescription>
                                                            Additional instructions provided by {order.client_name}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="p-4 bg-muted/30 rounded-md whitespace-pre-wrap text-sm">
                                                        {order.notes}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                {new Date(order.delivery_date).toLocaleString('es-ES', {
                                                    dateStyle: 'long',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-1 tracking-tight">
                                            Requested on {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <StatusSelect order={order} />
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                            {getStatusLabel(order.status)}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <PaymentBadge status={order.payment_status} />
                                    </td>

                                    <td className="px-4 py-3 font-semibold text-lg">
                                        ${Number(order.total_price).toFixed(2)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* Send payment link — only when payment is still pending */}
                                            {order.payment_status !== 'paid' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                                    onClick={() => openPaymentLinkModal(order)}
                                                    title="Send Link de Pago"
                                                >
                                                    <SendIcon className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {/* Mark as paid manually — only for awaiting_payment orders */}
                                            {order.status === 'awaiting_payment' && order.payment_status !== 'paid' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    onClick={() => setMarkPaidTarget(order)}
                                                    title="Mark as Paid"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                asChild
                                            >
                                                <a href={`tel:${order.client_phone}`} title="Llamar">
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                asChild
                                            >
                                                <a href={`sms:${order.client_phone}`} title="Send SMS">
                                                    <MessageSquare className="w-4 h-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                asChild
                                            >
                                                <a
                                                    href={`mailto:${order.client_email}?subject=About your Catering Order #${order.id}`}
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                            </Button>

                                            <div className="w-px h-8 bg-border mx-1 self-center" />

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => setDeleteTarget(order)}
                                                title="Delete Order"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete order <strong>#{deleteTarget?.id}</strong> de{' '}
                        <strong>{deleteTarget?.client_name}</strong>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteForm.processing}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Payment Link Dialog */}
            <Dialog open={!!paymentLinkTarget} onOpenChange={(v) => !v && setPaymentLinkTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <SendIcon className="w-5 h-5 text-violet-600" />
                            Send Link de Pago
                        </DialogTitle>
                        <DialogDescription>
                            A Stripe payment link will be generated and emailed to the customer.
                        </DialogDescription>
                    </DialogHeader>

                    {paymentLinkTarget && (
                        <div className="space-y-4">
                            {/* Order details */}
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <span className="font-semibold">{paymentLinkTarget.client_name}</span>
                                        <div className="text-xs text-muted-foreground">{paymentLinkTarget.client_email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <span className="font-medium">{paymentLinkTarget.catering?.name ?? 'Paquete Personalizado'}</span>
                                        <div className="text-xs text-muted-foreground">Order #{paymentLinkTarget.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span>
                                        {new Date(paymentLinkTarget.delivery_date).toLocaleString('es-ES', {
                                            dateStyle: 'long',
                                            timeStyle: 'short',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Campo de monto editable */}
                            <div className="space-y-2">
                                <Label htmlFor="payment-amount" className="text-sm font-semibold">
                                    Monto a cobrar (USD)
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="payment-amount"
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        className="pl-9"
                                        value={paymentForm.data.amount}
                                        onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                    />
                                </div>
                                {paymentForm.errors.amount && (
                                    <p className="text-xs text-destructive">{paymentForm.errors.amount}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    You can adjust the amount if the order has changed. The original price was{' '}
                                    <strong>${Number(paymentLinkTarget.total_price).toFixed(2)}</strong>.
                                </p>
                            </div>

                            {/* Email information */}
                            <div className="flex items-start gap-2 rounded-md bg-violet-50 border border-violet-200 p-3 text-sm text-violet-800">
                                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                                <div>
                                    An email with payment instructions will be sent to{' '}
                                    <strong>{paymentLinkTarget.client_email}</strong>.
                                    The order status will change to <strong>"Awaiting Payment"</strong>.
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentLinkTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={sendPaymentLink}
                            disabled={paymentForm.processing || !paymentForm.data.amount}
                            className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                        >
                            <SendIcon className="w-4 h-4" />
                            {paymentForm.processing ? 'Enviando...' : 'Send Link de Pago'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Mark as Paid Confirm Dialog */}
            <Dialog open={!!markPaidTarget} onOpenChange={(v) => !v && setMarkPaidTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Confirmar Pago Manual
                        </DialogTitle>
                        <DialogDescription>
                            Use this only after verifying payment directly in the Stripe dashboard.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Order:</span> <strong>#{markPaidTarget?.id}</strong></div>
                        <div><span className="text-muted-foreground">Customer:</span> <strong>{markPaidTarget?.client_name}</strong></div>
                        <div><span className="text-muted-foreground">Monto:</span> <strong>${Number(markPaidTarget?.total_price ?? 0).toFixed(2)}</strong></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        The order will change to <strong>"Pending"</strong> and will be marked as <strong className="text-emerald-600">Paid</strong>.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMarkPaidTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmMarkAsPaid}
                            disabled={markPaidForm.processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {markPaidForm.processing ? 'Saving...' : 'Confirmar Pago'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
