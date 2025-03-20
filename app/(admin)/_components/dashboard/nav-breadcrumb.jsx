import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
export default function NavBreadCrumb() {
  return (
    <>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </>
  );
}
