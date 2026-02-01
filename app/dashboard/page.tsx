"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";

import StatCard from "../../components/StatCard";
import RecentInvestments from "../../components/RecentInvestments";
import TopContributors from "../../components/TopContributors";
import { db } from "@/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";
type Stats = {
  membersCount: number;
  totalFund: number;
  monthlyContributions: number;
  annualGrowth: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    membersCount: 0,
    totalFund: 0,
    monthlyContributions: 0,
    annualGrowth: "0%",
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // --- 1️⃣ Members count ---
        const membersSnapshot = await getDocs(collection(db, "members"));
        const membersCount = membersSnapshot.size;

        // --- 2️⃣ Savings ---
        const savingsSnapshot = await getDocs(collection(db, "savings"));
        let totalSavings = 0;
        let monthlyContributions = 0;
        let lastYearTotal = 0;
        const now = new Date();

        savingsSnapshot.forEach((doc) => {
          const data: any = doc.data();
          const amount = Number(data.submittedAmount || 0);
          totalSavings += amount;

          const date = data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : data.createdAt?.toDate
            ? data.createdAt.toDate()
            : null;

          if (!date) return;

          if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            monthlyContributions += amount;
          }

          if (date.getFullYear() === now.getFullYear() - 1) {
            lastYearTotal += amount;
          }
        });
        
        // --- 3️⃣ Profits ---
        const investmentsSnapshot = await getDocs(
          query(collection(db, "investments"), where("status", "==", "resolved"))
        );

        let totalProfits = 0;
        investmentsSnapshot.forEach((doc) => {
          totalProfits += Number(doc.data().profitEarned || 0);
        });

        // --- 4️⃣ Expenditures ---
        const expendituresSnapshot = await getDocs(collection(db, "expenditures"));
        let totalExpenditures = 0;
        expendituresSnapshot.forEach((doc) => {
          totalExpenditures += Number(doc.data().amount || 0);
        });

        const totalFund = totalSavings + totalProfits - totalExpenditures;
        const annualGrowth = lastYearTotal ? ((totalFund - lastYearTotal) / lastYearTotal) * 100 : 0;

        setStats({
          membersCount,
          totalFund,
          monthlyContributions,
          annualGrowth: `${annualGrowth.toFixed(2)}%`,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
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
  <StatCard title="Total Fund Value"  value={stats ?.totalFund != null? `Ush: ${stats.totalFund.toLocaleString()}` : "Loading..."} />
  <StatCard title="Members"  value={stats ?.membersCount != null? stats.membersCount.toString() : "Loading..."} />
  <StatCard title="Monthly Contributions"  value={stats ?.monthlyContributions != null? `Ush: ${stats.monthlyContributions.toLocaleString()}` : "Loading..."} />
  <StatCard title="Annual Growth"  value={stats ?.annualGrowth != null? stats.annualGrowth : "Loading..."} highlight />
</section>


      {/* Bottom Sections */}
      <section style={styles.bottomGrid}>
        <RecentInvestments />
        <TopContributors />
      </section>

      {/* Navigation */}
      <NavigationSection />

      {/* Logout */}
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
    { label: "Profile", link: "/dashboard/profile" },
    { label: "Members", link: "/dashboard/members" },
    { label: "Loans", link: "/dashboard/loans" },
    { label: "Investments", link: "/dashboard/investments" },
    { label: "Dividends", link: "/dashboard/dividends" },
    { label: "Income", link: "/dashboard/income" },
    { label: "OutFlows", link: "/dashboard/outflows" },
    { label: "Logo", link: "/dashboard" },
    { label: "Savings", link: "/dashboard/savings" },
    { label: "Shares", link: "/dashboard/shares" },
    { label: "Admin", link: "/dashboard/admin/approvals" },
    { label: "Bsl💵", link: "/dashboard/subscribe" },  
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

// Styles (unchanged)
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
    backgroundColor: "white",
    color: "red",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "1rem",
    alignSelf: "flex-end",
  },
};
