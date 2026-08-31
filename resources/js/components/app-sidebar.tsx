import { Link } from '@inertiajs/react';
import { ArrowLeftRight, Boxes, Clock, LayoutGrid, Layers, Monitor, Percent, Settings, ShoppingBag, Tag, TrendingUp, UtensilsCrossed, Wallet, Newspaper, Webhook, Play } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Categories',
        href: '/categories',
        icon: Tag,
    },
    {
        title: 'Products',
        href: '/products',
        icon: UtensilsCrossed,
    },
    {
        title: 'Blog',
        href: '/posts',
        icon: Newspaper,
    },
    {
        title: 'TV Menu Screens',
        href: '/menu-screens',
        icon: Monitor,
    },
    {
        title: 'Inventory',
        href: '/inventory/items',
        icon: Boxes,
        children: [
            {
                title: 'Items',
                href: '/inventory/items',
                icon: Boxes,
            },
            {
                title: 'Purchases',
                href: '/inventory/purchases',
                icon: ShoppingBag,
            },
            {
                title: 'Recipes (Ingredientes)',
                href: '/inventory/recipes',
                icon: UtensilsCrossed,
            },
        ],
    },
    {
        title: 'Promotions',
        href: '/promotions',
        icon: Percent,
        children: [
            {
                title: 'Promotion List',
                href: '/promotions',
                icon: Percent,
            },
            {
                title: 'Promotion Groups',
                href: '/promotion-groups',
                icon: Layers,
            },
            {
                title: 'Streamen',
                href: '/streamen',
                icon: Play,
            },
        ],
    },
    {
        title: 'Accounting',
        href: '/accounting',
        icon: TrendingUp,
        children: [
            {
                title: 'Accounting Dashboard',
                href: '/accounting',
                icon: TrendingUp,
            },
            {
                title: 'Transactions',
                href: '/transactions',
                icon: ArrowLeftRight,
            },
            {
                title: 'Accounting Categories',
                href: '/accounting-categories',
                icon: Wallet,
            },
        ],
    },
    {
        title: 'Administration',
        href: '/inventory/toast-orders',
        icon: Settings,
        children: [
            {
                title: 'Toast Orders (API)',
                href: '/inventory/toast-orders',
                icon: ShoppingBag,
            },
            {
                title: 'Toast Products',
                href: '/admin/toast/products',
                icon: UtensilsCrossed,
            },
            {
                title: 'Webhook Orders',
                href: '/admin/toast/webhook-orders',
                icon: Webhook,
            },
        ],
    },
    {
        title: 'Promotional Text',
        href: '/site-settings',
        icon: LayoutGrid,
    },
    {
        title: 'Business Hours',
        href: '/horarios',
        icon: Clock,
    },
];



export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="border-b border-sidebar-border/80 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-14 hover:bg-primary/10">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="px-2 py-1 text-center text-[9px] font-bold tracking-[0.24em] text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
                    <span className="text-primary">●</span> We are energy. We are performance.
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
