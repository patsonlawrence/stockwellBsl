import { CSSProperties, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebaseClient"; // adjust path if needed

type Contributor = {
  name: string;
  amount: number;
};

const styles: Record<string, CSSProperties> = {
  card: {
    background: "#b7ddf7",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: 480,
  },
  heading: {
    margin: "0 0 12px 0",
    fontSize: 18,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    background: "#056cb3",
  },
  th: {
    textAlign: "left",
    padding: "8px",
    fontSize: 14,
  },
  row: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "8px",
    fontSize: 14,
  },
  amount: {
    textAlign: "right",
  },
};

export default function TopContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "savings"));

        // Aggregate totals per member
        const totals: Record<string, number> = {};

        snapshot.forEach((doc) => {
  const data = doc.data();
  const name = data.memberName || "Unknown";
  const rawAmount = data.submittedAmount;

  // Convert to number safely
  const amount = Number(rawAmount) || 0;

  if (!totals[name]) {
    totals[name] = 0;
  }
  totals[name] += amount;
});


        // Convert to array, sort, pick top 3
        const topThree = Object.entries(totals)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);

        setContributors(topThree);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopContributors();
  }, []);

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>🏆 Top Contributors</h2>

      {loading ? (
  <p>Loading...</p>
) : contributors.length === 0 ? (
  <p>No contributions yet.</p>
) : (
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
            Ush {member.amount.toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
}
