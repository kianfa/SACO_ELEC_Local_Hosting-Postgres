import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
export function proxy(request:NextRequest){const {pathname}=request.nextUrl;if(!pathname.startsWith("/admin")||pathname.startsWith("/admin/login"))return NextResponse.next();if(!getSessionCookie(request)){const url=request.nextUrl.clone();url.pathname="/admin/login";url.searchParams.set("next",pathname);return NextResponse.redirect(url)}return NextResponse.next()}
export const config={matcher:["/admin/:path*"]}
