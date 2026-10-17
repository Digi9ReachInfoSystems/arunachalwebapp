"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getBanner, getButtonText, getText } from "@/service/homeService"
import { getMediaUrl } from "@/utils/mediaUrl"

function youtubeVideoId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?]{11})/)
  return match?.[1] || ""
}

const YOUTUBE_ORIGIN = "https://www.youtube.com"
const YOUTUBE_PLAYING = 1
const YOUTUBE_PAUSED = 2
// Events that browsers count as a real click/tap for allowing sound
// (pointerdown/touchstart do not count on phones).
const SOUND_GESTURE_EVENTS = ["click", "touchend", "keydown"] as const
// If YouTube has not started playing by then (autoplay blocked, YouTube unreachable), keep the image.
const YOUTUBE_START_TIMEOUT_MS = 10000
// How long the image stays after YouTube starts while the automatic sound attempt settles.
const YOUTUBE_SOUND_SETTLE_MS = 700


export default function HeroSection() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bannerVideoUrl, setBannerVideoUrl] = useState<string | null>(null)
  const [bannerYoutubeUrl, setBannerYoutubeUrl] = useState<string | null>(null)
  const [playVideo, setPlayVideo] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [buttonLink, setButtonLink] = useState<string | null>(null)
  const [bannerText, setBannerText] = useState<string>("")
  const [bannerSubText, setBannerSubText] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [bannerLink, setBannerLink] = useState<string>("")
  // True once the video is actually playing; until then the banner image stays visible.
  const [videoStarted, setVideoStarted] = useState(false)
  const youtubeFrameRef = useRef<HTMLIFrameElement>(null)
  const fileVideoRef = useRef<HTMLVideoElement>(null)
  const videoStartedRef = useRef(false)
  const wantSoundRef = useRef(false)
  const soundConfirmedRef = useRef(false)
  const youtubeReadyRef = useRef(false)
  const youtubeMutedRef = useRef(true)

  useEffect(() => {
    async function fetchBanner() {
      const response = await getBanner()
      if (response.success && response.data) {
        const bannerData = Array.isArray(response.data) ? response.data[0] : response.data
        if (bannerData) {
          setBannerUrl(bannerData.image_url || null)
          setBannerVideoUrl(bannerData.video_url || null)
          setBannerYoutubeUrl(bannerData.youtube_url || null)
          setPlayVideo(false)
          setVideoFailed(false)
          setVideoStarted(false)
          videoStartedRef.current = false
          soundConfirmedRef.current = false
          setImageError(false)
        }
      }
    }
    fetchBanner()
  }, [])

  useEffect(() => {
    async function fetchButton() {
      const response = await getButtonText()
      if (response.success && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setButtonLink(response.data[0].link || null)
        } else if (response.data.link) {
          setButtonLink(response.data.link)
        }
      }
    }
    fetchButton()
  }, [])

  useEffect(() => {
    async function fetchBannerText() {
      const response = await getText()
      if (response.success && response.data) {
        const bannerData = Array.isArray(response.data) ? response.data[0] : response.data
        if (bannerData) {
          setBannerText(bannerData.bannerText || "")
          setBannerSubText(bannerData.bannerSubText || "")
          setLocation(bannerData.location || "")
          setBannerLink(bannerData.link || "")
        }
      }
    }
    fetchBannerText()
  }, [])

  useEffect(() => {
    if (!bannerYoutubeUrl && !bannerVideoUrl) return
    const timer = window.setTimeout(() => setPlayVideo(true), 3000)
    return () => window.clearTimeout(timer)
  }, [bannerYoutubeUrl, bannerVideoUrl])

  const handleImageError = () => {
    setImageError(true)
  }

  const imageSrc =
    !imageError && bannerUrl
      ? (() => {
          const mediaUrl = getMediaUrl(bannerUrl)
          return mediaUrl !== "/placeholder.svg" ? mediaUrl : null
        })()
      : null

  const youtubeId = bannerYoutubeUrl ? youtubeVideoId(bannerYoutubeUrl) : ""
  const fileVideoSrc = bannerVideoUrl
    ? (() => {
        const mediaUrl = getMediaUrl(bannerVideoUrl)
        return mediaUrl !== "/placeholder.svg" ? mediaUrl : null
      })()
    : null
  const showYoutube = playVideo && !videoFailed && Boolean(youtubeId)
  const showFileVideo = playVideo && !videoFailed && !youtubeId && Boolean(fileVideoSrc)
  const videoPlaying = showYoutube || showFileVideo

  const markVideoStarted = () => {
    if (videoStartedRef.current) return
    videoStartedRef.current = true
    setVideoStarted(true)
  }

  const sendYoutubeCommand = (func: string, args: unknown[] = []) => {
    youtubeFrameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      YOUTUBE_ORIGIN
    )
  }

  const unmuteYoutube = () => {
    // Commands sent before the player is ready are lost; the ready handler applies sound instead.
    if (!youtubeReadyRef.current) return
    sendYoutubeCommand("unMute")
    sendYoutubeCommand("setVolume", [100])
    sendYoutubeCommand("playVideo")
  }

  // Must run inside the click/tap handler itself, otherwise browsers block the sound.
  const unmuteFileVideo = () => {
    const video = fileVideoRef.current
    if (!video) return
    video.muted = false
    video
      .play()
      .then(() => {
        soundConfirmedRef.current = true
      })
      .catch(() => {
        video.muted = true
        video.play().catch(() => {})
      })
  }

  // YouTube player: handshake, wait until ready, track playing/muted state, fall back to the image.
  useEffect(() => {
    if (!showYoutube) return
    youtubeReadyRef.current = false
    youtubeMutedRef.current = true

    let playerState = -1
    let autoSoundTried = false
    let revealTimer: number | undefined
    const updateSoundConfirmed = () => {
      if (playerState === YOUTUBE_PLAYING && !youtubeMutedRef.current) soundConfirmedRef.current = true
    }

    const handlePlayerState = (state: number) => {
      if (state === playerState) return
      playerState = state
      if (state === YOUTUBE_PLAYING) {
        updateSoundConfirmed()
        // Try sound once by itself as soon as the video plays; if the browser refuses, the pause
        // handler below resumes it muted and clicks/taps retry. The image stays a moment longer
        // so that brief refused-pause is not visible.
        if (!autoSoundTried && wantSoundRef.current && !soundConfirmedRef.current) {
          autoSoundTried = true
          unmuteYoutube()
          revealTimer = window.setTimeout(markVideoStarted, YOUTUBE_SOUND_SETTLE_MS)
        } else {
          markVideoStarted()
        }
      } else if (state === YOUTUBE_PAUSED) {
        // Nothing on the page pauses the banner, so a pause means the browser refused the sound:
        // keep the video going muted and try sound again on the next click/tap.
        soundConfirmedRef.current = false
        sendYoutubeCommand("mute")
        sendYoutubeCommand("playVideo")
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN || event.source !== youtubeFrameRef.current?.contentWindow) return
      let data: { event?: string; info?: unknown }
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data
      } catch {
        return
      }
      if (!data || typeof data !== "object") return

      if (!youtubeReadyRef.current) {
        youtubeReadyRef.current = true
        sendYoutubeCommand("addEventListener", ["onStateChange"])
        // Captions get cut off when the video is cropped to fill the banner, so keep them off.
        sendYoutubeCommand("unloadModule", ["captions"])
        sendYoutubeCommand("unloadModule", ["cc"])
        // Sound is only requested once the video is playing: unmuting before that makes
        // YouTube refuse to autoplay at all.
      }

      const info = data.info
      if (data.event === "onStateChange" && typeof info === "number") {
        handlePlayerState(info)
      } else if (info && typeof info === "object") {
        const details = info as { muted?: unknown; playerState?: unknown }
        if (typeof details.playerState === "number") handlePlayerState(details.playerState)
        if (typeof details.muted === "boolean") {
          youtubeMutedRef.current = details.muted
          updateSoundConfirmed()
        }
      }
    }

    window.addEventListener("message", onMessage)
    // Keep announcing until the player answers, the same way YouTube's own API connects.
    const handshake = window.setInterval(() => {
      if (youtubeReadyRef.current) return window.clearInterval(handshake)
      youtubeFrameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
        YOUTUBE_ORIGIN
      )
    }, 250)
    const fallback = window.setTimeout(() => {
      if (!videoStartedRef.current) setVideoFailed(true)
    }, YOUTUBE_START_TIMEOUT_MS)

    return () => {
      window.removeEventListener("message", onMessage)
      window.clearInterval(handshake)
      window.clearTimeout(fallback)
      window.clearTimeout(revealTimer)
    }
  }, [showYoutube])

  // Uploaded video: try with sound first (some browsers allow it), otherwise play muted.
  useEffect(() => {
    const video = fileVideoRef.current
    if (!showFileVideo || !video) return
    video.muted = false
    video
      .play()
      .then(() => {
        soundConfirmedRef.current = true
      })
      .catch(() => {
        video.muted = true
        video.play().catch(() => setVideoFailed(true))
      })
  }, [showFileVideo])

  // Always try sound as soon as the video plays (works wherever the browser allows it). If the
  // browser refuses, the video keeps playing muted and every click/tap/key press retries until
  // sound is actually playing.
  useEffect(() => {
    if (!videoPlaying) return
    wantSoundRef.current = true
    const onGesture = () => {
      if (soundConfirmedRef.current) return
      wantSoundRef.current = true
      if (showFileVideo) unmuteFileVideo()
      else unmuteYoutube()
    }
    SOUND_GESTURE_EVENTS.forEach((name) => window.addEventListener(name, onGesture, true))
    return () => SOUND_GESTURE_EVENTS.forEach((name) => window.removeEventListener(name, onGesture, true))
  }, [videoPlaying, showFileVideo])

  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen w-full flex items-center justify-center text-center overflow-hidden">
      {imageSrc && !(videoPlaying && videoStarted) && (
        <Image
          src={imageSrc}
          alt="Arunachal Literature Festival Background"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            zIndex: -1,
          }}
          onError={handleImageError}
          priority
        />
      )}
      {showYoutube && (
        // pointer-events-none: taps go to the page (so they can turn sound on) instead of pausing YouTube.
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ zIndex: -1, opacity: videoStarted ? 1 : 0 }}
        >
          <iframe
            ref={youtubeFrameRef}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&cc_load_policy=0&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title="Banner video"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      {showFileVideo && fileVideoSrc && (
        <video
          ref={fileVideoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: -1, opacity: videoStarted ? 1 : 0 }}
          src={fileVideoSrc}
          muted
          playsInline
          loop
          preload="auto"
          onPlaying={markVideoStarted}
          onError={() => setVideoFailed(true)}
        />
      )}


      {/* Content — only show fields provided by API (no hardcoded fallbacks) */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 space-y-4 sm:space-y-6 text-[#6A1B1A] animate-fade-in pb-8 lg:pb-12 xl:pb-40">
        {bannerText.trim() && (
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight font-serif mb-4 sm:mb-6 animate-slide-up ">
            {bannerText.split(' ').map((word, index) => (
              <span key={index}>
                {word}
                {index < bannerText.split(' ').length - 1 && ' '}
                {index === Math.floor(bannerText.split(' ').length / 2) - 1 && <br />}
              </span>
            ))}
          </h1>
        )}

        {(bannerSubText.trim() || location.trim()) && (
          <div className="flex flex-col items-center mt-12 sm:mt-20 space-y-2 text-sm sm:text-base md:text-xl text-white animate-slide-up-delay">
            {bannerSubText.trim() && (
              <div>
                <span className="text-white">{bannerSubText}</span>
              </div>
            )}
            {location.trim() && (
              <div>
                {bannerLink ? (
                  <Link
                    href={bannerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 transition-colors duration-300 cursor-pointer"
                  >
                    {location}
                  </Link>
                ) : (
                  <span className="text-white">{location}</span>
                )}
              </div>
            )}
          </div>
        )}

        {buttonLink && (
          <div className="mt-6 sm:mt-8 animate-slide-up-button">
            <Link
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <div className="relative w-[160px] h-[48px] sm:w-[180px] sm:h-[54px] md:w-[250px] md:h-[75px] lg:w-[300px] lg:h-[100px]">
                <Image src="/homefree.png" alt="Free Entry Button" fill style={{ objectFit: "contain" }} sizes="(max-width: 768px) 200px, 300px" />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpDelay {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }

        .animate-slide-up-delay {
          animation: slideUpDelay 0.8s ease-out 0.3s both;
        }

        .animate-slide-up-button {
          animation: slideUp 1s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
        }
      `}</style>
    </section>
  )
}
