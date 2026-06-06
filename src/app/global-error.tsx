"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#f7faf9",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            padding: 32,
            borderRadius: 16,
            background: "white",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#62A691",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: "56px",
              margin: "0 auto 16px",
            }}
          >
            M
          </div>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Algo ha fallado</h1>
          <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
            Hemos tenido un problema serio. Recarga la página o vuelve al
            inicio.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#999",
                margin: "0 0 16px",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              background: "#62A691",
              color: "white",
              border: 0,
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
