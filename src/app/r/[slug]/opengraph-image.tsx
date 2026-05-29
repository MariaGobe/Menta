import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Reto abierto en Menta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image dinámica para retos públicos. LinkedIn la recoge al previsualizar.
 */
export default async function OgImage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: c } = await supabase
    .from("challenges")
    .select("title, short_description, end_date, status, organization_id")
    .eq("public_slug", params.slug)
    .in("status", ["published", "closed"])
    .maybeSingle();

  let companyName: string | null = null;
  if (c?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", c.organization_id)
      .single();
    companyName = org?.name ?? null;
  }

  const title = c?.title ?? "Reto abierto";
  const subtitle = c?.short_description ?? null;
  const badge =
    c?.status === "closed" ? "Reto finalizado" : "Reto abierto";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background:
            "linear-gradient(135deg, #f0f6f4 0%, #dbeae5 60%, #bcd6cd 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "#62A691",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            n
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#1a312a" }}>
            Menta
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              padding: "8px 18px",
              background: "white",
              border: "1px solid #bcd6cd",
              borderRadius: "999px",
              fontSize: "20px",
              color: "#3d6c5c",
              fontWeight: 600,
            }}
          >
            🏆 {badge}
            {companyName && ` · ${companyName}`}
          </div>

          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              color: "#1a312a",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "1050px",
            }}
          >
            {title.slice(0, 100)}
          </div>

          {subtitle && (
            <div
              style={{
                fontSize: "26px",
                color: "#3d6c5c",
                lineHeight: 1.3,
                maxWidth: "1050px",
              }}
            >
              {subtitle.slice(0, 140)}
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "#3d6c5c",
          }}
        >
          menta — captación de talento y gestión de prácticas
        </div>
      </div>
    ),
    size,
  );
}
