import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  const allowedPath = `/dashboard/${role}`;
  const { pathname } = request.nextUrl;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // যদি already dashboard page এ থাকে, redirect দরকার নেই
  if (pathname.startsWith(allowedPath)) {
    return NextResponse.next();
  }

  // ৩. ভুল ড্যাশবোর্ডে প্রবেশের চেষ্টা করলে সঠিক ড্যাশবোর্ডে পাঠিয়ে দিন
  if (role === "user" || role === "volunteer" || role === "admin") {
    return NextResponse.redirect(new URL(allowedPath, request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: ["/dashboard/:path*"],
};
