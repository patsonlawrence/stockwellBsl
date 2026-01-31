"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebaseClient";

interface Loan {
  id: string;
  uid: string;
  amount: number;
  purpose: string;
  interestRate: number;
  durationMonths: number;
  monthlyPayment: number;
  status: string;
  approvals?: Record<string, boolean>;
  requiredApprovals: number;
}

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.push("/login");
          return;
        }

        const memberRef = doc(db, "members", user.uid);
        const memberSnap = await getDoc(memberRef);

        // SYSTEM ADMIN fallback: if document not found, allow
        const role = memberSnap.exists() ? memberSnap.data()?.role : "admin";

        if (role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setIsAdmin(true);

        // fetch pending loans
        const snap = await getDocs(collection(db, "loans"));
        const data = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Loan, "id">) }))
          .filter((loan) => loan.status === "pending");

        setLoans(data);
      } catch (err) {
        console.error("Admin approvals error:", err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const approveLoan = async (loan: Loan) => {
    if (!auth.currentUser) return;
    const adminUid = auth.currentUser.uid;

    if (loan.approvals?.[adminUid]) return; // already approved

    const loanRef = doc(db, "loans", loan.id);

    try {
      // record admin approval
      await updateDoc(loanRef, { [`approvals.${adminUid}`]: true });

      // check if required approvals met
      const snap = await getDoc(loanRef);
      if (!snap.exists()) return;
      const updated = snap.data() as Loan;
      const approvalCount = Object.keys(updated.approvals || {}).length;

      if (approvalCount >= updated.requiredApprovals) {
        await updateDoc(loanRef, {
          status: "approved",
          approvedAt: serverTimestamp(),
        });
      }

      // refresh list
      const loanSnap = await getDocs(collection(db, "loans"));
      const pending = loanSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Loan, "id">) }))
        .filter((l) => l.status === "pending");
      setLoans(pending);
    } catch (err) {
      console.error("Error approving loan:", err);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading approvals…</p>;
  if (!isAdmin) return null;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ color: "#1e3c72" }}>Admin Requests Approvals</h1>

        <button
          onClick={goToDashboard}
          style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  }}
        >
          Exit to Dashboard
        </button>
      </div>

      {loans.length === 0 && <p>No pending Requests 🎉</p>}

      {loans.map((loan) => {
        const approvalsCount = Object.keys(loan.approvals || {}).length;
        const hasApproved = loan.approvals?.[auth.currentUser?.uid || ""];

        return (
          <div
            key={loan.id}
            style={{
              background: "#fff",
              padding: "1rem",
              borderRadius: "10px",
              marginBottom: "1rem",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
            }}
          >
            <p>
              <strong>Amount:</strong> ${loan.amount.toLocaleString()}
            </p>
            <p>
              <strong>Purpose:</strong> {loan.purpose}
            </p>
            <p>
              <strong>Duration:</strong> {loan.durationMonths} months
            </p>
            <p>
              <strong>Interest:</strong> {loan.interestRate}%
            </p>
            <p>
              <strong>Monthly:</strong> ${loan.monthlyPayment}
            </p>
            <p>
              <strong>Approvals:</strong> {approvalsCount} /{" "}
              {loan.requiredApprovals}
            </p>

            {!hasApproved && (
              <button
                onClick={() => approveLoan(loan)}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "green",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Approve
              </button>
            )}

            {hasApproved && (
              <p style={{ color: "green", fontWeight: "bold" }}>
                ✔ You have approved this loan
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
