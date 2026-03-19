import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "(주)보령항공여행사 - 22년 전통 해외골프투어 전문";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f766e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* 골프공 아이콘 */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "white",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-1px",
            marginBottom: 12,
          }}
        >
          (주)보령항공여행사
        </div>
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 32,
          }}
        >
          22년 전통 해외골프투어 전문
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["일본", "태국", "베트남", "대만", "괌·사이판", "국내·제주"].map(
            (country) => (
              <div
                key={country}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 18,
                }}
              >
                {country}
              </div>
            )
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          1588-0320 | boryoung.co.kr
        </div>
      </div>
    ),
    { ...size }
  );
}
