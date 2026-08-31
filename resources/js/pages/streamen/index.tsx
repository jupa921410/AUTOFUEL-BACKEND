import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, PromotionGroup, TvStream } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Streamen', href: '/streamen' },
];

type Props = {
    streams: TvStream[];
    promotionGroups: PromotionGroup[];
};

type StreamForm = {
    name: string;
    slug: string;
    youtube_url: string;
    promotion_group_id: string;
    active: boolean;
    ad_interval_seconds: number;
    ad_count: number;
    pause_on_ads: boolean;
};

const emptyForm: StreamForm = {
    name: '',
    slug: '',
    youtube_url: '',
    promotion_group_id: '',
    active: true,
    ad_interval_seconds: 300,
    ad_count: 1,
    pause_on_ads: true,
};

export default function StreamenIndex({ streams, promotionGroups }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<TvStream | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TvStream | null>(null);

    const createForm = useForm<StreamForm>(emptyForm);
    const editForm = useForm<StreamForm>(emptyForm);
    const deleteForm = useForm({});

    function openEdit(stream: TvStream) {
        setEditTarget(stream);
        editForm.setData({
            name: stream.name,
            slug: stream.slug,
            youtube_url: stream.youtube_url,
            promotion_group_id: stream.promotion_group_id ? String(stream.promotion_group_id) : '',
            active: stream.active,
            ad_interval_seconds: stream.ad_interval_seconds ?? 300,
            ad_count: stream.ad_count ?? 1,
            pause_on_ads: stream.pause_on_ads ?? true,
        });
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/streamen', {
            onSuccess: () => {
                setOpenCreate(false);
                createForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.put(`/streamen/${editTarget.id}`, {
            onSuccess: () => setEditTarget(null),
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/streamen/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Streamen" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Streamen</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage TV streams. Each stream contains a YouTube URL and a promotion group shown during advertisements.
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nuevo Stream
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Name</th>
                                <th className="px-4 py-3 text-left font-semibold">Slug</th>
                                <th className="px-4 py-3 text-left font-semibold">Grupo</th>
                                <th className="px-4 py-3 text-left font-semibold">URL de YouTube</th>
                                <th className="px-4 py-3 text-left font-semibold">Anuncios</th>
                                <th className="px-4 py-3 text-center font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streams.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No streams have been added.
                                    </td>
                                </tr>
                            )}
                            {streams.map(stream => (
                                <tr key={stream.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{stream.name}</td>
                                    <td className="px-4 py-3">
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{stream.slug}</code>
                                    </td>
                                    <td className="px-4 py-3">
                                        {stream.group?.name ?? 'No group'}
                                    </td>
                                    <td className="px-4 py-3 truncate max-w-[240px] text-sm text-muted-foreground">{stream.youtube_url}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        <div>{stream.ad_count} anuncios cada {stream.ad_interval_seconds} s</div>
                                        <div>{stream.pause_on_ads ? 'Pause enabled' : 'No pause'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {stream.active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(stream)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(stream)}>
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

            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nuevo Stream</DialogTitle>
                        <DialogDescription>Create a TV stream with a YouTube URL and promotion group.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Name *</Label>
                                <Input value={createForm.data.name} onChange={e => createForm.setData('name', e.target.value)} placeholder="Stream name" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Slug (URL) *</Label>
                                <Input value={createForm.data.slug} onChange={e => createForm.setData('slug', e.target.value)} placeholder="stream-tv-1" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>URL o ID de YouTube *</Label>
                                <Input value={createForm.data.youtube_url} onChange={e => createForm.setData('youtube_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                            </div>
                                <div className="col-span-2 space-y-1.5">
                                <Label>Grupo de promociones</Label>
                                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={createForm.data.promotion_group_id} onChange={e => createForm.setData('promotion_group_id', e.target.value)}>
                                    <option value="">No group</option>
                                    {promotionGroups.map(group => (
                                        <option key={group.id} value={String(group.id)}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Intervalo de anuncios (segundos)</Label>
                                <Input type="number" min={10} value={createForm.data.ad_interval_seconds} onChange={e => createForm.setData('ad_interval_seconds', Number(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cantidad de anuncios</Label>
                                <Input type="number" min={1} value={createForm.data.ad_count} onChange={e => createForm.setData('ad_count', Number(e.target.value))} />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox id="stream-pause-on-ads" checked={createForm.data.pause_on_ads} onCheckedChange={v => createForm.setData('pause_on_ads', !!v)} />
                                <Label htmlFor="stream-pause-on-ads">Pausar video durante anuncio</Label>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox id="stream-active" checked={createForm.data.active} onCheckedChange={v => createForm.setData('active', !!v)} />
                                <Label htmlFor="stream-active">Stream activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Stream</DialogTitle>
                        <DialogDescription>Update the YouTube URL or promotion group.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Name *</Label>
                                <Input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Slug</Label>
                                <Input value={editForm.data.slug} onChange={e => editForm.setData('slug', e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>URL o ID de YouTube *</Label>
                                <Input value={editForm.data.youtube_url} onChange={e => editForm.setData('youtube_url', e.target.value)} />
                            </div>
                                <div className="col-span-2 space-y-1.5">
                                <Label>Grupo de promociones</Label>
                                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.data.promotion_group_id} onChange={e => editForm.setData('promotion_group_id', e.target.value)}>
                                    <option value="">No group</option>
                                    {promotionGroups.map(group => (
                                        <option key={group.id} value={String(group.id)}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Intervalo de anuncios (segundos)</Label>
                                <Input type="number" min={10} value={editForm.data.ad_interval_seconds} onChange={e => editForm.setData('ad_interval_seconds', Number(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cantidad de anuncios</Label>
                                <Input type="number" min={1} value={editForm.data.ad_count} onChange={e => editForm.setData('ad_count', Number(e.target.value))} />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox id="edit-stream-pause-on-ads" checked={editForm.data.pause_on_ads} onCheckedChange={v => editForm.setData('pause_on_ads', !!v)} />
                                <Label htmlFor="edit-stream-pause-on-ads">Pausar video durante anuncio</Label>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox id="edit-stream-active" checked={editForm.data.active} onCheckedChange={v => editForm.setData('active', !!v)} />
                                <Label htmlFor="edit-stream-active">Stream activo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Stream</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the stream <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
