"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { ChevronRight, ChevronLeft, ArrowUpRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AOS from "aos"
import "aos/dist/aos.css"
import { getWorkshops, getSectionTitle, DEFAULT_SECTION_TITLE } from "@/service/registrationService"
import type { Workshop } from "@/types/workshop-types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getMediaUrl } from "@/utils/mediaUrl"

// Custom Sun Icon component (placeholder)
const SunIcon = ({ size, src }: { size: number; src: string }) => (
  <div className={`w-${size} h-${size}`}>
    <Image src={src || "/placeholder.svg"} alt="Sun decoration" width={size} height={size} />
  </div>
)

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SECTION_TITLE)
  const router = useRouter()

  // Calculate how many cards to show based on screen size
  const getCardsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3 // Desktop: 3 cards
      if (window.innerWidth >= 768) return 2 // Tablet: 2 cards
      return 1 // Mobile: 1 card
    }
    return 3
  }

  const [cardsPerView, setCardsPerView] = useState(3)
  const lastCardsPerView = useRef(cardsPerView)
  const [isResizing, setIsResizing] = useState(false)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, workshops.length - cardsPerView)
      return prevIndex >= maxIndex ? 0 : prevIndex + 1
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, workshops.length - cardsPerView)
      return prevIndex <= 0 ? maxIndex : prevIndex - 1
    })
  }

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: true,
    })

    // Handle responsive cards per view
    const handleResize = () => {
      const newCardsPerView = getCardsPerView()
      if (newCardsPerView !== lastCardsPerView.current) {
        setIsResizing(true)
        setTimeout(() => setIsResizing(false), 400) // duration matches animation
        lastCardsPerView.current = newCardsPerView
      }
      setCardsPerView(newCardsPerView)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Fetch workshops from API
    const fetchWorkshops = async () => {
      setIsLoading(true)
      try {
        const response = await getWorkshops()
        if (response.success && response.data) {
          setWorkshops(response.data)
        } else {
          // Workshop API error handled silently
        }
      } catch (err) {
        // Failed to fetch workshops handled silently
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkshops()

    getSectionTitle().then((res) => {
      if (res.data) setSectionTitle(res.data)
    })

    // Timeout fallback: if still loading after 5s, stop loading
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(loadingTimeout)
    }
  }, [])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-gray-200 border-4 border-gray-300 animate-pulse h-[420px] rounded-2xl w-full max-w-xs mx-auto" />
  )

  useEffect(() => {
    AOS.refresh();
  }, [currentIndex, cardsPerView]);

  // Refresh AOS when cardsPerView changes (for screen resize)
  useEffect(() => {
    AOS.refresh();
  }, [cardsPerView]);

  // Clamp currentIndex when cardsPerView or workshops.length changes
  useEffect(() => {
    const maxIndex = Math.max(0, workshops.length - cardsPerView)
    setCurrentIndex((prevIndex) => Math.min(prevIndex, maxIndex))
  }, [cardsPerView, workshops.length])

  // Clicking an image opens the Children's Corner sub page
  const handleWorkshopClick = () => {
    router.push("/workshops")
  }

  return (
    <main className="min-h-screen bg-[#fdf8f0] relative overflow-hidden">
      {/* Decorative Diamond Elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Corner diamonds */}
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-4 left-4 opacity-50 hidden sm:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-4 right-4 opacity-50 hidden sm:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute bottom-4 left-4 opacity-50 hidden sm:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute bottom-4 right-4 opacity-50 hidden sm:block"
        />

        {/* Side diamonds */}
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-1/2 left-4 -translate-y-1/2 opacity-50 hidden md:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-1/2 right-4 -translate-y-1/2 opacity-50 hidden md:block"
        />

        {/* Additional diamonds for larger screens */}
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-1/4 left-[10%] opacity-50 hidden lg:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute top-1/4 right-[10%] opacity-50 hidden lg:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute bottom-1/4 left-[10%] opacity-50 hidden lg:block"
        />
        <Image
          src="/dimond-white.png"
          alt=""
          width={100}
          height={100}
          className="absolute bottom-1/4 right-[10%] opacity-50 hidden lg:block"
        />
      </div>

      {/* Decorative Sun Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div data-aos="fade-right" data-aos-delay="400" className="absolute top-24 left-12 hidden md:block">
          <SunIcon size={60} src="/sungif.gif" />
        </div>
        <div data-aos="fade-left" data-aos-delay="500" className="absolute top-24 right-12 hidden md:block">
          <SunIcon size={60} src="/sungif.gif" />
        </div>
        <div data-aos="fade-up" data-aos-delay="600" className="absolute bottom-24 left-12 hidden md:block">
          <SunIcon size={60} src="/sungif.gif" />
        </div>
        <div data-aos="fade-up" data-aos-delay="700" className="absolute bottom-24 right-12 hidden md:block">
          <SunIcon size={60} src="/sungif.gif" />
        </div>
        <div
          data-aos="zoom-in"
          data-aos-delay="800"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        >
          <SunIcon size={40} src="/sungif.gif" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
              <div className="text-center mb-16">
                <div data-aos="fade-up" data-aos-delay="0" data-aos-duration="1200" className="flex justify-center items-center gap-4 mb-6">
                  <div className="h-0.5 w-52 bg-gradient-to-r from-transparent to-[#e67e22]" />
                  <h1 className="text-[#6A1B1A] text-3xl md:text-5xl font-dm-serif italic font-bold">
                    "BEYOND MYTHS AND <br /> MOUNTAINS"
                  </h1>
                  <div className="h-0.5 w-52 bg-gradient-to-l from-transparent to-[#e67e22]" />
                </div>
      
                <div data-aos="fade-up" data-aos-delay="200" data-aos-duration="1200" className="relative mt-30">
                  <Image
                    src="/images/circles.png"
                    alt="Decorative circles"
                    width={250}
                    height={250}
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30"
                  />
                  <div className="relative z-10">
                    <h2 className="text-[#4F8049] text-xl md:text-2xl uppercase tracking-wider mb-2 font-dm-serif">
                      ARUNACHAL LITERATURE FESTIVAL
                    </h2>
                    <h3 className="text-[#4F8049] text-2xl md:text-4xl uppercase font-semibold tracking-wide font-dm-serif">
                      {sectionTitle}
                    </h3>
                  </div>
                </div>
      
                <div data-aos="fade-up" data-aos-delay="400" data-aos-duration="1200" className="mt-8 flex justify-center">
                  <Link href="/workshops" className="group relative flex items-center hover:scale-105 transition-transform duration-300 focus:outline-none">
                    <span className="bg-[#4F8049] text-white px-8 py-3 rounded-full text-lg font-medium">
                      View All
                    </span>
                    <span className="absolute right-0 left-27 translate-x-1/2 bg-[#4F8049] w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:translate-x-6 group-hover:rotate-12">
                      <ArrowUpRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </Link>
                </div>
              </div>

        {/* Workshops Display */}
        <div className="relative mt-16 max-w-7xl mx-auto">
          {workshops.length === 1 ? (
            /* Single Workshop - Centered Display */
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    data-aos="fade-up"
                    data-aos-delay="200"
                  >
                    <div
                      className="bg-white border-4 border-[#FFD76B] hover:border-[#e67e22] p-3 h-[420px] flex items-center justify-center relative overflow-hidden rounded-2xl w-full mx-auto transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                      onClick={handleWorkshopClick}
                      tabIndex={0}
                      role="link"
                      aria-label={`Open ${sectionTitle}`}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleWorkshopClick() }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={getMediaUrl(workshops[0].imageUrl) || "/registration/creative.png"}
                          alt={workshops[0].name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* Multiple Workshops - Carousel Display */
            <div className="flex items-center justify-center">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                disabled={isLoading}
                className={`absolute left-2 md:left-4 lg:-left-16 top-1/2 -translate-y-1/2 z-20 bg-[#e67e22] hover:bg-[#d35400] rounded-full p-3 flex items-center justify-center shadow-lg border-4 border-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:ring-offset-2`}
                aria-label="Previous workshops"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>

              {/* Carousel Container */}
              <div className="overflow-hidden w-full px-12 md:px-16 lg:px-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentIndex}-${cardsPerView}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`grid gap-6 ${
                      cardsPerView === 1
                        ? "grid-cols-1"
                        : cardsPerView === 2
                          ? "grid-cols-2"
                          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {isLoading
                      ? Array.from({ length: cardsPerView }).map((_, idx) => <LoadingSkeleton key={idx} />)
                      : workshops.length === 0
                        ? <div className="col-span-full text-center text-gray-500 text-lg py-12">No workshops available.</div>
                        : workshops.slice(currentIndex, currentIndex + cardsPerView).map((workshop, index) => (
                            <motion.div
                              key={workshop._id ?? `${currentIndex}-${index}`}
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.1,
                                ease: "easeOut",
                              }}
                              className="flex justify-center"
                              data-aos="fade-up"
                              data-aos-delay={100 * index}
                            >
                              <div
                      className="bg-white border-4 border-[#FFD76B] hover:border-[#e67e22] p-3 h-[420px] flex items-center justify-center relative overflow-hidden rounded-2xl w-full max-w-xs mx-auto transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                      onClick={handleWorkshopClick}
                      tabIndex={0}
                      role="link"
                      aria-label={`Open ${sectionTitle}`}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleWorkshopClick() }}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={getMediaUrl(workshop.imageUrl) || "/registration/creative.png"}
                          alt={workshop.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 320px"
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>
                            </motion.div>
                          ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                disabled={isLoading}
                className={`absolute right-2 md:right-4 lg:-right-16 top-1/2 -translate-y-1/2 z-20 bg-[#e67e22] hover:bg-[#d35400] rounded-full p-3 flex items-center justify-center shadow-lg border-4 border-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#e67e22] focus:ring-offset-2`}
                aria-label="Next workshops"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
          )}

          {/* Carousel Indicators - Only show for multiple workshops */}
          {workshops.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2 lg:hidden">
              {workshops.length > 0 &&
                Array.from({
                  length: Math.ceil(Math.max(0, workshops.length - cardsPerView + 1)),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-[#e67e22] scale-125" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
