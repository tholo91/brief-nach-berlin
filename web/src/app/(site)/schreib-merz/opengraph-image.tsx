import { ImageResponse } from "next/og";
import { APP_URL } from "@/lib/config";

export const alt = "Schreib Merz – dein persönlicher Brief an den Bundeskanzler";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SchreibMerzOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#faf8f5",
          color: "#1b4332",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 76% 24%, rgba(45,106,79,0.20), transparent 39%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 12,
            display: "flex",
            background:
              "repeating-linear-gradient(-45deg, #c1121f 0 14px, #faf8f5 14px 21px, #1d3557 21px 35px, #faf8f5 35px 42px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 710,
            padding: "72px 30px 68px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "fit-content",
              border: "2px solid rgba(45,106,79,0.26)",
              background: "rgba(255,255,255,0.72)",
              padding: "10px 16px",
              fontFamily: "Courier New, monospace",
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Eine Aktion von Brief-nach-Berlin
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontFamily: "Courier New, monospace",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 0.98,
              letterSpacing: -3,
            }}
          >
            Schreib Merz.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              maxWidth: 610,
              fontFamily: "Arial, sans-serif",
              fontSize: 34,
              lineHeight: 1.18,
              color: "#3d3d3d",
            }}
          >
            Wähle dein Thema. Ergänze deine Sicht. Schreib deinen persönlichen
            Brief an den Bundeskanzler.
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            width: 490,
            paddingTop: 42,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 82,
              right: 45,
              width: 370,
              height: 450,
              display: "flex",
              overflow: "hidden",
              border: "2px solid rgba(27,67,50,0.18)",
              borderRadius: 8,
              background: "#eee6d8",
              boxShadow: "0 28px 60px rgba(27,67,50,0.20)",
              transform: "rotate(2deg)",
            }}
          >
            <img
              src={`${APP_URL}/images/schreib-merz-editorial.jpg`}
              alt=""
              width="370"
              height="450"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              right: 35,
              bottom: 34,
              display: "flex",
              border: "2px solid rgba(27,67,50,0.20)",
              background: "white",
              padding: "13px 18px",
              fontFamily: "Courier New, monospace",
              fontSize: 20,
              fontWeight: 700,
              transform: "rotate(-2deg)",
              boxShadow: "0 12px 24px rgba(27,67,50,0.16)",
            }}
          >
            Deine Worte. Dein Brief.
          </div>
        </div>
      </div>
    ),
    size
  );
}
