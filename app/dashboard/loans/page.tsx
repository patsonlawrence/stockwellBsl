"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import app, { db } from "@/firebaseClient";

/* =======================
   Styles
======================= */

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 800,
    margin: "2rem auto",
    padding: "0 1rem",
    background: "linear-gradient(135deg, #74b9ff, #a29bfe)", // lighter blue gradient
    minHeight: "100vh",
    borderRadius: "12px",
    paddingBottom: "2rem",
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "2rem",
    gap: "1rem",
  },
  title: { color: "#1e3c72" },
  exitButton: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  loanCard: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  },
  approvedLoanCard: {
    background: "#e0e0e0", // grayed out for approved loans
    padding: "1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    opacity: 0.8,
  },
  emptyText: {
    color: "#9ca3af",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxWidth: 400,
  },
  input: {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  submitButton: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

/* =======================
   Types
======================= */

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  interestRate: number;
  durationMonths: number;
  monthlyPayment: number;
  finalExpectedPayment: number;
  createdAt?: Timestamp;
}

/* =======================
   Component
======================= */

export default function LoansPage() {
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);

  // form state
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  /* =======================
     Fetch Loans
  ======================= */

  useEffect(() => {
    const auth = getAuth(app);

    return onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      setUserUid(user.uid);

      try {
        const q = query(collection(db, "loans"), where("uid", "==", user.uid));
        const snap = await getDocs(q);

        const data: Loan[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Loan, "id">),
        }));

        setLoans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  /* =======================
     Submit Loan
  ======================= */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userUid) return;

    const amt = Number(amount);
    const dur = Number(duration);
    const interest = Number(interestRate);

    if (!amt || !dur || !interest || !purpose.trim()) {
      setFormStatus("Please fill all fields correctly");
      return;
    }

    const monthlyPayment = Number(((amt * (1 + interest / 100)) / dur).toFixed(2));
    const finalExpectedPayment = Number((monthlyPayment * dur).toFixed(2));
    setSubmitting(true);
    setFormStatus("");

    try {
      const docRef = await addDoc(collection(db, "loans"), {
        uid: userUid,
        amount: amt,
        purpose,
        durationMonths: dur,
        interestRate: interest,
        monthlyPayment,
        finalExpectedPayment,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setLoans((prev) => [
        ...prev,
        {
          id: docRef.id,
          amount: amt,
          purpose,
          durationMonths: dur,
          interestRate: interest,
          monthlyPayment,
          finalExpectedPayment,
          status: "pending",
          createdAt: Timestamp.now(),
        },
      ]);

      setAmount("");
      setPurpose("");
      setDuration("");
      setInterestRate("");
      setFormStatus("Loan application submitted!");
    } catch (err: any) {
      setFormStatus(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================
     Sort Loans: Approved at Bottom
  ======================= */
  const sortedLoans = [...loans].sort((a, b) => {
    if (a.status === "approved" && b.status !== "approved") return 1;
    if (a.status !== "approved" && b.status === "approved") return -1;
    return 0;
  });

  /* =======================
     Render
  ======================= */

  if (loading) return <p style={{ padding: "2rem" }}>Loading loans...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>My Loans</h1>
        <button onClick={() => router.push("/dashboard")} style={styles.exitButton}>
          Exit to Dashboard
        </button>
      </div>

      {sortedLoans.length === 0 && <p style={styles.emptyText}>No loans found.</p>}

      {sortedLoans.map((loan) => (
        <div
          key={loan.id}
          style={loan.status === "approved" ? styles.approvedLoanCard : styles.loanCard}
        >
          <p>
            <strong>Amount:</strong> Ush {loan.amount.toLocaleString()}
          </p>
          <p>
            <strong>Purpose:</strong> {loan.purpose}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  loan.status === "approved"
                    ? "green"
                    : loan.status === "pending"
                    ? "orange"
                    : "red",
              }}
            >
              {loan.status}
            </span>
          </p>
          <p>
            <strong>Interest:</strong> {loan.interestRate}%
          </p>
          <p>
            <strong>Duration:</strong> {loan.durationMonths} months
          </p>
          <p>
            <strong>Monthly Payment:</strong>{' '} Ush {Number(loan.monthlyPayment || 0).toLocaleString()}
          </p>
          <p>
            <strong>Final Expected Pay:</strong>{' '} Ush {Number(loan.finalExpectedPayment || 0).toLocaleString()}
          </p>

        </div>
      ))}

      <hr style={{ margin: "2rem 0" }} />

      <h2 style={styles.title}>Apply for a Loan</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Duration (months)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          style={styles.input}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...styles.submitButton,
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Submit Loan Application"}
        </button>
      </form>

      {formStatus && <p style={{ marginTop: "0.5rem" }}>{formStatus}</p>}
    </div>
  );
}
