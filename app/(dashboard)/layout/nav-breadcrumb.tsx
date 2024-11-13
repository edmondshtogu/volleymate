'use client';

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
        <BreadcrumbItem key="separator-0">
          <BreadcrumbLink asChild key="item-0">
            <Link href="/">VolleyMate</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pages.map((page, index) => (
          <>
            <BreadcrumbSeparator key={`separator-${index + 1}`} />
            <BreadcrumbItem key={`item-${index + 1}`}>
              <BreadcrumbPage>
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
