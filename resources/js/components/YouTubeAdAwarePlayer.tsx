import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

declare global {
    interface Window { onYouTubeIframeAPIReady?: () => void; YT: any }
}

type Props = {
    youtubeId: string;
    width?: number | string;
    height?: number | string;
    autoMuteDuringAd?: boolean;
    showOverlayDuringAd?: boolean;
    autoplay?: boolean;
    onAdStart?: () => void;
    onAdEnd?: () => void;
    checkIntervalMs?: number;
    className?: string;
};

const YouTubeAdAwarePlayer = forwardRef(({
    youtubeId,
    width = '100%',
    height = 360,
    autoMuteDuringAd = true,
    showOverlayDuringAd = true,
    autoplay = false,
    onAdStart,
    onAdEnd,
    checkIntervalMs = 1000,
    className = ''
}: Props, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const [isAd, setIsAd] = useState(false);

    useImperativeHandle(ref, () => ({
        pauseVideo: () => playerRef.current?.pauseVideo(),
        playVideo: () => playerRef.current?.playVideo(),
        getPlayer: () => playerRef.current,
    }), []);

    // Load YouTube IFrame API once
    useEffect(() => {
        if (window.YT && window.YT.Player) return;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }, []);

    useEffect(() => {
        let mounted = true;
        if (!containerRef.current) return;
        const id = `yt-player-${youtubeId}-${String(Math.random()).slice(2,8)}`;
        containerRef.current.id = id;

        function createPlayer() {
            if (!mounted) return;
            playerRef.current = new window.YT.Player(containerRef.current!.id, {
                height: String(height),
                width: String(width),
                videoId: youtubeId,
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    enablejsapi: 1,
                    playsinline: 1,
                    autoplay: autoplay ? 1 : 0,
                },
                events: {
                    onReady: (e: any) => {
                        try {
                            if (autoplay) {
                                e.target.mute();
                                e.target.playVideo();
                            }
                        } catch (err) {
                            // swallow errors from autoplay restrictions
                        }
                    },
                    onStateChange: (e: any) => handleStateChange(e)
                }
            });
        }

        function handleStateChange(event: any) {
            if (event.data === window.YT.PlayerState.PLAYING) {
                startDetection();
            } else {
                stopDetection();
                setIsAd(false);
            }
        }

        function startDetection() {
            lastTimeRef.current = playerRef.current.getCurrentTime();
            if (intervalRef.current) return;
            intervalRef.current = window.setInterval(() => {
                try {
                    const state = playerRef.current.getPlayerState();
                    const current = playerRef.current.getCurrentTime();
                    if (state === window.YT.PlayerState.PLAYING && Math.abs(current - lastTimeRef.current) < 0.01) {
                        if (!isAd) {
                            setIsAd(true);
                            if (autoMuteDuringAd) playerRef.current.mute();
                            if (typeof onAdStart === 'function') onAdStart();
                        }
                    } else {
                        if (isAd) {
                            setIsAd(false);
                            if (autoMuteDuringAd) playerRef.current.unMute();
                            if (typeof onAdEnd === 'function') onAdEnd();
                        }
                        lastTimeRef.current = current;
                    }
                } catch (err) {
                    // ignore temporary errors
                }
            }, checkIntervalMs);
        }

        function stopDetection() {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = () => createPlayer();
        }

        const fallbackTimer = window.setTimeout(() => {
            try {
                if (!playerRef.current && containerRef.current) {
                    const iframe = document.createElement('iframe');
                    const autoplayParam = autoplay ? '1' : '0';
                    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplayParam}&mute=1&playsinline=1&rel=0&enablejsapi=1`;
                    iframe.width = String(width);
                    iframe.height = String(height);
                    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
                    iframe.allowFullscreen = true;
                    containerRef.current.innerHTML = '';
                    containerRef.current.appendChild(iframe);
                }
            } catch (err) {
                // ignore
            }
        }, 2500);

        return () => {
            mounted = false;
            stopDetection();
            clearTimeout(fallbackTimer);
            if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
        };
    }, [youtubeId, width, height, autoMuteDuringAd, checkIntervalMs, autoplay]);

    return (
        <div className={className} style={{ position: 'relative' }}>
            <div ref={containerRef} id={`yt-player-${youtubeId}`} />
            {showOverlayDuringAd && isAd && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Publicidad</div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>An advertisement was detected. Returning to the content shortly.</div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default YouTubeAdAwarePlayer;
