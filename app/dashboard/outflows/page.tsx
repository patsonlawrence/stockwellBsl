"use client";

import { useEffect, useState, CSSProperties } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */
type Expenditure = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: any;
  recordedBy: string;
  createdAt: any;
  approvals: string[];
  status: "Pending" | "Approved";
};

/* ================= CONFIG ================= */
const ADMIN_IDS = ["ADMIN_UID_1", "ADMIN_UID_2", "ADMIN_UID_3"];

/* ================= STYLES ================= */
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  title: {
    color: "#fff",
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "2.2rem",
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "10px",
    maxWidth: "900px",
    margin: "0 auto 2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  formGroup: { marginBottom: "1rem" },
  label: { display: "block", marginBottom: "0.5rem", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "60px",
  },
  statsValue: {
  fontWeight: 700,
  fontSize: "1.3rem",
  color: "#d32f2f", // 🔴 red
},

  button: {
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1e3c72",
    color: "#fff",
    cursor: "pointer",
  },
  statsContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  th: {
  padding: "12px",
  borderBottom: "2px solid #1e3c72",
  backgroundColor: "#f1f5fb",
  fontWeight: 600,
  color: "#1e3c72",
  textAlign: "left",
},
td: {
  padding: "10px",
  borderBottom: "1px solid #e0e0e0",
  color: "#333",
},
  statsCard: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "10px",
    flex: 1,
    minWidth: "200px",
    textAlign: "center",
  },
  badgeApproved: {
  backgroundColor: "#d4edda",
  color: "#155724",
  padding: "4px 10px",
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "0.85rem",
},

badgePending: {
  backgroundColor: "#fff3cd",
  color: "#856404",
  padding: "4px 10px",
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "0.85rem",
},

  statsTitle: { fontWeight: 500 },
  //statsValue: { fontWeight: 700, fontSize: "1.3rem" },
};

/* ================= COMPONENT ================= */
export default function RecordExpenditurePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);

  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  /* ================= AUTH ================= */
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(u ? ADMIN_IDS.includes(u.uid) : false);
    });
  }, []);

  const router = useRouter();

const handleExit = () => {
  router.push("/dashboard");
};


  /* ================= FETCH EXPENDITURES ================= */
  const fetchExpenditures = async () => {
    const snapshot = await getDocs(collection(db, "expenditures"));
    setExpenditures(
      snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    );
  };

  useEffect(() => {
    fetchExpenditures();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !category) return;

    await addDoc(collection(db, "expenditures"), {
      amount,
      category,
      description,
      date: new Date(),
      recordedBy: user.uid,
      createdAt: serverTimestamp(),
      approvals: [],
      status: "Pending",
    });

    setAmount("");
    setCategory("");
    setDescription("");
    fetchExpenditures();
  };

  /* ================= APPROVAL ================= */
  const approveExpenditure = async (exp: Expenditure) => {
    if (!user) return;

    const ref = doc(db, "expenditures", exp.id);
    await updateDoc(ref, {
      approvals: arrayUnion(user.uid),
      status: exp.approvals.length + 1 >= 2 ? "Approved" : "Pending",
    });

    fetchExpenditures();
  };

  const toJSDate = (d: any) => {
  if (!d) return null;
  return d.toDate ? d.toDate() : new Date(d);
};


  /* ================= STATS ================= */
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalThisMonth = expenditures
  .filter((e) => {
    if (e.status !== "Approved") return false;
    const d = toJSDate(e.date);
    if (!d) return false;

    return (
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth
    );
  })
  .reduce((a, b) => a + b.amount, 0);
  
  const totalYTD = expenditures
    .filter((e) => {
      if (e.status !== "Approved") return false;
      const d = toJSDate(e.date);
      if (!d) return false;

      return d.getFullYear() === currentYear;
    })
    .reduce((a, b) => a + b.amount, 0);
    const formatDate = (d: any) => {
  const date = d?.toDate ? d.toDate() : new Date(d);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const handleDownload = () => {
  if (!expenditures.length) return;

  const headers = [
    "Date",
    "Category",
    "Amount",
    "Description",
    "Status",
    "Approvals",
    "Recorded By",
  ];

  const rows = expenditures.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount,
    `"${e.description || ""}"`, // protect commas
    e.status,
    `${e.approvals.length}`,
    e.recordedBy,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `expenditures_${new Date().toISOString().slice(0, 10)}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  const totalLastYear = expenditures
    .filter((e) => {
      if (e.status !== "Approved") return false;
      const d = toJSDate(e.date);
      if (!d) return false;

      return d.getFullYear() === currentYear - 1;
    })
    .reduce((a, b) => a + b.amount, 0);

  if (!user) return <p style={{ color: "#fff" }}>Loading...</p>;

  /* ================= RENDER ================= */
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Record Expenditure</h1>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <br /><br />
          <select
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option>Admin Expenses</option>
            <option>Maintenance</option>
            <option>Purchases</option>
          </select>
          <br /><br />
          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <br /><br />
          <button style={styles.button}>Record</button>
        </form>
      </div>
      
      <div
   ></div>


      <div style={styles.statsContainer}>
        <div style={styles.statsCard}>
          <div style={styles.statsTitle}>This Month</div>
          <div style={styles.statsValue}>Ush {totalThisMonth.toLocaleString()}</div>
        </div>
        <div style={styles.statsCard}>
          <div style={styles.statsTitle}>Year To Date</div>
          <div style={styles.statsValue}>Ush {totalYTD.toLocaleString()}</div>
        </div>
        <div style={styles.statsCard}>
          <div style={styles.statsTitle}>Last Year</div>
          <div style={styles.statsValue}>Ush {totalLastYear.toLocaleString()}</div>
        </div>

        {/* ================= RECORDS TABLE ================= */}
<div style={{ ...styles.card, overflowX: "auto" }}>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    
    <thead>
      <tr>
        <th style={styles.th}>Date</th>
        <th style={styles.th}>Category</th>
        <th style={styles.th}>Amount</th>
        <th style={styles.th}>Description</th>
        <th style={styles.th}>Status</th>
        <th style={styles.th}>Approvals</th>
        {isAdmin && <th style={styles.th}>Actions</th>}
      </tr>
    </thead>
    
    <tbody>
      {expenditures
        .slice()
        .reverse()
        .map((exp) => {
          const canEdit =
            exp.status === "Pending" && exp.recordedBy === user.uid;

          return (
            <tr key={exp.id}>
              <td style={styles.td}>
  {formatDate(exp.date)}
</td>


              <td style={styles.td}>{exp.category}</td>
              <td style={styles.td}>{exp.amount.toLocaleString()}</td>

              <td style={styles.td}>
                {canEdit ? (
                  <textarea
                    style={styles.textarea}
                    value={exp.description}
                    onBlur={(e) =>
                      updateDoc(doc(db, "expenditures", exp.id), {
                        description: e.target.value,
                      })
                    }
                  />
                ) : (
                  exp.description
                )}
              </td>

              <td style={styles.td}>
                <span
                  style={
                    exp.status === "Approved"
                      ? styles.badgeApproved
                      : styles.badgePending
                  }
                >
                  {exp.status}
                </span>
              </td>

              <td style={styles.td}>{exp.approvals.length} / 3</td>

              {isAdmin && (
                <td style={styles.td}>
                  {exp.status === "Pending" &&
                    !exp.approvals.includes(user.uid) && (
                      <button
                        style={styles.button}
                        onClick={() => approveExpenditure(exp)}
                      >
                        Approve
                      </button>
                    )}
                </td>
              )}
            </tr>
          );
        })}
    </tbody>
  </table>
</div>

<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
  <button
    onClick={handleExit}
    style={{
      padding: "0.5rem 1rem",
      borderRadius: "8px",
      border: "1px solid #fff",
      background: "transparent",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Exit
  </button>
  <button
    onClick={handleDownload}
    style={{
      padding: "0.5rem 1rem",
      borderRadius: "8px",
      border: "1px solid #fff",
      background: "transparent",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
      marginLeft: "1rem",
    }}
  >
    Download
  </button>
</div>


      </div>
    </div>
  
    
  );
}
