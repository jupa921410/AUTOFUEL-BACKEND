import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Banner Promocional', href: '/site-settings' },
];

type SettingsData = {
    promo_banner_active: boolean;
    promo_banner_text: string;
};

type Props = {
    settings: SettingsData;
};

export default function SiteSettingsIndex({ settings }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm<SettingsData>({
        promo_banner_active: Boolean(settings.promo_banner_active),
        promo_banner_text: settings.promo_banner_text || '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/site-settings');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Banner Promocional" />

            <div className="flex flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col gap-2 border-b pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">Banner Promocional</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage the promotional text shown at the top of the public AutoFuel website.
                    </p>
                </div>

                <div className="rounded-xl border bg-card shadow-sm p-6 overflow-hidden">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                            <div className="space-y-0.5">
                                <Label htmlFor="promo-active" className="text-base">Activar Banner</Label>
                                <p className="text-sm text-muted-foreground">
                                    Show or completely hide the orange promotional banner on the main website.
                                </p>
                            </div>
                            <Checkbox
                                id="promo-active"
                                checked={data.promo_banner_active}
                                onCheckedChange={(checked) => setData('promo_banner_active', checked as boolean)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="promo-text" className="text-base">Banner Text</Label>
                            <Input
                                id="promo-text"
                                className="h-12"
                                placeholder="Enter the announcement here, for example: Grand Opening April 15! Emojis are welcome ☕"
                                value={data.promo_banner_text}
                                onChange={(e) => setData('promo_banner_text', e.target.value)}
                            />
                            {errors.promo_banner_text && (
                                <p className="text-sm font-medium text-destructive">{errors.promo_banner_text}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                This will be the only text visible in the top banner.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button type="submit" disabled={processing} className="min-w-32">
                                Save Changes
                            </Button>
                            {recentlySuccessful && (
                                <p className="text-sm text-green-600 font-medium transition-all">
                                    ✓ Cambios guardados correctamente.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
