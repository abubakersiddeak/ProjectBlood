import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const { pathname } = request.nextUrl;
  // যদি already dashboard page এ থাকে, redirect দরকার নেই
  if (
    pathname === "/dashboard/user" ||
    pathname === "/dashboard/volunteer" ||
    pathname === "/dashboard/admin"
  ) {
    return NextResponse.next();
  }
  switch (session.user.role) {
    case "user":
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    case "volunteer":
      return NextResponse.redirect(
        new URL("/dashboard/volunteer", request.url),
      );
    case "admin":
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    default:
      return NextResponse.redirect(new URL("/", request.url));
  }
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: ["/dashboard/:path*"],
};
