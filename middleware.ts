import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { supabaseConfig } from "@/lib/supabase/env";
import { DEMO_SESSION_COOKIE, verifyDemoSessionToken } from "@/lib/demo-session-token";
import { DEMO_SESSION_COOKIE, verifyDemoSessionToken } from "@/lib/demo-session-token";

const protectedPrefixes = ["/admin", "/operator", "/pengemudi", "/wali", "/akun", "/tanpa-akses"];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  // Mode akses terbuka pengembangan (DEC-024): pengalihan ke /login dimatikan, tetapi
  // gerbang di setiap layout dan Server Action tetap berjalan. Mode ini tidak pernah
  // aktif di produksi dan tidak memakai klien Supabase sama sekali.
  if (isDevOpenAccess()) return NextResponse.next();
  if (await verifyDemoSessionToken(request.cookies.get(DEMO_SESSION_COOKIE)?.value)) return NextResponse.next();
  const demoToken = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  if (await verifyDemoSessionToken(demoToken)) return NextResponse.next();

  const config = supabaseConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(request.nextUrl.pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.search = `?next=${encodeURIComponent(next)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
