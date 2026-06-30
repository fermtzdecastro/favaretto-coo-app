import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = "/finanzas";
    return NextResponse.redirect(url);
  }

  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some(c => c.name.includes('sb-') && c.name.includes('-auth-token'));

  if (!hasSession && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/finanzas";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};