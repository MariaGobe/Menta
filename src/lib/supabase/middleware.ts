import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COMPANY_ROUTES = [
  "/dashboard",
  "/alumnos",
  "/documentos",
  "/seguimiento",
  "/facturacion",
  "/configuracion",
  "/planes",
  "/calendario",
  "/informes",
  "/evaluacion",
  "/retos",
];

const STUDENT_ROUTES = ["/student"];
const AUTH_ROUTES = ["/login", "/registro"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = startsWithAny(pathname, AUTH_ROUTES);
  const isCompanyRoute = startsWithAny(pathname, COMPANY_ROUTES);
  const isStudentRoute = startsWithAny(pathname, STUDENT_ROUTES);
  const isProtectedRoute = isCompanyRoute || isStudentRoute;

  // Sin sesión + ruta protegida → /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Con sesión → redirigir según rol cuando sea pertinente
  if (user && (isAuthRoute || isProtectedRoute)) {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fail-safe: si no podemos determinar el rol, NO asumimos que es empresa.
    // Al login y que se autentique otra vez.
    if (profileErr || !profile) {
      if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    const isStudent = profile.role === "student";

    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isStudent ? "/student/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }
    if (isStudent && isCompanyRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/student/dashboard";
      return NextResponse.redirect(url);
    }
    if (!isStudent && isStudentRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
