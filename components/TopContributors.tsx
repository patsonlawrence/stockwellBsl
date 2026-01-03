import type { CSSProperties } from "react";

const contributors = [
  { name: "John D.", amount: "Ush1,000" },
  { name: "Sarah M.", amount: "Ush900" },
  { name: "David K.", amount: "Ush850" },
];

export default function TopContributors() {
  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>🏆 Top Contributors</h2>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.th}>Member</th>
            <th style={styles.th}>Contribution</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map((member) => (
            <tr key={member.name} style={styles.row}>
              <td style={styles.td}>{member.name}</td>
              <td style={{ ...styles.td, ...styles.amount }}>
                {member.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  heading: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.95rem",
  },
  tableHeaderRow: {
    color: "#6b7280",
  },
  th: {
    textAlign: "left",
    paddingBottom: "0.5rem",
    fontWeight: 600,
  },
  row: {
    borderTop: "1px solid #e5e7eb",
  },
  td: {
    padding: "0.6rem 0",
  },
  amount: {
    fontWeight: "bold",
  },

};
