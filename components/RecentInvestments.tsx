import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  limit,
  query,
} from "firebase/firestore";
import { db } from "@/firebaseClient"; // adjust path if needed

type Investment = {
  name: string;
  amount: number;
  positive: boolean;
};

export default function RecentInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentSavings = async () => {
      try {
        const q = query(
          collection(db, "savings"),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => {
          const saving = doc.data();
          return {
            name: saving.memberName,
            amount: saving.submittedAmount,
            positive: saving.submittedAmount >= 0,
          };
        });

        setInvestments(data);
      } catch (error) {
        console.error("Failed to fetch savings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSavings();
  }, []);

  return (
    <div style={styles.card}>
      <h2 style={styles.heading}>📈 Recent Investments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={styles.list}>
          {investments.map((item, index) => (
            <li key={index} style={styles.row}>
              <span>{item.name}</span>
              <span
                style={{
                  ...styles.amount,
                  color: item.positive ? "#16a34a" : "#dc2626",
                }}
              >
                {item.positive ? "+" : "-"}Ush 
                {Math.abs(item.amount).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
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
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0",
    borderBottom: "1px solid #e5e7eb",
  },
  amount: {
    fontWeight: "bold",
  },
};
