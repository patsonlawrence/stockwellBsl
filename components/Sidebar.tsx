"use client";

import type { CSSProperties } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <h1 style={styles.title}>BSL Investment Club</h1>

      <nav style={styles.nav}>
        <NavItem icon={<HomeIcon style={styles.icon} />} label="Dashboard" />
        <NavItem icon={<ChartBarIcon style={styles.icon} />} label="Investments" />
        <NavItem
          icon={<BanknotesIcon style={styles.icon} />}
          label="Contributions"
        />
        <NavItem icon={<UsersIcon style={styles.icon} />} label="Members" />
      </nav>
    </aside>
  );
}
function NavItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      style={styles.navItem}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
const styles: Record<string, CSSProperties> = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    padding: "2rem 1.5rem",
    background: "linear-gradient(180deg, #0f172a, #1e3c72)",
    color: "#ffffff",
    boxShadow: "4px 0 15px rgba(0,0,0,0.3)",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "2.5rem",
    letterSpacing: "0.5px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.6rem 0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    fontSize: "0.95rem",
  },
  icon: {
    width: "20px",
    height: "20px",
  },
};
