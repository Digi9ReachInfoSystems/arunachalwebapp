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

// Browsers only allow sound after the visitor has clicked, tapped or pressed a key on the page.
function pageHasUserActivation() {
  if (typeof navigator === "undefined") return false
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  return Boolean(activation?.hasBeenActive)
}

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
  const [soundOn, setSoundOn] = useState(false)
  const youtubeFrameRef = useRef<HTMLIFrameElement>(null)
  const fileVideoRef = useRef<HTMLVideoElement>(null)

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

  // Turn sound on when the video starts if the browser already allows it,
  // otherwise on the visitor's first click, tap or key press.
  useEffect(() => {
    if (!videoPlaying) return
    if (pageHasUserActivation()) {
      setSoundOn(true)
      return
    }
    const enableSound = () => setSoundOn(true)
    const events = ["pointerdown", "keydown", "touchstart"] as const
    events.forEach((name) => window.addEventListener(name, enableSound, { once: true }))
    return () => events.forEach((name) => window.removeEventListener(name, enableSound))
  }, [videoPlaying])

  const sendYoutubeCommand = (func: string, args: unknown[] = []) => {
    youtubeFrameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube.com"
    )
  }

  const applyYoutubeSound = () => {
    // Captions get cut off when the video is cropped to fill the banner, so keep them off.
    sendYoutubeCommand("unloadModule", ["captions"])
    sendYoutubeCommand("unloadModule", ["cc"])
    if (soundOn) {
      sendYoutubeCommand("unMute")
      sendYoutubeCommand("setVolume", [100])
      sendYoutubeCommand("playVideo")
    } else {
      sendYoutubeCommand("mute")
    }
  }

  useEffect(() => {
    if (!showYoutube) return
    applyYoutubeSound()
    // The player may still be starting up; repeat once so the command is not lost.
    const retry = window.setTimeout(applyYoutubeSound, 1000)
    return () => window.clearTimeout(retry)
  }, [showYoutube, soundOn])

  useEffect(() => {
    const video = fileVideoRef.current
    if (!showFileVideo || !video) return
    video.muted = !soundOn
    video.play().catch(() => {
      // Sound was blocked by the browser: keep playing muted, then unmute on the next interaction.
      video.muted = true
      video.play().catch(() => setVideoFailed(true))
      const unmute = () => {
        video.muted = false
      }
      ;["pointerdown", "keydown", "touchstart"].forEach((name) =>
        window.addEventListener(name, unmute, { once: true })
      )
    })
  }, [showFileVideo, soundOn])

  return (
    <section className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen w-full flex items-center justify-center text-center overflow-hidden">
      {imageSrc && !showYoutube && !showFileVideo && (
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
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: -1 }}>
          <iframe
            ref={youtubeFrameRef}
            className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${youtubeId}&controls=0&rel=0&cc_load_policy=0&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title="Banner video"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={applyYoutubeSound}
          />
        </div>
      )}
      {showFileVideo && fileVideoSrc && (
        <video
          ref={fileVideoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: -1 }}
          src={fileVideoSrc}
          muted
          playsInline
          loop
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
