import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/investigations/orders") {
    const url = request.nextUrl.clone();
    url.pathname = "/investigations/orders-editable";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/investigations/orders"],
};
