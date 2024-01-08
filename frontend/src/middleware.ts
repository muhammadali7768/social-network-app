import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const publicPaths = ['/']

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

 export function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl
//   //TODO: make this scaleable to handle other public urls
  if (publicPaths.some((prefix) => pathname==="/")) {
    return NextResponse.next()
  } else if(!req.cookies.has("token")) {
    console.log("No token")
    return NextResponse.redirect(`${req.nextUrl.origin}/`)
  }
 }