"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#F6821F",
        color: "#ffffff",
        padding: "12px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* LEFT: Logo + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flex: "1 1 auto",
            minWidth: "0",
          }}
        >
          <Image
            src="/WHC_dp.png"
            alt="Logo"
            width={50}
            height={50}
            priority
          />
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Inventory Management
          </h1>
        </div>

        {/* RIGHT: User */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500" }}>User</span>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            U
          </div>
        </div>
      </div>
    </header>
  );
}
