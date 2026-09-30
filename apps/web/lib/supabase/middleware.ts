import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTE_PERMISSIONS, type UserRole } from '../types/auth';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcadcgzwxmpqlhkjjujy.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9OlTVmNUyRsyDe67RyeUzw_powhyXu-';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Check if route requires authentication
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (matchingRoute) {
    if (!user) {
      // Unauthenticated -> redirect to login with return path
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', path);
      return NextResponse.redirect(url);
    }

    // Role-based authorization check
    const allowedRoles = ROUTE_PERMISSIONS[matchingRoute];
    if (allowedRoles && allowedRoles.length > 0) {
      // Fetch user profile to verify role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const userRole = (profile?.role as UserRole) || 'CITIZEN';

      if (!allowedRoles.includes(userRole)) {
        // User does not have permission for this route
        const url = request.nextUrl.clone();
        url.pathname = '/error';
        url.searchParams.set('code', 'unauthorized');
        url.searchParams.set('message', `Role '${userRole}' is not authorized for '${path}'`);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
