import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
