import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Clock, PencilIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem, Schedule } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Business Hours', href: '/horarios' },
];

type Props = {
    horarios: Schedule[];
};

export default function ScheduleIndex({ horarios }: Props) {
    const [editTarget, setEditTarget] = useState<Schedule | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        init: '',
        end: '',
        closed: false,
    });

    function openEdit(horario: Schedule) {
        setEditTarget(horario);
        setData({
            init: horario.init?.substring(0, 5) ?? '09:00',
            end: horario.end?.substring(0, 5) ?? '22:00',
            closed: !!horario.closed,
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;

        put(`/horarios/${editTarget.id}`, {
            onSuccess: () => {
                setEditTarget(null);
                reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Hours" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Business Hours</h1>
                        <p className="text-muted-foreground text-sm">Configure opening and closing times for each day of the week.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {horarios.map((horario) => (
                        <div 
                            key={horario.id} 
                            className="group relative flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${horario.closed ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{horario.day}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {horario.closed ? (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 uppercase tracking-wider">
                                                <XCircle className="h-4 w-4" /> Closed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" /> 
                                                {horario.init?.substring(0, 5)} — {horario.end?.substring(0, 5)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-9 w-9 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => openEdit(horario)}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Schedule: {editTarget?.day}</DialogTitle>
                        <DialogDescription>Adjust opening and closing times or mark the day as closed.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-6 pt-4">
                        <div className="flex items-center space-x-2 rounded-lg border bg-muted/50 p-4">
                            <Checkbox 
                                id="closed" 
                                checked={data.closed} 
                                onCheckedChange={(checked: boolean) => setData('closed', checked)} 
                            />
                            <Label htmlFor="closed" className="cursor-pointer font-medium">Marked as closed for this day</Label>
                        </div>

                        {!data.closed && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="init">Apertura</Label>
                                    <Input 
                                        id="init" 
                                        type="time" 
                                        value={data.init} 
                                        onChange={e => setData('init', e.target.value)} 
                                    />
                                    {errors.init && <p className="text-destructive text-xs italic">{errors.init}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end">Cierre</Label>
                                    <Input 
                                        id="end" 
                                        type="time" 
                                        value={data.end} 
                                        onChange={e => setData('end', e.target.value)} 
                                    />
                                    {errors.end && <p className="text-destructive text-xs italic">{errors.end}</p>}
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
