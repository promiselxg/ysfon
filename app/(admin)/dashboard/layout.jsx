import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Separator } from "@/components/ui/separator";

import { AppSidebar } from "../_components/dashboard/app-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import NavBreadCrumb from "../_components/dashboard/nav-breadcrumb";
import SessionProvider from "@/providers/sessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { ImageProvider } from "@/context/imageUpload.context";

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <ImageProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <NavBreadCrumb />
                </Breadcrumb>
              </div>
            </header>
            {children}
            <Toaster richColors />
          </SidebarInset>
        </SidebarProvider>
      </ImageProvider>
    </SessionProvider>
  );
}
