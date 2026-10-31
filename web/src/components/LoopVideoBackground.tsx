"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

const DAY_MEDIA = "(prefers-color-scheme: light)";
const NIGHT_MEDIA = "(prefers-color-scheme: dark)";

// Muted background loop with a poster image underneath. Plays only while in
// view and never when the visitor prefers reduced motion. With `night`, the
// browser picks day or night files by system setting and loads only that pair.
export default function LoopVideoBackground({
  webm,
  mp4,
  poster,
  night,
  playbackRate = 1,
  className = "",
}: {
  webm: string;
  mp4: string;
  poster: string;
  night?: { webm: string; mp4: string; poster: string };
  playbackRate?: number;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const hasNight = Boolean(night);
  const posterClassName = `pointer-events-none absolute inset-0 object-cover transition-opacity duration-200 ${className} ${
    isVideoPlaying ? "opacity-0" : "opacity-100"
  }`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInViewport = false;
    let isMounted = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const colorScheme = hasNight ? window.matchMedia(NIGHT_MEDIA) : null;

    const attemptPlayback = () => {
      if (reducedMotion.matches) {
        video.pause();
        if (isMounted) setIsVideoPlaying(false);
        return;
      }
      if (!video.paused) return;

      video.muted = true;
      const playPromise = video.play();
      playPromise?.catch(() => {
        if (isMounted) setIsVideoPlaying(false);
      });
    };

    // The default rate survives load(), which resets playbackRate.
    video.defaultPlaybackRate = playbackRate;
    video.playbackRate = playbackRate;

    const observer = new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      if (isInViewport) {
        attemptPlayback();
      } else {
        video.pause();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isInViewport) {
        attemptPlayback();
      }
    };

    const handleMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        video.pause();
        if (isMounted) setIsVideoPlaying(false);
      } else if (isInViewport && document.visibilityState === "visible") {
        attemptPlayback();
      }
    };

    // A loaded video keeps its source, so a system theme change needs a reload.
    const handleColorSchemeChange = () => {
      video.load();
      if (isInViewport && document.visibilityState === "visible") {
        attemptPlayback();
      }
    };

    observer.observe(video);
    const bounds = video.getBoundingClientRect();
    isInViewport = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (isInViewport) attemptPlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
    colorScheme?.addEventListener("change", handleColorSchemeChange);

    return () => {
      isMounted = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
      colorScheme?.removeEventListener("change", handleColorSchemeChange);
    };
  }, [playbackRate, hasNight]);

  return (
    <>
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setIsVideoPlaying(true)}
        onTimeUpdate={(event) => {
          if (!event.currentTarget.paused) setIsVideoPlaying(true);
        }}
        onPause={() => setIsVideoPlaying(false)}
        onWaiting={() => setIsVideoPlaying(false)}
        // Kein onSuspend/onStalled: Safari meldet suspend, sobald das Video fertig geladen ist,
        // und spielt dabei weiter. Das Standbild läge dann über dem laufenden Video.
        onEmptied={() => setIsVideoPlaying(false)}
        onError={() => setIsVideoPlaying(false)}
        className={`pointer-events-none absolute inset-0 w-full h-full object-cover ${className}`}
        poster={night ? undefined : poster}
      >
        {/* Day first: browsers that ignore media on source take the day video. */}
        <source src={webm} type="video/webm" media={night && DAY_MEDIA} />
        <source src={mp4} type="video/mp4" media={night && DAY_MEDIA} />
        {night && (
          <>
            <source src={night.webm} type="video/webm" media={NIGHT_MEDIA} />
            <source src={night.mp4} type="video/mp4" media={NIGHT_MEDIA} />
          </>
        )}
      </video>

      {night ? (
        <ThemedPoster
          day={poster}
          night={night.poster}
          className={posterClassName}
        />
      ) : (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
          className={posterClassName}
        />
      )}
    </>
  );
}

function ThemedPoster({
  day,
  night,
  className,
}: {
  day: string;
  night: string;
  className: string;
}) {
  const common = { alt: "", fill: true, priority: true, sizes: "100vw" };
  const { props: nightProps } = getImageProps({ ...common, src: night });
  const { props: dayProps } = getImageProps({ ...common, src: day });

  return (
    <picture>
      <source media={NIGHT_MEDIA} srcSet={nightProps.srcSet ?? nightProps.src} />
      <source media={DAY_MEDIA} srcSet={dayProps.srcSet ?? dayProps.src} />
      <img {...dayProps} alt="" aria-hidden="true" className={className} />
    </picture>
  );
}
