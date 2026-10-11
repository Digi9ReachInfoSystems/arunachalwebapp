"use client"
import Image from "next/image"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/navigation"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSpeakersGrouped } from "@/service/speaker"
import { getMediaUrl } from "@/utils/mediaUrl"
import { sortByDisplayOrder } from "@/utils/displayOrder"
import type { Speaker, SpeakerYearWithSpeakers } from "@/types/speaker-types"

export default function Speakers() {
  const router = useRouter()
  const [latestYear, setLatestYear] = useState<SpeakerYearWithSpeakers | null>(null)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const navigationPrevRef = useRef<HTMLButtonElement>(null)
  const navigationNextRef = useRef<HTMLButtonElement>(null)

  const handleSpeakerClick = () => {
    router.push("/speakers")
  }

  useEffect(() => {
    async function fetchSpeakers() {
      setLoading(true)
      setError(null)
      try {
        const res = await getSpeakersGrouped()
        if (res.success && res.data) {
          const fetchedYears = res.data.years
          // Home: only latest year tab + those speakers
          const year =
            [...fetchedYears].sort((a, b) => b.year - a.year)[0] ?? fetchedYears[0] ?? null
          setLatestYear(year)
          setSpeakers(sortByDisplayOrder(year?.speakers ?? []))
        } else {
          setError(res.error || "Failed to fetch speakers.")
        }
      } catch {
        setError("Failed to fetch speakers.")
      } finally {
        setLoading(false)
      }
    }
    fetchSpeakers()
  }, [])

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF8E7] to-[#FFFAEE]">
        <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#E67E22] text-white px-6 py-2 rounded-full hover:bg-[#d35400] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-0 md:min-h-[70vh] bg-gradient-to-b from-[#FFF8E7] via-[#FFFAEE] to-[#FFF8E7] relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 opacity-20">
        <Image src="/schedule/diamond-pattern.png" alt="" fill className="object-contain" sizes="128px" />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-20">
        <Image src="/schedule/diamond-pattern.png" alt="" fill className="object-contain" sizes="128px" />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 opacity-20">
        <Image src="/schedule/diamond-pattern.png" alt="" fill className="object-contain" sizes="128px" />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-20">
        <Image src="/schedule/diamond-pattern.png" alt="" fill className="object-contain" sizes="128px" />
      </div>

      <div className="container mx-auto py-10 md:py-16 px-4 relative z-10">
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-[#E67E22] text-2xl md:text-4xl uppercase font-semibold tracking-wide font-dm-serif">
            SPEAKERS
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#5c4a3a]/80 font-bilo max-w-md mx-auto">
            Voices shaping the Arunachal Literature Festival
          </p>
        </header>

        {/* Only latest year tab */}
        {!loading && latestYear && (
          <div className="flex justify-center mb-8 md:mb-10">
            <div className="rounded-full bg-white/80 border border-[#E67E22]/20 shadow-sm px-3 sm:px-5 py-2.5">
              <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-full text-sm md:text-base font-dm-serif bg-[#E67E22] text-white shadow-md">
                {latestYear.label || latestYear.year}
              </span>
            </div>
          </div>
        )}

        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[320px]">
              <div className="flex space-x-2">
                <span className="w-3 h-3 bg-[#F5C518] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-3 h-3 bg-[#E67E22] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-3 h-3 bg-[#F5C518] rounded-full animate-bounce" />
              </div>
              <div className="mt-4 text-lg text-[#E67E22] font-semibold font-bilo">Loading speakers...</div>
            </div>
          ) : speakers.length === 0 ? (
            <div className="text-center text-[#5c4a3a]/70 py-16 font-bilo">
              No speakers available yet.
            </div>
          ) : (
            <div className="relative max-w-5xl mx-auto px-12 md:px-16">
              <button
                ref={navigationPrevRef}
                className="absolute left-0 top-1/2 z-20 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-[#E67E22] shadow-lg border border-[#E67E22]/25 hover:bg-[#E67E22] hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="Previous speaker"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* overflow-hidden clips so only 3 cards show — no 4th/5th peeking */}
              <div className="overflow-hidden">
                <Swiper
                  key={speakers.map((s) => s._id).join("-") || "speakers"}
                  modules={[Navigation, Autoplay]}
                  slidesPerView={1}
                  spaceBetween={16}
                  centeredSlides={false}
                  loop={speakers.length > 3}
                  watchOverflow
                  autoplay={
                    speakers.length > 1
                      ? {
                          delay: 4500,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }
                      : false
                  }
                  breakpoints={{
                    768: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 24,
                    },
                  }}
                  navigation={{
                    prevEl: navigationPrevRef.current,
                    nextEl: navigationNextRef.current,
                  }}
                  onBeforeInit={(swiper: SwiperType) => {
                    const nav = swiper.params.navigation
                    if (nav && typeof nav !== "boolean") {
                      nav.prevEl = navigationPrevRef.current
                      nav.nextEl = navigationNextRef.current
                    }
                  }}
                  onSwiper={(swiper) => {
                    setActiveIndex(swiper.realIndex)
                    const spv = swiper.params.slidesPerView
                    setSlidesPerView(typeof spv === "number" ? spv : 1)
                  }}
                  onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                  onResize={(swiper) => {
                    const spv = swiper.params.slidesPerView
                    setSlidesPerView(typeof spv === "number" ? spv : 1)
                  }}
                  className="speaker-home-carousel py-2"
                >
                  {speakers.map((speaker, index) => {
                    // With 3 visible, highlight the middle card; with 1, highlight the only card
                    const centerOffset = slidesPerView >= 3 ? 1 : 0
                    const centerIndex =
                      speakers.length === 0
                        ? 0
                        : (activeIndex + centerOffset) % speakers.length
                    const isCenter = index === centerIndex

                    return (
                      <SwiperSlide key={speaker._id || index} className="!h-auto">
                        <div
                          className={`relative w-full transition-all duration-400 cursor-pointer ${
                            isCenter ? "scale-100 opacity-100" : "scale-[0.94] opacity-70"
                          }`}
                          onClick={handleSpeakerClick}
                        >
                          <div
                            className={`relative rounded-2xl overflow-hidden bg-white border-2 transition-all duration-400 ${
                              isCenter
                                ? "border-[#E67E22] shadow-[0_12px_40px_rgba(230,126,34,0.28)]"
                                : "border-[#E67E22]/20 shadow-md"
                            }`}
                          >
                            <div className="relative aspect-[3/4] w-full">
                              <Image
                                key={speaker.image_url}
                                src={getMediaUrl(speaker.image_url) || "/placeholder.svg?height=400&width=300"}
                                alt={speaker.name || "Speaker"}
                                fill
                                className="object-cover"
                                priority={index < 3}
                                sizes="(max-width: 768px) 90vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/25 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="font-semibold text-base md:text-lg leading-tight font-dm-serif mb-1">
                                  {speaker.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-white/85 line-clamp-2 font-bilo leading-snug">
                                  {speaker.about}
                                </p>
                                {isCenter && (
                                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#FFF8E7] bg-[#E67E22] px-2.5 py-1 rounded-full">
                                    View all
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    )
                  })}
                </Swiper>
              </div>

              <button
                ref={navigationNextRef}
                className="absolute right-0 top-1/2 z-20 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-[#E67E22] shadow-lg border border-[#E67E22]/25 hover:bg-[#E67E22] hover:text-white transition-all duration-300 flex items-center justify-center"
                aria-label="Next speaker"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
