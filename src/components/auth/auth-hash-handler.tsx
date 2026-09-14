"use client";

import { useEffect } from "react";

/**
 * Intercepta enlaces de Supabase Auth (recovery / invite) que hayan aterrizado
 * en una página que no es la de establecer contraseña.
 *
 * Contexto: Supabase envía al usuario a `redirect_to` con los tokens en el
 * hash de la URL (`#access_token=...&type=recovery`). Si por lo que sea la
 * URL en el email no coincide con la lista blanca de Supabase, Supabase cae
 * al Site URL (raíz). Este componente detecta ese hash y redirige a
 * `/auth/establecer-contrasena` preservando el hash para que la sesión se
 * establezca allí.
 *
 * También maneja errores (`#error_code=otp_expired`) redirigiendo al login
 * con el hash para mostrar el mensaje adecuado.
 */
export function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.slice(1));
    const type = params.get("type");
    const hasAccessToken = params.has("access_token");
    const hasError = params.has("error") || params.has("error_code");

    // Recovery / invite → establecer contraseña
    if (hasAccessToken && (type === "recovery" || type === "invite" || type === "signup")) {
      const target = `/auth/establecer-contrasena${hash}`;
      window.location.replace(target);
      return;
    }

    // Error de Supabase (otp expirado, etc.) → login para mostrar aviso
    if (hasError) {
      const target = `/login${hash}`;
      window.location.replace(target);
    }
  }, []);

  return null;
}
