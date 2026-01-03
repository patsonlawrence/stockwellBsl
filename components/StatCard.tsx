import type { CSSProperties } from "react";

export default function StatCard({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div style={highlight ? styles.cardHighlight : styles.card}>
      <p style={styles.title}>{title}</p>
      <h2 style={styles.value}>{value}</h2>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    background: "#ffffff",
    color: "#1e3c72",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  cardHighlight: {
    background: "#1e3c72",
    color: "#ffffff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: "0.9rem",
    opacity: 0.8,
  },
  value: {
    fontSize: "1.6rem",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
};
