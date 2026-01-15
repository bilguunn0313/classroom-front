// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value;
//   const { pathname } = request.nextUrl;

//   // ✅ API route-уудыг алгасна
//   if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }

//   if (!token && pathname !== "/login") {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (token && pathname === "/login") {
//     return NextResponse.redirect(new URL("/course", request.url));
//   }
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Skip middleware for API routes and auth endpoints
  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // ✅ Public routes that don't need authentication
  const publicPaths = ["/login", "/", "/course"];

  if (publicPaths.includes(pathname) || pathname.startsWith("/course/")) {
    return NextResponse.next();
  }

  // For protected routes like /my-courses, we can't check localStorage in middleware
  // So we let it through and let the client-side ProtectedRoute component handle it
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
