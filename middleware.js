import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const middleware = async (req) => {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isAuthPage = pathname.startsWith("/auth/login");

  if (req.url.includes("/api/uploadthing")) {
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  const cookieStore = await cookies();

  if (!isAuthPage) {
    cookieStore.set("redirectUrl", pathname);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/uploadthing/:path*"],
};
