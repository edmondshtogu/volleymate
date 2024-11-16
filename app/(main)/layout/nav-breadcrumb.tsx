'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export default function BreadcrumbNav() {
  const pathname = usePathname();

  if (pathname === '/') {
    return (
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem key="separator-0">
            <BreadcrumbPage key="item-0">VolleyMate</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const pages = pathname.split('/').filter((page) => page.trim() !== '');

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {/* Home breadcrumb */}
        <BreadcrumbItem key="separator-0">
          <BreadcrumbLink asChild key="item-0">
            <Link href="/">VolleyMate</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pages.map((page, index) => {
          const isLast = index === pages.length - 1;
          const label = /^\d+$/.test(page)
            ? `#${page}`
            : page.charAt(0).toUpperCase() + page.slice(1);
          const href = `/${pages.slice(0, index + 1).join('/')}`;

          return (
            <React.Fragment key={`breadcrumb-${index}`}>
              <BreadcrumbSeparator key={`separator-${index + 1}`} />
              <BreadcrumbItem key={`item-${index + 1}`}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
