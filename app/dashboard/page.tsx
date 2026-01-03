"use client";

import type { CSSProperties } from "react";
import StatCard from "../../components/StatCard";
import RecentInvestments from "../../components/RecentInvestments";
import TopContributors from "../../components/TopContributors";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // adjust key if different
    router.push("/login");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.titleContainer}>
          <img src="/logo.jpg" alt="BSL Logo" style={styles.headerLogo} />
          <h1 style={styles.title}>BSL Investment Club</h1>
        </div>
        <p style={styles.subtitle}>Overview of club performance</p>
      </header>

      {/* Stats */}
      <section style={styles.statsGrid}>
        <StatCard title="Total Fund Value" value="Ush125,000" />
        <StatCard title="Members" value="24" />
        <StatCard title="Monthly Contributions" value="Ush5,200" />
        <StatCard title="Annual Growth" value="+12.4%" highlight />
      </section>

      {/* Bottom Sections */}
      <section style={styles.bottomGrid}>
        <RecentInvestments />
        <TopContributors />
      </section>

      {/* Navigation Buttons */}
      <NavigationSection />

      {/* Logout Button */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

// Navigation component
function NavigationSection() {
  const router = useRouter();

  const navItems = [
    { label: "Profile", link: "/profile" },
    { label: "Members", link: "/dashboard/members" }, // ✅ members page
    { label: "Loans", link: "/loans" },
    { label: "Investments", link: "/investments" },
    { label: "Dividends", link: "/dividends" },
    { label: "Income", link: "/income" },
    { label: "Expenditures", link: "/expenditures" },
    { label: "Logo", link: "/" },
    { label: "Savings", link: "/savings" },
    { label: "Shares", link: "/shares" },
  ];

  return (
    <section style={styles.navGrid}>
      {navItems.map((item) => (
        <button
          key={item.label}
          style={styles.navButton}
          onClick={() => router.push(item.link)}
        >
          {item.label}
        </button>
      ))}
    </section>
  );
}

// Styles
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#fff",
  },
  header: {
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  headerLogo: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid #fff",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#c7d2fe",
    marginTop: "0.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
  },
  navGrid: {
    marginTop: "2.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "1rem",
  },
  navButton: {
    padding: "0.9rem 1rem",
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    transition: "all 0.2s ease",
  },
  logoutButton: {
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "1rem",
    alignSelf: "flex-end",
  },
};
