"use client";

import { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  onAuthStateChanged,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import app, { db } from "@/firebaseClient";

/* ===================== TYPES ===================== */

interface Transaction {
  id: string;
  approvedAmount: number;
  type: string;
  status: string;
  createdAt?: { seconds: number };
}

interface Member {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  membershipId: string;
  dateJoined: string;
  initialContribution: string;
  ongoingContribution: string;
  sharesOwned: string;
  status: string;
  NextOfKinName: string;
  NextOfKinPhone: string;
  NextOfKinEmail: string;
  NextOfKinAddress: string;
  NextOfKinRelation: string;
  createdAt: { seconds: number };
}

/* ===================== STYLES ===================== */

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    backgroundColor: "#1e40af",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
    padding: "2rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: 600,
    color: "#1e3c72",
    textAlign: "center",
    marginBottom: "1rem",
  },
  section: { marginBottom: "0.75rem" },
  label: { fontWeight: 600 },
  value: { color: "#1f2937" },
  totalSavings: { color: "#16a34a", fontWeight: 600 },
  error: { color: "red", textAlign: "center" },
  table: { width: "100%", marginTop: "1rem", borderCollapse: "collapse" },
  th: { padding: "8px", borderBottom: "1px solid #e5e7eb", fontWeight: 600, textAlign: "left", backgroundColor: "#f3f4f6" },
  td: { padding: "8px", borderBottom: "1px solid #e5e7eb" },
  nextOfKin: { marginBottom: "1rem" },
};

/* ===================== BUTTON COMPONENT ===================== */

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
}

function Button({ children, variant = "primary", onClick, disabled }: ButtonProps) {
  const baseStyle: CSSProperties = {
    padding: "0.65rem 1.4rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
  };

  const variantStyle: CSSProperties =
    variant === "primary"
      ? { backgroundColor: "#1e40af", color: "#fff" }
      : { backgroundColor: "#e5e7eb", color: "#1e3c72" };

  const hoverStyle: CSSProperties =
    variant === "primary"
      ? { backgroundColor: "#1e3a8a" }
      : { backgroundColor: "#d1d5db" };

  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...(hover && !disabled ? hoverStyle : {}),
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </button>
  );
}

/* ===================== PROFILE ACTIONS ===================== */

function ProfileActions({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    if (!email) return;
    try {
      setSending(true);
      await sendPasswordResetEmail(getAuth(app), email);
      setStatus("Password reset email sent.");
    } catch (e: any) {
      setStatus(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <Button onClick={handleReset} disabled={sending}>
        {sending ? "Sending..." : "Reset Password"}
      </Button>
      <Button variant="secondary" onClick={() => router.push("/dashboard")}>
        Dashboard
      </Button>
      {status && <p style={{ color: "#16a34a" }}>{status}</p>}
    </div>
  );
}

/* ===================== MAIN PROFILE PAGE ===================== */

export default function MyProfilePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [showStatement, setShowStatement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth(app);

    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      try {
        // ===== MEMBER =====
        const memberRef = doc(db, "members", user.uid);
        const memberDoc = await getDoc(memberRef);
        let memberData: Member;

        if (memberDoc.exists()) {
          const data = memberDoc.data();
          memberData = {
            uid: data.uid || user.uid,
            fullName: data.fullName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            dob: data.dob || "",
            address: data.address || "",
            membershipId: data.membershipId || "",
            dateJoined: data.dateJoined || "",
            initialContribution: data.initialContribution || "0",
            ongoingContribution: data.ongoingContribution || "0",
            sharesOwned: data.sharesOwned || "0",
            status: data.status || "Active",
            NextOfKinName: data.NextOfKinName || "",
            NextOfKinPhone: data.NextOfKinPhone || "",
            NextOfKinEmail: data.NextOfKinEmail || "",
            NextOfKinAddress: data.NextOfKinAddress || "",
            NextOfKinRelation: data.NextOfKinRelation || "",
            createdAt: data.createdAt || { seconds: Math.floor(Date.now() / 1000) },
          };
        } else {
          // Create default member if not exists
          memberData = {
            uid: user.uid,
            fullName: user.displayName || "",
            email: user.email || "",
            phone: "",
            dob: "",
            address: "",
            membershipId: "",
            dateJoined: new Date().toISOString(),
            initialContribution: "0",
            ongoingContribution: "0",
            sharesOwned: "0",
            status: "Active",
            NextOfKinName: "",
            NextOfKinPhone: "",
            NextOfKinEmail: "",
            NextOfKinAddress: "",
            NextOfKinRelation: "",
            createdAt: { seconds: Math.floor(Date.now() / 1000) },
          };
          await setDoc(memberRef, memberData, { merge: true });
        }

        setMember(memberData);

        // ===== TRANSACTIONS =====
        const q = query(collection(db, "savings"), where("memberUid", "==", user.uid));
        const snap = await getDocs(q);

        let total = 0;
        const txns: Transaction[] = [];

        snap.forEach((d) => {
          const data = d.data();
          const amount = Number(data.approvedAmount ?? 0);
          total += amount;

          txns.push({
            id: d.id,
            approvedAmount: amount,
            type: data.type ?? "Savings",
            status: data.status ?? "Approved",
            createdAt: data.createdAt,
          });
        });

        setTotalSavings(total);
        setTransactions(txns);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>;
  if (!member) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Member Info */}
        <h1 style={styles.title}>{member.fullName || "Unnamed Member"}</h1>

        <div style={styles.section}>
          <span style={styles.label}>Email:</span>{" "}
          <span style={styles.value}>{member.email || "N/A"}</span>
        </div>
        <div style={styles.section}>
          <span style={styles.label}>Phone:</span>{" "}
          <span style={styles.value}>{member.phone || "N/A"}</span>
        </div>
        <div style={styles.section}>
          <span style={styles.label}>Address:</span>{" "}
          <span style={styles.value}>{member.address || "N/A"}</span>
        </div>
        <div style={styles.section}>
          <span style={styles.label}>Membership ID:</span>{" "}
          <span style={styles.value}>{member.membershipId || "N/A"}</span>
        </div>
        <div style={styles.section}>
          <span style={styles.label}>Status:</span>{" "}
          <span style={styles.value}>{member.status || "N/A"}</span>
        </div>

        <div style={styles.section}>
          <span style={styles.label}>Total Savings:</span>{" "}
          <span style={styles.totalSavings}>Ush {totalSavings.toLocaleString()}</span>
        </div>

        {/* Show Transactions */}
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <Button onClick={() => setShowStatement(!showStatement)}>
            {showStatement ? "Hide Statement" : "View Statement"}
          </Button>
        </div>

        {showStatement && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={styles.td}>No transactions</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={styles.td}>
                      {tx.createdAt?.seconds
                        ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={styles.td}>{tx.type || "N/A"}</td>
                    <td style={{ ...styles.td, textAlign: "right" }}>{tx.approvedAmount.toLocaleString()}</td>
                    <td style={styles.td}>{tx.status || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <hr style={{ margin: "1.5rem 0", borderColor: "#e2e8f0" }} />

        {/* Next of Kin */}
        <h3>Next of Kin</h3>
        {member.NextOfKinName ? (
          <div style={styles.nextOfKin}>
            <p>
              <span style={styles.label}>Name:</span>{" "}
              <span style={styles.value}>{member.NextOfKinName}</span>
            </p>
            <p>
              <span style={styles.label}>Phone:</span>{" "}
              <span style={styles.value}>{member.NextOfKinPhone || "N/A"}</span>
            </p>
            <p>
              <span style={styles.label}>Relation:</span>{" "}
              <span style={styles.value}>{member.NextOfKinRelation || "N/A"}</span>
            </p>
          </div>
        ) : (
          <p style={{ color: "#64748b" }}>No Next of Kin info</p>
        )}

        {/* Profile Actions */}
        <ProfileActions email={member.email || ""} />
      </div>
    </div>
  );
}
