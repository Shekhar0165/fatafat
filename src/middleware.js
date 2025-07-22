import { NextResponse } from 'next/server'

// Define which routes are protected
const protectedRoutes = ['/dashboard']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Only apply middleware to protected routes
  if (!protectedRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // If accessToken is available, allow access
  if (accessToken) {
    return NextResponse.next()
  }

  // If refreshToken exists, try to regenerate accessToken
  if (refreshToken) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const response = NextResponse.next()

        // Set new accessToken (valid for 15 mins)
        response.cookies.set('accessToken', data.tokens.accessToken, {
          httpOnly: false,
          maxAge: 60 * 15, // 15 minutes
          path: '/',
          sameSite: 'lax',
        })

        return response
      }
    } catch (error) {
      console.error('Token refresh error:', error)
    }
  }

  // If all fails, redirect to login
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'],
}
