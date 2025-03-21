import { BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import Link from "next/link";
export default function NavBreadCrumb() {
  return (
    <>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <Link href="/dashboard">Dashboard</Link>
        </BreadcrumbItem>
      </BreadcrumbList>
    </>
  );
}
