"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { getAuth, User } from "firebase/auth";
import { db } from "@/firebaseClient";

// --------------------
// Types
// --------------------
interface Saving {
  id?: string;
  memberUid: string;
  memberName: string;
  memberPhoto?: string;
  notes?: string;
  submittedAmount: number;
  submittedDate: string;
  approvedAmount?: number;
  approvedDate?: string;
  status: "pending" | "approved";
  approvals: string[];
}

// --------------------
// Admin UID → Name mapping
// --------------------
const ADMIN_NAMES: Record<string, string> = {
  "Bs2uAtvwYYRaITJ2tfyyGE2Y1w62": "SystemAdmin",
  "admin2UID": "Bob",
  "admin3UID": "Charlie"
};

// --------------------
// Component
// --------------------
export default function SavingsPage() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const previousSavings = useRef<Map<string, string>>(new Map());

  const savingsCol = collection(db, "savings");
  const ADMIN_UIDS = Object.keys(ADMIN_NAMES);
  const isAdmin = user ? ADMIN_UIDS.includes(user.uid) : false;

  const [newSaving, setNewSaving] = useState<Partial<Saving>>({
    submittedAmount: 0,
    submittedDate: new Date().toISOString().split("T")[0],
    notes: "",
    memberPhoto: ""
  });

  // --------------------
  // Wait for Firebase Auth
  // --------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) setUser(u);
    });
    return () => unsubscribe();
  }, [auth]);

  // --------------------
  // Real-time fetch savings
  // --------------------
  useEffect(() => {
    if (!user) return;

    const q = query(savingsCol, orderBy("submittedDate", "desc"));


    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data: Saving[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Saving)
        }));

        // Notify member of new approvals
        if (!isAdmin) {
          data.forEach(s => {
            const prevStatus = previousSavings.current.get(s.id || "");
            if (s.status === "approved" && prevStatus !== "approved") {
              setNotifications(prev => [
                ...prev,
                `Your saving of $${s.submittedAmount} on ${s.submittedDate} is approved!`
              ]);
            }
            previousSavings.current.set(s.id || "", s.status);
          });
        }

        // Filter members to only approved entries for non-admins
        setSavings(isAdmin ? data : data.filter(s => s.status === "approved"));
      },
      err => {
        console.error(err);
        setError("Failed to load savings");
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --------------------
  // Member or admin submits a saving
  // --------------------
  const addSaving = async () => {
    if (!user) return;

    if (!newSaving.submittedAmount || newSaving.submittedAmount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      await addDoc(savingsCol, {
        memberUid: user.uid,
        memberName: user.displayName || "Member",
        submittedAmount: newSaving.submittedAmount,
        submittedDate: newSaving.submittedDate,
        notes: newSaving.notes || "",
        memberPhoto: newSaving.memberPhoto || "",
        approvals: [],
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Reset form
      setNewSaving({
        submittedAmount: 0,
        submittedDate: new Date().toISOString().split("T")[0],
        notes: "",
        memberPhoto: ""
      });
    } catch {
      alert("Failed to submit saving");
    }
  };
  const handleExit = () => {
    localStorage.removeItem("authToken");
    router.push("/dashboard");
  };

  // --------------------
  // Admin approves
  // --------------------
  const approveSaving = async (s: Saving, approvedAmount?: number, approvedDate?: string) => {
    if (!isAdmin || !user || !s.id) return;
    if (s.approvals.includes(user.uid)) return;

    const newApprovals = [...s.approvals, user.uid];
    const newStatus = newApprovals.length >= 3 ? "approved" : "pending";

    try {
      await updateDoc(doc(db, "savings", s.id), {
        approvals: newApprovals,
        status: newStatus,
        approvedAmount: approvedAmount ?? s.submittedAmount,
        approvedDate: approvedDate ?? s.submittedDate
      });
    } catch {
      alert("Failed to approve saving");
    }
  };

  if (!user) return <div>Loading...</div>;

  // --------------------
  // Render
  // --------------------
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Savings</h1>

      {/* Notifications for members */}
      {!isAdmin && notifications.map((note, i) => (
        <div key={i} style={styles.notification}>{note}</div>
      ))}

      {/* Everyone can submit savings */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Submit Your Saving</h2>

        <input
          style={styles.input}
          type="number"
          placeholder="Amount"
          value={newSaving.submittedAmount}
          onChange={e => setNewSaving({ ...newSaving, submittedAmount: Number(e.target.value) })}
        />

        <input
          style={styles.input}
          type="date"
          value={newSaving.submittedDate}
          onChange={e => setNewSaving({ ...newSaving, submittedDate: e.target.value })}
        />

        <textarea
          style={styles.textarea}
          placeholder="Notes (optional)"
          value={newSaving.notes}
          onChange={e => setNewSaving({ ...newSaving, notes: e.target.value })}
        />

        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setNewSaving({ ...newSaving, memberPhoto: reader.result as string });
            reader.readAsDataURL(file);
          }}
        />

        <button style={styles.primaryButton} onClick={addSaving}>
          Submit
        </button>
        <button style={styles.exitButton} onClick={handleExit}>Exit</button>
      </div>

      {/* Savings summary */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Savings Summary</h2>

        {error && <p style={styles.error}>{error}</p>}
        {!savings.length && <p>No savings recorded yet.</p>}

        {savings.map((s, i) => (
          <div key={i} style={styles.listItem}>
            <strong>{s.memberName}</strong>
            {s.memberPhoto && <img src={s.memberPhoto} alt="Photo" style={styles.photo} />}
            {s.notes && <p>{s.notes}</p>}

            <div style={styles.subText}>
              Submitted Amount: ${s.submittedAmount} | Submitted Date: {s.submittedDate}
            </div>

            {isAdmin && s.status === "pending" && (
              <div style={{ marginTop: "5px" }}>
                <input
                  type="number"
                  placeholder="Approved Amount"
                  defaultValue={s.submittedAmount}
                  onChange={e => (s.approvedAmount = Number(e.target.value))}
                  style={{ marginRight: "5px", width: "120px" }}
                />
                <input
                  type="date"
                  defaultValue={s.submittedDate}
                  onChange={e => (s.approvedDate = e.target.value)}
                  style={{ marginRight: "5px", width: "140px" }}
                />
                <button
                  style={styles.approveButton}
                  onClick={() => approveSaving(s, s.approvedAmount, s.approvedDate)}
                >
                  Approve
                </button>
              </div>
            )}

            {s.status === "approved" && <div style={styles.approvedBadge}>Approved ✅</div>}

            {s.approvals.length > 0 && (
              <div style={styles.approvalsList}>
                Approved by: {s.approvals.map(uid => ADMIN_NAMES[uid] || uid).join(", ")}
              </div>
            )}

            {s.status === "approved" && s.approvedAmount !== undefined && (
              <div style={styles.subText}>
                Approved Amount: ${s.approvedAmount} | Approved Date: {s.approvedDate}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------
// Styles (unchanged)
// --------------------
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "2rem",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: { color: "#fff", textAlign: "center", marginBottom: "2rem" },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "10px",
    maxWidth: "600px",
    margin: "0 auto 2rem",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  sectionTitle: { marginBottom: "1rem", color: "#1e3c72" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "80px",
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
  approveButton: {
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  listItem: { padding: "10px", borderBottom: "1px solid #eee", marginBottom: "10px" },
  subText: { fontSize: "0.9rem", color: "#555" },
  error: { color: "red" },
  notification: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "10px 15px",
    borderRadius: "6px",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  approvedBadge: {
    display: "inline-block",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
  exitButton: { padding: "10px 16px", fontSize: "1rem", fontWeight: "bold", backgroundColor: "#f0ba65", border: "none", borderRadius: "6px", cursor: "pointer", minWidth: "100px", },
  approvalsList: { fontSize: "0.85rem", color: "#555", marginTop: "3px" },
  photo: { maxWidth: "100%", marginTop: "5px", borderRadius: "6px" },
  
};
