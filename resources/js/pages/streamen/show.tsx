import { Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import YouTubeAdAwarePlayer from '@/components/YouTubeAdAwarePlayer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type Props = {
    stream: {
        name: string;
        slug: string;
        youtube_url: string;
        promotion_group_id: number | null;
        group?: { id: number; name: string; slug: string } | null;
        active: boolean;
        ad_interval_seconds: number;
        ad_count: number;
        pause_on_ads: boolean;
    };
};

function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /youtu\.be\/([A-Za-z0-9_-]{11})/,
        /v=([A-Za-z0-9_-]{11})/,
        /watch\?v=([A-Za-z0-9_-]{11})/,
        /embed\/([A-Za-z0-9_-]{11})/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p as RegExp);
        if (m && m[1]) return m[1];
    }
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
    return null;
}

export default function StreamenShow({ stream }: Props) {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState<number>(0);
    const [adsRemaining, setAdsRemaining] = useState<number>(stream.ad_count);
    const [nextAdSeconds, setNextAdSeconds] = useState<number>(stream.ad_interval_seconds);
    const playerRef = useRef<any>(null);
    const youtubeId = extractYouTubeId(stream.youtube_url);

    useEffect(() => {
        function updateSize() {
            setHeight(window.innerHeight);
        }
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (!stream.ad_interval_seconds || adsRemaining <= 0) {
            return;
        }

        const interval = window.setInterval(() => {
            setNextAdSeconds(prev => {
                if (prev <= 1) {
                    if (adsRemaining > 0) {
                        triggerAdBreak();
                    }
                    return stream.ad_interval_seconds;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [stream.ad_interval_seconds, adsRemaining]);

    async function fetchPromotions(groupSlug: string) {
        try {
            const res = await fetch(`/api/v1/promotions/${groupSlug}?active=true`);
            if (!res.ok) return [];
            const json = await res.json();
            return json.data ?? [];
        } catch (err) {
            return [];
        }
    }

    async function triggerAdBreak() {
        if (!stream.group?.slug || adsRemaining <= 0) return;
        const data = await fetchPromotions(stream.group.slug);
        setPromotions(data);
        setAdsRemaining(prev => Math.max(prev - 1, 0));
        if (stream.pause_on_ads && playerRef.current?.pauseVideo) {
            playerRef.current.pauseVideo();
        }
        if (data.length > 0) {
            setOpen(true);
        }
    }

    function onAdEnd() {
        setOpen(false);
        if (stream.pause_on_ads && playerRef.current?.playVideo) {
            playerRef.current.playVideo();
        }
    }

    return (
        <div className="bg-black text-white min-h-screen min-w-screen h-screen w-screen">
            <Head title={stream.name} />

            <div className="h-full w-full flex flex-col">
                <div className="flex-0 p-3 text-sm text-slate-300 bg-black/30 z-20">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                        <div>
                            <strong className="text-lg">{stream.name}</strong>
                            <div className="text-xs text-slate-400">Group: {stream.group?.name ?? 'No group'}</div>
                            <div className="text-xs text-slate-400">Siguiente anuncio en: {nextAdSeconds}s · Quedan {adsRemaining}</div>
                        </div>
                        <div className="text-xs text-slate-400">Stream: {stream.slug}</div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    {youtubeId ? (
                        <div className="w-full h-full">
                            <YouTubeAdAwarePlayer
                                ref={playerRef}
                                youtubeId={youtubeId}
                                height={height || 720}
                                onAdEnd={onAdEnd}
                                autoplay={true}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full w-full">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-slate-200">
                                Invalid YouTube URL for this stream.
                            </div>
                        </div>
                    )}
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Promotions</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {promotions.length === 0 ? (
                                <p>There are no active promotions for this group.</p>
                            ) : promotions.map(p => (
                                <div key={p.id} className="rounded-xl border border-slate-200/10 p-4 bg-black/90 text-white">
                                    <div className="text-lg font-semibold">{p.title}</div>
                                    <div className="text-sm text-slate-400">{p.description}</div>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button onClick={onAdEnd}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
