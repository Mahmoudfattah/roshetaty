import { NextRequest, NextResponse } from "next/server";

const ONBOARDING_COOKIE = "roshetaty-onboarding";

export function proxy(request: NextRequest) {
  const completed =
    request.cookies.get(ONBOARDING_COOKIE)?.value === "true";
  const destination = completed ? "/home" : "/onboarding";

  return NextResponse.redirect(new URL(destination, request.url));
}

export const config = {
  matcher: "/",
};