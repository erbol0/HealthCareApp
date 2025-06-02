import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  // Public routes that don't require authentication
  const isPublic =
    req.nextUrl.pathname.startsWith("/auth") || req.nextUrl.pathname === "/";

  if (isPublic) {
    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route
  const { userId } = auth();
  if (!userId) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
