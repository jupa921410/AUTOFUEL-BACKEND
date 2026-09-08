import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BreadcrumbItem, Post } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Blog', href: '/posts' },
];

function imgSrc(image: string | null): string | null {
    if (!image) return null;

    return image.startsWith('images/') ? `/${image}` : `/storage/${image}`;
}

type Props = {
    posts: Post[];
};

type PostForm = {
    title: string;
    excerpt: string;
    content: string;
    is_published: boolean;
    image: File | null;
};

export default function PostsIndex({ posts }: Props) {
    const [openCreate, setOpenCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<Post | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
    const [createPreview, setCreatePreview] = useState<string | null>(null);    
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const createFileRef = useRef<HTMLInputElement>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const createForm = useForm<PostForm>({
        title: '',
        excerpt: '',
        content: '',
        is_published: false,
        image: null,
    });

    const editForm = useForm<PostForm>({
        title: '',
        excerpt: '',
        content: '',
        is_published: false,
        image: null,
    });

    const deleteForm = useForm({});

    function openEdit(post: Post) {
        setEditTarget(post);
        setEditPreview(imgSrc(post.image));
        editForm.setData({
            title: post.title,
            excerpt: post.excerpt ?? '',
            content: post.content ?? '',
            is_published: post.is_published,
            image: null,
        });
    }

    const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

    function handleCreateImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_IMAGE_BYTES) {
            createForm.setError('image', 'The image cannot exceed 5 MB.');
            e.target.value = '';
            return;
        }
        createForm.clearErrors('image');
        createForm.setData('image', file);
        setCreatePreview(file ? URL.createObjectURL(file) : null);
    }

    function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (file && file.size > MAX_IMAGE_BYTES) {
            editForm.setError('image', 'The image cannot exceed 5 MB.');
            e.target.value = '';
            return;
        }
        editForm.clearErrors('image');
        editForm.setData('image', file);
        setEditPreview(file ? URL.createObjectURL(file) : imgSrc(editTarget?.image ?? null));
    }

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post('/posts', {
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
                            console.log('ekiiiii');

        // Use a hidden _method because Laravel does not support PUT with FormData/Files
        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        } as any));
        editForm.post(`/posts/${editTarget.id}`, {
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
        deleteForm.delete(`/posts/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
                        <p className="text-muted-foreground text-sm">Manage website articles and news.</p>
                    </div>
                    <Button onClick={() => setOpenCreate(true)}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Nuevo Post
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold w-20">Imagen</th>
                                <th className="px-4 py-3 text-left font-semibold">Title</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">Publicado</th>
                                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No published articles.
                                    </td>
                                </tr>
                            )}
                            {posts.map((post) => (
                                <tr key={post.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3">
                                        {post.image ? (
                                            <img
                                                src={imgSrc(post.image)!}
                                                alt={post.title}
                                                className="h-12 w-12 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-1">
                                                No image
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{post.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{post.excerpt}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {post.is_published ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                                                <EyeIcon className="h-3 w-3" /> Publicado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                                <EyeOffIcon className="h-3 w-3" /> Borrador
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(post)}>
                                                <PencilIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(post)}>
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Nuevo Post</DialogTitle>
                        <DialogDescription>Create a new blog article.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-title">Title *</Label>
                                <Input id="c-title" value={createForm.data.title} onChange={e => createForm.setData('title', e.target.value)} placeholder="Article title" />
                                {createForm.errors.title && <p className="text-destructive text-xs">{createForm.errors.title}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-excerpt">Short description (Excerpt) *</Label>
                                <textarea id="c-excerpt" value={createForm.data.excerpt} onChange={e => createForm.setData('excerpt', e.target.value)} placeholder="A short summary for the post list..." rows={2} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                {createForm.errors.excerpt && <p className="text-destructive text-xs">{createForm.errors.excerpt}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-content">Contenido</Label>
                                <textarea id="c-content" value={createForm.data.content} onChange={e => createForm.setData('content', e.target.value)} placeholder="Article content..." rows={6} className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                {createForm.errors.content && <p className="text-destructive text-xs">{createForm.errors.content}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="c-img">Imagen de portada</Label>
                                    <Input id="c-img" type="file" accept="image/*" ref={createFileRef} onChange={handleCreateImageChange} className="cursor-pointer" />
                                    {createForm.errors.image && <p className="text-destructive text-xs">{createForm.errors.image}</p>}
                                </div>
                                <div className="flex flex-col justify-end gap-2 pb-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={createForm.data.is_published} onCheckedChange={(v: boolean) => createForm.setData('is_published', v)} id="c-pub" />
                                        <Label htmlFor="c-pub">Publicar inmediatamente</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {createPreview && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                <img src={createPreview} alt="preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setOpenCreate(false); setCreatePreview(null); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save Post</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Post</DialogTitle>
                        <DialogDescription>Update the article details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label>Title *</Label>
                                <Input value={editForm.data.title} onChange={e => editForm.setData('title', e.target.value)} />
                                {editForm.errors.title && <p className="text-destructive text-xs">{editForm.errors.title}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Short description (Excerpt) *</Label>
                                <textarea value={editForm.data.excerpt} onChange={e => editForm.setData('excerpt', e.target.value)} rows={2} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                {editForm.errors.excerpt && <p className="text-destructive text-xs">{editForm.errors.excerpt}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label>Contenido</Label>
                                <textarea value={editForm.data.content} onChange={e => editForm.setData('content', e.target.value)} rows={6} className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                                {editForm.errors.content && <p className="text-destructive text-xs">{editForm.errors.content}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Change Image</Label>
                                    <Input type="file" accept="image/*" ref={editFileRef} onChange={handleEditImageChange} className="cursor-pointer" />
                                    {editForm.errors.image && <p className="text-destructive text-xs">{editForm.errors.image}</p>}
                                </div>
                                <div className="flex flex-col justify-end gap-2 pb-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={editForm.data.is_published} onCheckedChange={(v: boolean) => editForm.setData('is_published', v)} id="e-pub" />
                                        <Label htmlFor="e-pub">Publicado</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {editPreview && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                <img src={editPreview} alt="preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Update Post</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>Are you sure you want to permanently delete the post <strong>{deleteTarget?.title}</strong>? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteForm.processing}>Delete definitivamente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
