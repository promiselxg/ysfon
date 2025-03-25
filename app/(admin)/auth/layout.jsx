import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
