"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Muted background loop with a poster image underneath. Plays only while in
// view and never when the visitor prefers reduced motion.
export default function LoopVideoBackground({
  webm,
  mp4,
  poster,
  playbackRate = 1,
  className = "",
}: {
  webm: string;
  mp4: string;
  poster: string;
  playbackRate?: number;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInViewport = false;
    let isMounted = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    observer.observe(video);
    const bounds = video.getBoundingClientRect();
    isInViewport = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (isInViewport) attemptPlayback();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      isMounted = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, [playbackRate]);

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
        onPause={() => setIsVideoPlaying(false)}
        onWaiting={() => setIsVideoPlaying(false)}
        onStalled={() => setIsVideoPlaying(false)}
        onSuspend={() => setIsVideoPlaying(false)}
        onEmptied={() => setIsVideoPlaying(false)}
        onError={() => setIsVideoPlaying(false)}
        className={`pointer-events-none absolute inset-0 w-full h-full object-cover ${className}`}
        poster={poster}
      >
        <source src={webm} type="video/webm" />
        <source src={mp4} type="video/mp4" />
      </video>

      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 object-cover transition-opacity duration-200 ${className} ${
          isVideoPlaying ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  );
}
