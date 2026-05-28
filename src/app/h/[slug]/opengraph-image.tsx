import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { MILESTONE_TYPE_LABELS, type MilestoneType } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Hito profesional en Menta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen OpenGraph generada dinámicamente para cada hito.
 * LinkedIn la recogerá al previsualizar el enlace.
 */
export default async function OgImage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: m } = await supabase
    .from("milestones")
    .select("title, type, student_id, endorsed_at")
    .eq("public_slug", params.slug)
    .eq("is_published", true)
    .maybeSingle();

  let studentName = "Alumno";
  let companyName: string | null = null;
  if (m?.student_id) {
    const { data: s } = await supabase
      .from("students")
      .select("full_name, organizations(name)")
      .eq("id", m.student_id)
      .single();
    studentName = s?.full_name ?? "Alumno";
    companyName = (s?.organizations as { name?: string } | null)?.name ?? null;
  }

  const title = m?.title ?? "Hito profesional";
  const badge = m?.endorsed_at
    ? "Recomendación de empresa"
    : MILESTONE_TYPE_LABELS[(m?.type as MilestoneType) ?? "custom"];

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
        {/* Header */}
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

        {/* Contenido principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
            {badge}
          </div>

          <div
            style={{
              fontSize: "62px",
              fontWeight: 800,
              color: "#1a312a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            {title.slice(0, 110)}
          </div>

          <div
            style={{
              fontSize: "28px",
              color: "#3d6c5c",
              fontWeight: 500,
            }}
          >
            {studentName}
            {companyName ? ` · Prácticas en ${companyName}` : ""}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: "20px",
            color: "#3d6c5c",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>menta — gestión de prácticas con mentor virtual</span>
        </div>
      </div>
    ),
    size,
  );
}
