"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebaseClient";

import { doc, updateDoc } from "firebase/firestore";




// --------------------
// Types
// --------------------
interface Investment {
  id?: string; // 👈 IMPORTANT (Firestore doc id)
  name: string;
  amountInvested: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  status: string;

  // resolution
  profitEarned?: number;
  resolvedAt?: any;
  resolutionNotes?: string;
}


// --------------------
// Component
// --------------------
export default function InvestmentsPage() {
  const auth = getAuth();
  const ADMIN_UID = "Bs2uAtvwYYRaITJ2tfyyGE2Y1w62";

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
const [profitEarned, setProfitEarned] = useState<number>(0);
const [resolutionNotes, setResolutionNotes] = useState("");
const [resolving, setResolving] = useState(false);

  const [newInvestment, setNewInvestment] = useState<Investment>({
    name: "",
    amountInvested: 0,
    interestRate: 0,
    startDate: "",
    maturityDate: "",
    status: "active",
  });

  const isAdmin = auth.currentUser?.uid === ADMIN_UID;
  const investmentsCol = collection(db, "investments");

  // --------------------
  // Fetch investments
  // --------------------
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(investmentsCol);
      const data = snapshot.docs.map(doc => ({
  id: doc.id,
  ...(doc.data() as Investment),
    }));

      setInvestments(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  const resolveInvestment = async () => {
  if (!selectedInvestment || !selectedInvestment.id) return;

  if (profitEarned <= 0) {
    alert("Enter a valid profit amount");
    return;
  }

  try {
    setResolving(true);

    await updateDoc(doc(db, "investments", selectedInvestment.id), {
      profitEarned,
      resolutionNotes,
      resolvedAt: serverTimestamp(),
      status: "resolved",
    });

    setSelectedInvestment(null);
    setProfitEarned(0);
    setResolutionNotes("");
    fetchInvestments();
  } catch (err) {
    alert("Failed to resolve investment");
  } finally {
    setResolving(false);
  }
};


  useEffect(() => {
    fetchInvestments();
  }, []);

  // --------------------
  // Add investment
  // --------------------
  const addInvestment = async () => {
    if (!isAdmin) return;

    if (!newInvestment.name || newInvestment.amountInvested <= 0) {
      alert("Please enter a valid investment name and amount.");
      return;
    }

    try {
      await addDoc(investmentsCol, {
        ...newInvestment,
        type: "bond",
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });

      setNewInvestment({
        name: "",
        amountInvested: 0,
        interestRate: 0,
        startDate: "",
        maturityDate: "",
        status: "active",
      });

      fetchInvestments();
    } catch (err: any) {
      alert("Failed to add investment");
    }
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Investments</h1>

      {isAdmin && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Add Bond Investment</h2>

          <input
            style={styles.input}
            placeholder="Investment Name"
            value={newInvestment.name}
            onChange={e => setNewInvestment({ ...newInvestment, name: e.target.value })}
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Amount Invested"
            value={newInvestment.amountInvested}
            onChange={e => setNewInvestment({ ...newInvestment, amountInvested: Number(e.target.value) })}
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Interest Rate (%)"
            value={newInvestment.interestRate}
            onChange={e => setNewInvestment({ ...newInvestment, interestRate: Number(e.target.value) })}
          />

          <input
            style={styles.input}
            type="date"
            value={newInvestment.startDate}
            onChange={e => setNewInvestment({ ...newInvestment, startDate: e.target.value })}
          />

          <input
            style={styles.input}
            type="date"
            value={newInvestment.maturityDate}
            onChange={e => setNewInvestment({ ...newInvestment, maturityDate: e.target.value })}
          />

          <button style={styles.primaryButton} onClick={addInvestment}>
            Add Investment
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Investment Summary</h2>

        {loading && <p>Loading investments...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && investments.length === 0 && (
          <p>No investments recorded yet.</p>
        )}

        {investments.map((inv, i) => (
  <div key={i} style={styles.listItem}>
    <strong>{inv.name}</strong>

    <div style={styles.subText}>
      Amount: Ush {inv.amountInvested.toLocaleString()} | 
      Interest: {inv.interestRate}% | 
      Status: {inv.status}
    </div>

    {/* RESOLVED DISPLAY */}
    {inv.status === "resolved" && (
      <div style={styles.resolvedText}>
        ✅ Resolved — Profit: Ush {inv.profitEarned?.toLocaleString()}
      </div>
    )}

    {/* ADMIN RESOLVE BUTTON */}
    {isAdmin && inv.status !== "resolved" && (
      <button
        style={styles.resolveButton}
        onClick={() => setSelectedInvestment(inv)}
      >
        Resolve
      </button>
    )}
    {selectedInvestment && (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <h3>Resolve Investment</h3>

      <p><strong>{selectedInvestment.name}</strong></p>

      <input
        style={styles.input}
        type="number"
        placeholder="Profit Earned (Ush)"
        value={profitEarned}
        onChange={e => setProfitEarned(Number(e.target.value))}
      />

      <textarea
        style={styles.textarea}
        placeholder="Resolution notes"
        value={resolutionNotes}
        onChange={e => setResolutionNotes(e.target.value)}
      />

      <div style={styles.modalActions}>
        <button onClick={() => setSelectedInvestment(null)}>Cancel</button>
        <button
          style={styles.primaryButton}
          onClick={resolveInvestment}
          disabled={resolving}
        >
          {resolving ? "Resolving..." : "Resolve"}
        </button>
      </div>
    </div>
  </div>
)}

  </div>
))}

      </div>
    </div>
  );
}

// --------------------
// Styles
// --------------------
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    color: "#fff",
    textAlign: "center",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "0 auto 2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  sectionTitle: {
    marginBottom: "1rem",
    color: "#1e3c72",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  primaryButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1e3c72",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  listItem: {
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  subText: {
    fontSize: "0.9rem",
    color: "#555",
  },
  error: {
    color: "red",
  },
  resolveButton: {
  marginTop: "8px",
  padding: "6px 12px",
  backgroundColor: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
},

resolvedText: {
  marginTop: "6px",
  color: "#16a34a",
  fontWeight: "bold",
},

modalOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

modal: {
  background: "#fff",
  padding: "1.5rem",
  borderRadius: "10px",
  width: "100%",
  maxWidth: "400px",
},

modalActions: {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "1rem",
},

textarea: {
  width: "100%",
  minHeight: "80px",
  padding: "10px",
  marginTop: "0.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
},

};
