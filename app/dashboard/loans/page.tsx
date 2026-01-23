"use client";

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
import { useRouter } from "next/navigation"; // Next.js router for navigation
import app, { db } from "../../../firebaseClient";

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  interestRate: number;
  durationMonths: number;
  monthlyPayment: number;
  startDate?: Timestamp;
  createdAt?: Timestamp;
}

export default function LoansPage() {
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  // Fetch loans
  useEffect(() => {
    const auth = getAuth(app);

    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      setUserUid(user.uid);

      try {
        const q = query(collection(db, "loans"), where("uid", "==", user.uid));
        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
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

    return () => unsub();
  }, []);

  // Loan application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) return;

    const amt = parseFloat(amount);
    const dur = parseInt(duration);
    const interest = parseFloat(interestRate);

    if (!amt || !dur || !interest || !purpose) {
      setFormStatus("Please fill all fields correctly");
      return;
    }

    const monthlyPayment = parseFloat(
      ((amt * (1 + interest / 100)) / dur).toFixed(2)
    );

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
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setLoans((prev) => [
        ...prev,
        {
          id: docRef.id,
          uid: userUid,
          amount: amt,
          purpose,
          durationMonths: dur,
          interestRate: interest,
          monthlyPayment,
          status: "pending",
          createdAt: Timestamp.now(),
        },
      ]);

      // reset form
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

  if (loading) return <p style={{ padding: "2rem" }}>Loading loans...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "0 1rem" }}>
      {/* Header + Exit Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ color: "#1e3c72" }}>My Loans</h1>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: "#ef4444",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Exit to Dashboard
        </button>
      </div>

      {/* Loan list */}
      {loans.length === 0 && <p>No loans found.</p>}
      {loans.map((loan) => (
        <div
          key={loan.id}
          style={{
            background: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
            transition: "transform 0.2s",
          }}
        >
          <p>
            <strong>Amount:</strong> ${loan.amount.toLocaleString()}
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
            <strong>Monthly Payment:</strong> ${loan.monthlyPayment}
          </p>
        </div>
      ))}

      <hr style={{ margin: "2rem 0" }} />

      {/* Loan application form */}
      <h2 style={{ color: "#1e3c72", marginBottom: "1rem" }}>
        Apply for a Loan
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          maxWidth: 400,
        }}
      >
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          placeholder="Duration (months)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
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
