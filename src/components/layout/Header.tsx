"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { GiHamburgerMenu } from "react-icons/gi"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const literaryFont = "font-dm-serif"

type NavChild = { href: string; label: string }
type NavItem = { href?: string; label: string; children?: NavChild[] }

const navLinks: NavItem[] = [
  { href: "/speakers", label: "Speakers" },
  { href: "/schedule", label: "Schedule" },
  { href: "/workshops", label: "Children's Corner" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/archive", label: "Archive" },
  { href: "/blogsContent", label: "Blogs" },
  { href: "/videos", label: "Videos" },
  {
    label: "About",
    children: [
      { href: "/team", label: "ALF Team" },
      { href: "/contactus", label: "Contact Us" },
    ],
  },
]

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLinkClick = () => {
    setIsMenuOpen(false)
    setMobileAboutOpen(false)
  }

  const headerBase = `fixed top-0 left-0 right-0 z-50 w-full px-4 md:px-8 flex items-center justify-between ${literaryFont} transition-all duration-500 bg-[#FFFAEE]/95 backdrop-blur-md`
  const headerHeight = isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"
  const linkStyle = { fontSize: "1.08rem", letterSpacing: "0.01em" } as const

  return (
    <>
      <header
        className={`${headerBase} ${headerHeight}`}
        style={{
          minHeight: isScrolled ? "3.5rem" : "4rem",
          fontSize: "1.1rem",
          letterSpacing: "0.01em",
        }}
      >
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="Arunachal Lit-Fest Logo"
            className="w-auto object-contain h-12 md:h-14 transition-all duration-300 group-hover:scale-105"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center space-x-8 text-base">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setAboutOpen(true)}
                onMouseLeave={() => setAboutOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAboutOpen((open) => !open)}
                  className="relative text-black font-medium py-2 px-1 transition-colors duration-300 inline-flex items-center gap-1"
                  style={linkStyle}
                  aria-expanded={aboutOpen}
                  aria-haspopup="true"
                >
                  {link.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full rounded-full" />
                </button>
                {aboutOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <div className="min-w-[180px] rounded-md border border-amber-200 bg-[#FFFAEE] shadow-lg py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-black hover:bg-amber-50"
                          style={linkStyle}
                          onClick={() => setAboutOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                className="relative text-black font-medium py-2 px-1 transition-colors duration-300 group"
                style={linkStyle}
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            )
          )}
        </nav>

        <div className="lg:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 hover:bg-amber-100/50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all duration-300 rounded-lg"
              >
                <GiHamburgerMenu className="w-7 h-7 text-black transition-all duration-300" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] p-0 border-l border-amber-200/50 backdrop-blur-md"
              style={{ backgroundColor: "#FFFAEE" }}
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              <div className="py-6 h-full">
                <nav className="space-y-1 text-lg h-full">
                  {navLinks.map((link, index) => (
                    <div
                      key={link.label}
                      className={`transform transition-all duration-500 ease-out ${
                        isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                      }`}
                      style={{
                        transitionDelay: isMenuOpen ? `${index * 80}ms` : "0ms",
                      }}
                    >
                      {link.children ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => setMobileAboutOpen((open) => !open)}
                            className="w-full group flex items-center justify-between px-6 py-4 font-medium text-black hover:bg-amber-50/50 border-l-4 border-transparent hover:border-amber-500"
                            style={linkStyle}
                          >
                            {link.label}
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {mobileAboutOpen &&
                            link.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={handleLinkClick}
                                className="block px-10 py-3 text-black hover:bg-amber-50/50"
                                style={linkStyle}
                              >
                                {child.label}
                              </Link>
                            ))}
                        </div>
                      ) : (
                        <Link
                          href={link.href!}
                          onClick={handleLinkClick}
                          className="group flex items-center px-6 py-4 font-medium text-black hover:bg-amber-50/50 transition-all duration-300 relative overflow-hidden border-l-4 border-transparent hover:border-amber-500"
                          style={linkStyle}
                        >
                          <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-200">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className={`transition-all duration-500 ${isScrolled ? "h-14 md:h-16" : "h-16 md:h-20"}`} />
    </>
  )
}

export default Header
