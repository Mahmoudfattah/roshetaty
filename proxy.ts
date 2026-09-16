import { NextRequest, NextResponse } from "next/server";

const ONBOARDING_COOKIE = "roshetaty-onboarding";

export function proxy(request: NextRequest) {
  const completed = request.cookies.get(ONBOARDING_COOKIE)?.value === "true";
  const pathname = request.nextUrl.pathname;

  if (completed && (pathname === "/" || pathname === "/onboarding")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!completed && (pathname === "/" || pathname === "/home")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/onboarding", "/home"],
};
