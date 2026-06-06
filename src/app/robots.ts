import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://menta-theta.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/alumnos",
          "/alumnos/",
          "/planes",
          "/planes/",
          "/calendario",
          "/entregables",
          "/seguimiento",
          "/evaluacion",
          "/retos",
          "/informes",
          "/documentos",
          "/facturacion",
          "/configuracion",
          "/bienvenida",
          "/student",
          "/student/",
          "/auth",
          "/api",
          "/api/",
          "/r/", // retos privados con slug
          "/h/", // hitos privados con slug
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
