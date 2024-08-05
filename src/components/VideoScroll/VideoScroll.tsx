import { useEffect, useRef, useState } from "react";
import s from "./VideoScroll.module.scss";
import React from "react";

export interface VideoContainerProps {
  videoSrc: string;
  playbackConst?: number;
  width?: string;
  height?: string;
  containerClass?: string;
  videoClass?: string;
}

export const VideoScroll: React.FC<VideoContainerProps> = ({
  videoSrc,
  playbackConst = 1000, // Default value
  containerClass = "",
  videoClass = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;

    if (!video || !root) return;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        requestAnimationFrame(updateVideoTime);
      }
    };

    const updateVideoTime = () => {
      if (video) {
        const frameNumber = window.scrollY / playbackConst;
        video.currentTime = Math.min(videoDuration, frameNumber);
        setIsScrolling(false);
      }
    };

    const onLoadedMetadata = () => {
      if (video && root) {
        setVideoDuration(video.duration);
        root.style.height = `${video.duration * playbackConst}px`;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", handleScroll);
          handleScroll(); // Initial call to sync video time with scroll position
        } else {
          window.removeEventListener("scroll", handleScroll);
        }
      });
    });

    observer.observe(root);

    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      observer.unobserve(root);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [videoDuration, isScrolling]);

  return (
    <div ref={rootRef} className={`${s.root} ${containerClass}`}>
      <video
        ref={videoRef}
        className={`${s.video} ${videoClass}`}
        src={videoSrc}
        preload="auto"
      />
    </div>
  );
};
