import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  if (req.url.includes("/api/uploadthing")) {
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/uploadthing/:path*"],
};
