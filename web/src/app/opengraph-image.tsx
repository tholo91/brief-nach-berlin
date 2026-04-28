import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Brief-nach-Berlin - Dein persönliches Anliegen, direkt an die Verantwortlichen.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FAF8F5",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Airmail stripe top */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "12px",
            flexShrink: 0,
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "20px",
                height: "12px",
                backgroundColor:
                  i % 4 === 0 || i % 4 === 1
                    ? "#C1121F"
                    : i % 4 === 2
                    ? "#FAF8F5"
                    : "#1D3557",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "40px 80px",
          }}
        >
          {/* Envelope icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 48 48"
            fill="none"
            style={{ marginBottom: "24px" }}
          >
            <rect
              x="4"
              y="10"
              width="40"
              height="28"
              rx="3"
              stroke="#2D6A4F"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M4 13 L24 28 L44 13"
              stroke="#2D6A4F"
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#1B4332",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: "20px",
              fontFamily: "monospace",
              letterSpacing: "-1px",
            }}
          >
            Dein Brief. Deine Stimme.
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "28px",
              color: "#3D3D3D",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            Sag uns, was dich stört. Wir finden den richtigen Abgeordneten und
            formulieren deinen Brief.
          </div>

          {/* URL badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "32px",
              backgroundColor: "#2D6A4F",
              color: "#FAF8F5",
              padding: "12px 28px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: 600,
            }}
          >
            brief-nach-berlin.vercel.app
          </div>
        </div>

        {/* Airmail stripe bottom */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "12px",
            flexShrink: 0,
          }}
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "20px",
                height: "12px",
                backgroundColor:
                  i % 4 === 0 || i % 4 === 1
                    ? "#C1121F"
                    : i % 4 === 2
                    ? "#FAF8F5"
                    : "#1D3557",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
