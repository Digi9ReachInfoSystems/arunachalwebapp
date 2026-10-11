"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import SunIcon from "@/components/(public)/archive/sun-icon"
import { getTeamMemberById, getTeamMembers } from "@/service/teamService"
import type { TeamMember } from "@/types/team-types"
import { getMediaUrl } from "@/utils/mediaUrl"
import { sortByDisplayOrder } from "@/utils/displayOrder"
import TeamMemberModal from "./team-member-modal"

export default function AlfTeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const lastCardsPerView = useRef(3)

  const getCardsPerView = () => {
    if (typeof window === "undefined") return 3
    if (window.innerWidth >= 1024) return 3
    if (window.innerWidth >= 768) return 2
    return 1
  }

  useEffect(() => {
    const handleResize = () => {
      const next = getCardsPerView()
      if (next !== lastCardsPerView.current) {
        lastCardsPerView.current = next
        setCurrentIndex(0)
      }
      setCardsPerView(next)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    getTeamMembers()
      .then((res) => {
        if (res.success && res.data) setMembers(sortByDisplayOrder(res.data))
      })
      .finally(() => setLoading(false))
  }, [])

  const maxIndex = Math.max(0, members.length - cardsPerView)
  const visible = members.slice(currentIndex, currentIndex + cardsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleMemberClick = async (member: TeamMember) => {
    setIsModalOpen(true)
    setSelectedMember(null)
    setDetailLoading(true)

    const response = await getTeamMemberById(member._id)
    if (response.success && response.data) {
      setSelectedMember(response.data)
    } else {
      setSelectedMember(member)
    }
    setDetailLoading(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMember(null)
  }

  return (
    <section className="relative min-h-0 md:min-h-screen w-full overflow-hidden" style={{ backgroundColor: "#FFFAEE" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 hidden md:block">
          <SunIcon size={48} src="/sungif.gif" />
        </div>
        <div className="absolute top-8 right-8 hidden md:block">
          <SunIcon size={48} src="/sungif.gif" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
        <h1 className="text-center text-3xl md:text-5xl font-bold font-dm-serif tracking-wide mb-10 md:mb-14" style={{ color: "#1A3FA9" }}>
          ALF Team
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Array.from({ length: cardsPerView }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="w-full aspect-[3/4] bg-white border border-gray-200" />
                <div className="h-6 w-40 bg-blue-100 mt-4 rounded" />
                <div className="h-4 w-28 bg-gray-200 mt-2 rounded" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-600 font-bilo">No team members yet.</p>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            {members.length > cardsPerView && (
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-0 md:-left-6 lg:-left-14 top-1/3 z-20 bg-[#FF9900] hover:bg-[#E68A00] w-10 h-10 flex items-center justify-center shadow-md transition-colors"
                aria-label="Previous team members"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
            )}

            <div
              className={`grid gap-8 px-12 md:px-8 ${
                cardsPerView === 1 ? "grid-cols-1" : cardsPerView === 2 ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              {visible.map((member) => (
                <article
                  key={member._id}
                  className="flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => handleMemberClick(member)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleMemberClick(member)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${member.title}`}
                >
                  <div className="w-full aspect-[3/4] bg-white border border-gray-300 overflow-hidden">
                    {member.image_url ? (
                      <Image
                        src={getMediaUrl(member.image_url)}
                        alt={member.title}
                        width={400}
                        height={520}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                  <h2 className="mt-4 text-lg md:text-xl font-bold font-dm-serif" style={{ color: "#1A3FA9" }}>
                    {member.title}
                  </h2>
                  {member.designation && (
                    <p className="mt-1 text-sm md:text-base text-black font-bilo">{member.designation}</p>
                  )}
                </article>
              ))}
            </div>

            {members.length > cardsPerView && (
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-0 md:-right-6 lg:-right-14 top-1/3 z-20 bg-[#FF9900] hover:bg-[#E68A00] w-10 h-10 flex items-center justify-center shadow-md transition-colors"
                aria-label="Next team members"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={closeModal}
        member={selectedMember}
        loading={detailLoading}
      />
    </section>
  )
}
