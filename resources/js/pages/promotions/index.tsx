import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, Promotion, PromotionGroup } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Promotions', href: '/promotions' },
];

type Props = {
    promotions: Promotion[];
    promotionGroups: PromotionGroup[];
};

type PromotionForm = {
    promotion_group_id: string;
    title: string;
    description: string;
    discount_percentage: string;
    start_date: string;
    end_date: string;
    active: boolean;
    media: File | null;
    youtube_url?: string;
    text_position: string;
};

const textPositionOptions = [
    { value: 'top-left', label: 'Top left' },
    { value: 'top-center', label: 'Top center' },
    { value: 'top-right', label: 'Top right' },
    { value: 'center-left', label: 'Center left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center right' },
    { value: 'bottom-left', label: 'Bottom left' },
    { value: 'bottom-center', label: 'Bottom center' },
    { value: 'bottom-right', label: 'Bottom right' },
];

const emptyForm: PromotionForm = {
    promotion_group_id: '',
    title: '',
    description: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
    active: true,
    media: null,
    youtube_url: '',
    text_position: 'center',
};

type MediaPreview = { url: string; type: 'image' | 'video' } | null;

function MediaThumb({ promo }: { promo: Promotion }) {
    if (!promo.image) {
        if (promo.youtube_id) {
            return (
                <img src={`https://img.youtube.com/vi/${promo.youtube_id}/hqdefault.jpg`} alt={promo.title} className="h-12 w-12 rounded-lg object-cover border" />
            );
        }
        return (
            <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-xs">
                No media
            </div>
        );
    }
    if (promo.media_type === 'video') {
        return (
            <video
                src={`/storage/${promo.image}`}
                className="h-12 w-12 rounded-lg object-cover border bg-black"
                muted
                playsInline
            />
        );
    }
    return <img src={`/storage/${promo.image}`} alt={promo.title} className="h-12 w-12 rounded-lg object-cover border" />;
}

function MediaPreviewBlock({ preview }: { preview: MediaPreview }) {
    if (!preview) return null;
    if (preview.type === 'video') {
        return (
            <div className="h-40 w-full rounded-lg border bg-black">
                <iframe
                    src={preview.url}
                    title="preview"
                    className="h-40 w-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }
    return <img src={preview.url} alt="preview" className="h-40 w-full rounded-lg object-cover border" />;
}

function getMediaPreview(file: File): MediaPreview {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    return { url, type };
}

function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /youtu\.be\/([A-Za-z0-9_-]{11})/,
        /v=([A-Za-z0-9_-]{11})/,
        /watch\?v=([A-Za-z0-9_-]{11})/,
        /embed\/( [A-Za-z0-9_-]{11})/,
        /youtube\.com\/shorts\/( [A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p as RegExp);
        if (m && m[1]) return m[1];
    }
    // If id provided directly
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
    return null;
}

export default function PromotionsIndex({ promotions, promotionGroups }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Promotion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
    const [createPreview, setCreatePreview] = useState<MediaPreview>(null);
    const [editPreview, setEditPreview] = useState<MediaPreview>(null);
    const createFileRef = useRef<HTMLInputElement>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const createForm = useForm<PromotionForm>(emptyForm);
    const editForm = useForm<PromotionForm>(emptyForm);
    const deleteForm = useForm({});

    function openEdit(promo: Promotion) {
        setEditTarget(promo);
        setEditPreview(
            promo.image
                ? { url: `/storage/${promo.image}`, type: promo.media_type ?? 'image' }
                : null,
        );
        editForm.setData({
            promotion_group_id: promo.promotion_group_id ? String(promo.promotion_group_id) : '',
            title: promo.title,
            description: promo.description ?? '',
            discount_percentage: promo.discount_percentage,
            start_date: promo.start_date,
            end_date: promo.end_date,
            active: promo.active,
            media: null,
            text_position: promo.text_position || 'center',
        });
    }

    function handleCreateFile(e: React.ChangeEvent<HTMLInputElement>) {
        const rawFile = e.target.files?.[0] ?? null;
        createForm.setData('media', rawFile);
        setCreatePreview(rawFile ? getMediaPreview(rawFile) : null);
    }

    function handleCreateYoutube(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value;
        createForm.setData('youtube_url', url);
        const id = extractYouTubeId(url || '');
        if (id) {
            setCreatePreview({ url: `https://www.youtube.com/embed/${id}?enablejsapi=1`, type: 'video' });
        } else if (!createForm.data.media) {
            setCreatePreview(null);
        }
    }

    function handleEditFile(e: React.ChangeEvent<HTMLInputElement>) {
        const rawFile = e.target.files?.[0] ?? null;
        editForm.setData('media', rawFile);
        if (rawFile) {
            setEditPreview(getMediaPreview(rawFile));
        } else if (editTarget?.image) {
            setEditPreview({ url: `/storage/${editTarget.image}`, type: editTarget.media_type ?? 'image' });
        } else {
            setEditPreview(null);
        }
    }

    function handleEditYoutube(e: React.ChangeEvent<HTMLInputElement>) {
        const url = e.target.value;
        editForm.setData('youtube_url', url);
        const id = extractYouTubeId(url || '');
        if (id) {
            setEditPreview({ url: `https://www.youtube.com/embed/${id}?enablejsapi=1`, type: 'video' });
        } else if (!editTarget?.image) {
            setEditPreview(null);
        }
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/promotions', {
            forceFormData: true,
            onSuccess: () => {
                setOpenCreate(false);
                setCreatePreview(null);
                createForm.reset();
                if (createFileRef.current) createFileRef.current.value = '';
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editTarget) return;
        editForm.transform(data => ({ ...data, _method: 'PUT' }));
        editForm.post(`/promotions/${editTarget.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditTarget(null);
                setEditPreview(null);
                if (editFileRef.current) editFileRef.current.value = '';
            },
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteForm.delete(`/promotions/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const mediaAccept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
                        <p className="text-muted-foreground text-sm">
                            Manage AutoFuel promotions. Images and videos are supported.
                        </p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Promotion
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Media</th>
                                <th className="px-4 py-3 text-left font-semibold">Title</th>
                                <th className="px-4 py-3 text-left font-semibold">Grupo</th>
                                <th className="px-4 py-3 text-left font-semibold">Descuento</th>
                                <th className="px-4 py-3 text-left font-semibold">Vigencia</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        No promotions have been added.
                                    </td>
                                </tr>
                            )}
                            {promotions.map(promo => (
                                <tr key={promo.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-start gap-1">
                                            <MediaThumb promo={promo} />
                                            {promo.media_type === 'video' && (
                                                <Badge variant="outline" className="text-[10px]">Video</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {promo.title || <span className="text-muted-foreground italic text-xs">Untitled</span>}
                                        {promo.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                {promo.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {promo.group
                                            ? <Badge variant="outline" className="text-xs font-mono">{promo.group.slug}</Badge>
                                            : <span className="text-muted-foreground text-xs">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-orange-500">
                                        {promo.discount_percentage}%
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {promo.start_date}<br />→ {promo.end_date}
                                    </td>
                                    <td className="px-4 py-3">
                                        {promo.active
                                            ? <Badge variant="default">Activa</Badge>
                                            : <Badge variant="secondary">Inactiva</Badge>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(promo)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(promo)}>
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Promotion</DialogTitle>
                        <DialogDescription>Enter the details to create a new promotion.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Grupo de Promotion</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={createForm.data.promotion_group_id}
                                    onChange={e => createForm.setData('promotion_group_id', e.target.value)}
                                >
                                    <option value="">No group</option>
                                    {promotionGroups.map(g => (
                                        <option key={g.id} value={String(g.id)}>{g.name}</option>
                                    ))}
                                </select>
                                {createForm.errors.promotion_group_id && <p className="text-destructive text-xs">{createForm.errors.promotion_group_id}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Title (opcional)</Label>
                                <Input
                                    value={createForm.data.title}
                                    onChange={e => createForm.setData('title', e.target.value)}
                                    placeholder="Example: Buy One Coffee, Get One Free"
                                />
                                {createForm.errors.title && <p className="text-destructive text-xs">{createForm.errors.title}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Description</Label>
                                <Input
                                    value={createForm.data.description}
                                    onChange={e => createForm.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Text position on TV</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={createForm.data.text_position}
                                    onChange={e => createForm.setData('text_position', e.target.value)}
                                >
                                    {textPositionOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {createForm.errors.text_position && <p className="text-destructive text-xs">{createForm.errors.text_position}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Descuento (%) *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={createForm.data.discount_percentage}
                                    onChange={e => createForm.setData('discount_percentage', e.target.value)}
                                />
                                {createForm.errors.discount_percentage && (
                                    <p className="text-destructive text-xs">{createForm.errors.discount_percentage}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Imagen o Video</Label>
                                <Input
                                    type="file"
                                    accept={mediaAccept}
                                    ref={createFileRef}
                                    onChange={handleCreateFile}
                                    className="cursor-pointer"
                                />
                                <Label className="mt-2">O URL de YouTube (opcional)</Label>
                                <Input
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={createForm.data.youtube_url}
                                    onChange={handleCreateYoutube}
                                />
                                <p className="text-[11px] text-muted-foreground">JPG, PNG, GIF, WebP, MP4, MOV, WebM · max. 50 MB</p>
                                {createForm.errors.media && <p className="text-destructive text-xs">{createForm.errors.media}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date Inicio *</Label>
                                <Input
                                    type="date"
                                    value={createForm.data.start_date}
                                    onChange={e => createForm.setData('start_date', e.target.value)}
                                />
                                {createForm.errors.start_date && <p className="text-destructive text-xs">{createForm.errors.start_date}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date Fin *</Label>
                                <Input
                                    type="date"
                                    value={createForm.data.end_date}
                                    onChange={e => createForm.setData('end_date', e.target.value)}
                                />
                                {createForm.errors.end_date && <p className="text-destructive text-xs">{createForm.errors.end_date}</p>}
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox
                                    id="c-active"
                                    checked={createForm.data.active}
                                    onCheckedChange={v => createForm.setData('active', !!v)}
                                />
                                <Label htmlFor="c-active">Promotion activa</Label>
                            </div>
                        </div>
                        <MediaPreviewBlock preview={createPreview} />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setOpenCreate(false); setCreatePreview(null); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Promotion</DialogTitle>
                        <DialogDescription>Update the promotion details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Grupo de Promotion</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editForm.data.promotion_group_id}
                                    onChange={e => editForm.setData('promotion_group_id', e.target.value)}
                                >
                                    <option value="">No group</option>
                                    {promotionGroups.map(g => (
                                        <option key={g.id} value={String(g.id)}>{g.name}</option>
                                    ))}
                                </select>
                                {editForm.errors.promotion_group_id && <p className="text-destructive text-xs">{editForm.errors.promotion_group_id}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Title (opcional)</Label>
                                <Input
                                    value={editForm.data.title}
                                    onChange={e => editForm.setData('title', e.target.value)}
                                />
                                {editForm.errors.title && <p className="text-destructive text-xs">{editForm.errors.title}</p>}
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Description</Label>
                                <Input
                                    value={editForm.data.description}
                                    onChange={e => editForm.setData('description', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Text position on TV</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editForm.data.text_position}
                                    onChange={e => editForm.setData('text_position', e.target.value)}
                                >
                                    {textPositionOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {editForm.errors.text_position && <p className="text-destructive text-xs">{editForm.errors.text_position}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Descuento (%) *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={editForm.data.discount_percentage}
                                    onChange={e => editForm.setData('discount_percentage', e.target.value)}
                                />
                                {editForm.errors.discount_percentage && (
                                    <p className="text-destructive text-xs">{editForm.errors.discount_percentage}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cambiar Imagen / Video</Label>
                                <Input
                                    type="file"
                                    accept={mediaAccept}
                                    ref={editFileRef}
                                    onChange={handleEditFile}
                                    className="cursor-pointer"
                                />
                                <Label className="mt-2">O URL de YouTube (opcional)</Label>
                                <Input
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={editForm.data.youtube_url}
                                    onChange={handleEditYoutube}
                                />
                                <p className="text-[11px] text-muted-foreground">JPG, PNG, GIF, WebP, MP4, MOV, WebM · max. 50 MB</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date Inicio *</Label>
                                <Input
                                    type="date"
                                    value={editForm.data.start_date}
                                    onChange={e => editForm.setData('start_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Date Fin *</Label>
                                <Input
                                    type="date"
                                    value={editForm.data.end_date}
                                    onChange={e => editForm.setData('end_date', e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                                <Checkbox
                                    id="e-active"
                                    checked={editForm.data.active}
                                    onCheckedChange={v => editForm.setData('active', !!v)}
                                />
                                <Label htmlFor="e-active">Promotion activa</Label>
                            </div>
                        </div>
                        <MediaPreviewBlock preview={editPreview} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Promotion</DialogTitle>
                        <DialogDescription>This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete the promotion <strong>{deleteTarget?.title || 'untitled'}</strong>? This action cannot be undone.
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
