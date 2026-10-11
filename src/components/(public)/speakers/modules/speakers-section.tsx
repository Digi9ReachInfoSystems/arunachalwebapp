"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getSpeakersGrouped } from "@/service/speaker"
import type { Speaker, SpeakerYearWithSpeakers } from "@/types/speaker-types"
import { getMediaUrl } from "@/utils/mediaUrl"
import { sortByDisplayOrder } from "@/utils/displayOrder"
import SpeakerModal from "./SpeakerModal"

export default function SpeakersGrid() {
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [years, setYears] = useState<SpeakerYearWithSpeakers[]>([])
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const speakersPerPage = 9

  const selectedYear = years.find((y) => y._id === selectedYearId)
  const yearSpeakers = selectedYear?.speakers ?? []
  const totalPages = Math.max(1, Math.ceil(yearSpeakers.length / speakersPerPage))

  useEffect(() => {
    setLoading(true)
    getSpeakersGrouped()
      .then((res) => {
        if (res.success && res.data) {
          const fetchedYears = res.data.years.map((year) => ({
            ...year,
            speakers: sortByDisplayOrder(year.speakers),
          }))
          setYears(fetchedYears)
          setError(null)
          if (fetchedYears.length > 0) {
            const defaultYear =
              fetchedYears.find((y) => y.isActive) ?? fetchedYears[0]
            setSelectedYearId(defaultYear._id)
          }
        } else {
          setError(res.error || "Failed to fetch speakers")
        }
      })
      .catch(() => setError("Failed to fetch speakers"))
      .finally(() => setLoading(false))
  }, [])

  const indexOfLastSpeaker = currentPage * speakersPerPage
  const indexOfFirstSpeaker = indexOfLastSpeaker - speakersPerPage
  const currentSpeakers = yearSpeakers.slice(indexOfFirstSpeaker, indexOfLastSpeaker)

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId)
    setCurrentPage(1)
  }

  const handleSpeakerClick = (speaker: Speaker) => {
    setSelectedSpeaker(speaker)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedSpeaker(null)
  }

  return (
    <div className="min-h-0 md:min-h-screen w-full" style={{ backgroundColor: "#FFFAEE" }}>
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-dm-serif" style={{ color: "#1A3FA9" }}>
            SPEAKERS
          </h1>
        </div>

        {/* Year Tabs */}
        {!loading && years.length > 0 && (
          <div className="flex justify-center mb-8 md:mb-10">
            <div
              className="rounded-lg px-4 sm:px-6 py-4 flex items-center space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide"
              style={{ backgroundColor: "#FFF8ED", minWidth: "280px", maxWidth: "100%" }}
            >
              {years.map((year) => (
                <button
                  key={year._id}
                  onClick={() => handleYearChange(year._id)}
                  className="relative group transition-all duration-200 whitespace-nowrap flex-shrink-0 px-2 md:px-3"
                >
                  <span
                    className={`text-lg font-medium transition-colors duration-200 font-dm-serif ${
                      selectedYearId === year._id
                        ? "text-[#1A3FA9]"
                        : "text-gray-600 group-hover:text-gray-800"
                    }`}
                  >
                    {year.label || year.year}
                  </span>
                  <div
                    className={`absolute -bottom-4 left-0 right-0 rounded-full transition-all duration-300 ${
                      selectedYearId === year._id ? "h-1 bg-[#1A3FA9]" : "h-px bg-gray-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && <div className="text-center text-red-500 mb-8">{error}</div>}

        {/* Empty States */}
        {!loading && !error && years.length === 0 && (
          <div className="text-center text-gray-600 mb-8 font-bilo">No speakers available yet.</div>
        )}
        {!loading && !error && years.length > 0 && yearSpeakers.length === 0 && (
          <div className="text-center text-gray-600 mb-8 font-bilo">No speakers for this year.</div>
        )}

        {/* Speakers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-6 md:mb-8 lg:mb-10 px-2">
          {loading
            ? Array.from({ length: speakersPerPage }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center animate-pulse">
                  <div className="relative">
                    <div
                      className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-orange-200 p-1"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                      }}
                    >
                      <div
                        className="w-full h-full bg-gray-200 p-2 overflow-hidden"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                        }}
                      >
                        <div
                          className="w-full h-full bg-gray-300"
                          style={{
                            clipPath:
                              "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3 md:mt-4 lg:mt-6 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ))
            : currentSpeakers.map((speaker) => (
                <div
                  key={speaker._id}
                  className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleSpeakerClick(speaker)}
                >
                  <div className="relative">
                    <div
                      className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48 bg-orange-400 p-1"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                      }}
                    >
                      <div
                        className="w-full h-full bg-white p-2 overflow-hidden"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                        }}
                      >
                        <div
                          className="w-full h-full relative overflow-hidden"
                          style={{
                            clipPath:
                              "polygon(50% 0%, 80% 10%, 100% 35%, 90% 70%, 80% 90%, 50% 100%, 20% 90%, 10% 70%, 0% 35%, 20% 10%)",
                          }}
                        >
                          <Image
                            src={getMediaUrl(speaker.image_url) || "/images/speaker.png"}
                            alt={speaker.name}
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3 md:mt-4 lg:mt-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1 md:mb-2 font-dm-serif">
                      {speaker.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 font-bilo line-clamp-1 overflow-hidden">
                      {speaker.about}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* Pagination */}
        {!loading && yearSpeakers.length > speakersPerPage && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <SpeakerModal isOpen={isModalOpen} onClose={closeModal} speaker={selectedSpeaker} />
    </div>
  )
}
