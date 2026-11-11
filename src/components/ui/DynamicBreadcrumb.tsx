"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

function toTitleCase(str: string) {
  // Handle specific cases first
  if (str.toLowerCase() === "contactus") {
    return "Contact Us";
  }
  if (str.toLowerCase() === "team") {
    return "ALF Team";
  }
  if (str.toLowerCase() === "workshops" || str.toLowerCase() === "childrens-corner") {
    return "Children's Corner";
  }
  if (str.toLowerCase() === "blogscontent") {
    return "Blogs Content";
  }
  
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Hide breadcrumb if last segment is likely an ID (number, uuid, or [id])
  const idPattern = /^\d+$|^[0-9a-fA-F-]{24,}$|^\[.*\]$/;
  if (segments.length === 0 || idPattern.test(segments[segments.length - 1])) return null;

  let path = "";

  return (
    <div className="w-full px-4 md:px-8 pt-4 pb-2 bg-[#FFFAEE]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, idx) => {
            path += "/" + segment;
            const isLast = idx === segments.length - 1;
            return (
              <React.Fragment key={`crumb-${idx}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={path}>{toTitleCase(segment)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
} 