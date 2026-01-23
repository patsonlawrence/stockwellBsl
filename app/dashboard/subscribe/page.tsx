"use client";
import React from "react";

type Bank = {
  name: string;
  icon: string;
  androidPackage: string;
  iosUniversalLink?: string;
  fallback: string;
};

const banks: Bank[] = [
  {
    name: "Airtel Money",
    icon: "/airtel.png",
    androidPackage: "com.airtel.airtelmoney",
    fallback: "https://play.google.com/store/apps/details?id=com.airtel.airtelmoney",
  },
  {
    name: "MTN Mobile Money",
    icon: "/mtn.png",
    androidPackage: "com.mtn.momo",
    fallback: "https://play.google.com/store/apps/details?id=com.mtn.momo",
  },
  {
    name: "Stanbic Bank",
    icon: "/stanbic.png",
    androidPackage: "com.stanbicbankug.app",
    fallback: "https://play.google.com/store/apps/details?id=com.stanbicbankug.app",
  },
  {
    name: "Equity Bank",
    icon: "/equity.png",
    androidPackage: "com.equitybank.mobile",
    fallback: "https://play.google.com/store/apps/details?id=com.equitybank.mobile",
  },
  {
    name: "DFCU Bank",
    icon: "/dfcu.png",
    androidPackage: "com.dfcu.mobile",
    fallback: "https://play.google.com/store/apps/details?id=com.dfcu.mobile",
  },
  {
    name: "Centenary Bank",
    icon: "/centenary.png",
    androidPackage: "com.centenarybank.app",
    fallback: "https://play.google.com/store/apps/details?id=com.centenarybank.app",
  },
  {
    name: "Absa Bank",
    icon: "/absa.png",
    androidPackage: "com.absa.ubank",
    fallback: "https://play.google.com/store/apps/details?id=com.absa.ubank",
  },
  {
    name: "DTB Bank",
    icon: "/dtb.png",
    androidPackage: "com.dtb.ug",
    fallback: "https://play.google.com/store/apps/details?id=com.dtb.ug",
  },
  {
    name: "Standard Chartered",
    icon: "/stanchat.png",
    androidPackage: "com.scbank.mobile",
    fallback: "https://play.google.com/store/apps/details?id=com.scbank.mobile",
  },
];

export default function SubscriptionPage() {
  const handleRedirect = (bank: Bank) => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      const intentUrl = `intent://#Intent;package=${bank.androidPackage};end`;
      window.location.href = intentUrl;
      // Play Store fallback will occur automatically in Chrome
    } else if (isIOS && bank.iosUniversalLink) {
      window.location.href = bank.iosUniversalLink;
    } else {
      // Generic fallback
      window.location.href = bank.fallback;
    }
  };

  return (
    <div style={styles.container}>
      <h1>Subscribe via Your Financial App</h1>
      <p>Tap an icon below:</p>

      <div style={styles.grid}>
        {banks.map((bank) => (
          <div
            key={bank.name}
            style={styles.card}
            onClick={() => handleRedirect(bank)}
          >
            <img src={bank.icon} alt={bank.name} style={styles.icon} />
            <span style={styles.bankName}>{bank.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles : Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "1rem",
    width: "100%",
    maxWidth: "600px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  icon: { width: "60px", height: "60px", marginBottom: "0.5rem" },
  bankName: { fontWeight: "600", fontSize: "0.95rem", color: "#1e3c72" },
}; 