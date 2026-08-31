import { Head, Link } from '@inertiajs/react';
import { AlertTriangleIcon, ArrowRightIcon, BookOpenIcon, FolderIcon, MonitorPlayIcon, PackageIcon, RadioIcon, SparklesIcon, StarIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

type Stats = { products: number; featuredProducts: number; categories: number; activePromotions: number; activeMenuScreens: number; activeStreams: number; publishedPosts: number; lowStockItems: number };
type Props = {
    stats: Stats;
    promotions: Array<{ id: number; title: string; discount: number; group: string | null; endDate: string }>;
    lowStockItems: Array<{ id: number; name: string; current_stock: number; min_stock: number; unit: string }>;
};

const widgets = [
    { key: 'products', label: 'Products', detail: 'Catalog items', href: '/products', icon: PackageIcon, color: 'text-blue-600 bg-blue-50' },
    { key: 'featuredProducts', label: 'Featured', detail: 'Homepage highlights', href: '/products', icon: StarIcon, color: 'text-amber-600 bg-amber-50' },
    { key: 'categories', label: 'Categories', detail: 'Product groups', href: '/categories', icon: FolderIcon, color: 'text-violet-600 bg-violet-50' },
    { key: 'activePromotions', label: 'Promotions', detail: 'Currently active', href: '/promotions', icon: SparklesIcon, color: 'text-red-600 bg-red-50' },
    { key: 'activeMenuScreens', label: 'Menu Screens', detail: 'Active TV menus', href: '/menu-screens', icon: MonitorPlayIcon, color: 'text-emerald-600 bg-emerald-50' },
    { key: 'activeStreams', label: 'Streaming', detail: 'Active channels', href: '/streamen', icon: RadioIcon, color: 'text-cyan-600 bg-cyan-50' },
    { key: 'publishedPosts', label: 'Blog Posts', detail: 'Published articles', href: '/posts', icon: BookOpenIcon, color: 'text-indigo-600 bg-indigo-50' },
    { key: 'lowStockItems', label: 'Low Stock', detail: 'Items need attention', href: '/inventory/items', icon: AlertTriangleIcon, color: 'text-orange-600 bg-orange-50' },
] as const;

export default function Dashboard({ stats, promotions, lowStockItems }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cafe Dashboard</h1>
                    <p className="text-sm text-muted-foreground">A quick view of your catalog, digital menus and daily operations.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {widgets.map(({ key, label, detail, href, icon: Icon, color }) => (
                        <Link key={key} href={href} className="group">
                            <Card className="h-full gap-3 py-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                                <CardContent className="flex items-center justify-between px-5">
                                    <div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-bold">{stats[key]}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
                                    <div className={`rounded-xl p-3 ${color}`}><Icon className="h-6 w-6" /></div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div><CardTitle>Active Promotions</CardTitle><CardDescription>Offers currently visible to customers.</CardDescription></div>
                            <Link href="/promotions" className="flex items-center gap-1 text-sm font-medium text-primary">View all <ArrowRightIcon className="h-4 w-4" /></Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {promotions.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No active promotions.</p>}
                            {promotions.map(promotion => (
                                <div key={promotion.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                                    <div><p className="font-medium">{promotion.title}</p><p className="text-xs text-muted-foreground">{promotion.group ?? 'No group'} · Ends {promotion.endDate}</p></div>
                                    <Badge className="bg-red-600 text-white">{promotion.discount}% OFF</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div><CardTitle>Inventory Alerts</CardTitle><CardDescription>Items at or below minimum stock.</CardDescription></div>
                            <Link href="/inventory/items" className="flex items-center gap-1 text-sm font-medium text-primary">Inventory <ArrowRightIcon className="h-4 w-4" /></Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {lowStockItems.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Inventory levels look good.</p>}
                            {lowStockItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
                                    <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">Minimum: {item.min_stock} {item.unit}</p></div>
                                    <Badge variant="destructive">{item.current_stock} {item.unit}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
