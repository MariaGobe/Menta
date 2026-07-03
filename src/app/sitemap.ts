import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-gobe.com";

/**
 * Sitemap de las páginas públicas indexables.
 * Las páginas privadas (dashboard, portal alumno) NO se incluyen.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const publicRoutes = [
    "",
    "/precios",
    "/login",
    "/registro",
    "/recuperar",
    "/aviso-legal",
    "/privacidad",
    "/cookies",
    "/condiciones",
  ];
  return publicRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
