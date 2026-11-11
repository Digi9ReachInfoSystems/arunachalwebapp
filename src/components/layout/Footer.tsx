import Image from "next/image"
import Link from "next/link"
import { Youtube, Instagram, Facebook } from "lucide-react"
import DiamondBackground from "./DiamondBackground"

export default function Footer() {
  return (
    <>
      <footer
        className="bg-[#1A3FA9] text-white py-12 px-4 md:px-6 lg:px-8 relative overflow-hidden font-bilo"
        style={{
          // backgroundImage: "url('/images/Footer.png')",
          // backgroundRepeat: "",
          backgroundSize: "200px", 
        }}
      >
        <DiamondBackground />
        <div className="container mx-auto max-w-7xl">
          {/* Top Section: Logo and Main Heading */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 text-left md:text-left">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/Footerlogo.png"
                alt="Arunachal Lit-Fest Logo"
                width={120} 
                height={50} 
                className="object-contain"
              />
            </div>
            <h2 className="text-lg md:text-3xl lg:text-4xl font-bold font-dm-serif tracking-wide uppercase text-left md:text-center md:flex-1 text-[#FF9900] whitespace-nowrap md:whitespace-normal">
              ARUNACHAL LITERATURE FESTIVAL
            </h2>
            <div className="md:w-[180px] md:h-[90px] hidden md:block" /> {/* Placeholder to balance layout */}
          </div>

          {/* Bottom Section: Navigation, Assistance, Socials, Office Address */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Navigate Section */}
            <div className="col-span-1">
              <h3 className="text-xl font-semibold mb-4 text-[#FF9900] font-dm-serif tracking-wide">Navigate</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/speakers" className="hover:underline">
                    Speakers
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:underline">
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/childrens-corner" className="hover:underline">
                    Children&apos;s Corner
                  </Link>
                </li>
                <li>
                  <Link href="/archive" className="hover:underline">
                    Archive
                  </Link>
                </li>
                <li>
                  <Link href="/blogsContent" className="hover:underline">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/videos" className="hover:underline">
                    Videos
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:underline">
                    ALF Team
                  </Link>
                </li>
                <li>
                  <Link href="/contactus" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Assistance Section */}
            <div className="col-span-1">
              <h3 className="text-xl font-semibold mb-4 text-[#FF9900] font-dm-serif tracking-wide">Assistance</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contactus" className="hover:underline">
                    Contact
                  </Link>
                </li>
                {/* <li>
                  <Link href="/privacy-policy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Socials & Office Address Section - spans both columns on mobile */}
            <div className="col-span-2 md:col-span-2 lg:col-span-1 flex flex-col gap-8">
              {/* Socials Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF9900] font-dm-serif tracking-wide">Socials</h3>
                <div className="flex justify-start space-x-4">
                  <Link href="https://www.youtube.com/@arunachallitfest" aria-label="YouTube" className="hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                    <Youtube className="size-6" />
                  </Link>
                  <Link href="https://www.instagram.com/arunachallitfest?igsh=MTlveWdnb3RxNDRjdA%3D%3D" aria-label="Instagram" className="hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                    <Instagram className="size-6" />
                  </Link>
                  <Link href="https://www.facebook.com/arunachallitfest?rdid=fbPw6C6Nzj5FYgmW&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F19PuTFJVi2%2F#" aria-label="Facebook" className="hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                    <Facebook className="size-6" />
                  </Link>
                </div>
              </div>

              {/* Office Address Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#FF9900] font-dm-serif tracking-wide">Office Address</h3>
                <p className="text-sm leading-relaxed">
                  Directorate of Information and Public Relations (Soochna bhawan), papu nallah, Naharlagun, Arunachal
                  Pradesh Pin - 791110
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="w-full bg-[#1A3FA9] text-center py-3 text-xs md:text-sm text-white border-t border-[#FF9900] font-bilo">
        @2026 Arunachal Literature Festival. All rights reserved.
      </div>
    </>
  )
}
