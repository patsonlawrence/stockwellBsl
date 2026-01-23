"use client";

import { useEffect, useState, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import app, { db } from "../../../firebaseClient";

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

const styles: Record<string, CSSProperties> = {
  container: {
  minHeight: "100vh",
  padding: "2rem",
  backgroundColor: "#1e40af", // deep blue for the page background
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
},
totalSavings: {
  color: "#16a34a", // Tailwind green-600
  fontWeight: 600,
},

  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
    padding: "1.5rem",
  },
  title: { fontSize: "1.875rem", fontWeight: 600, color: "#1e3c72", marginBottom: "1rem", textAlign: "center" },
  section: { marginBottom: "0.75rem" },
  label: { fontWeight: 600, color: "#374151" },
  //value: { color: "#111827" },
  error: { color: "red", textAlign: "center" },
};

// ---------------- Reset Password Button ----------------
function ProfileActions({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSend = async () => {
    try {
      setSending(true);
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setStatus("Password reset email sent.");
    } catch (err: any) {
      setStatus(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={handleSend}
          disabled={sending}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? "Sending..." : "Send password reset"}
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #2563eb",
            fontWeight: "bold",
            background: "#fff",
            color: "#2563eb",
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
      </div>

      {status && <p style={{ marginTop: "0.5rem" }}>{status}</p>}
    </div>
  );
}

// ---------------- My Profile Page ----------------
export default function MyProfilePage() {
  const [member, setMember] = useState<Member | null>(null);
  const [totalSavings, setTotalSavings] = useState<number | null>(null);
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
        // Fetch member document
        const memberRef = doc(db, "members", user.uid);
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
          setError("Member record not found");
          setLoading(false);
          return;
        }

        const data = memberSnap.data();
        const memberData: Member = {
          uid: user.uid,
          fullName: data?.fullName ?? "",
          email: data?.email ?? "",
          phone: data?.phone ?? "",
          dob: data?.dob ?? "",
          address: data?.address ?? "",
          membershipId: data?.membershipId ?? "",
          dateJoined: data?.dateJoined ?? "",
          initialContribution: data?.initialContribution ?? "0",
          ongoingContribution: data?.ongoingContribution ?? "0",
          sharesOwned: data?.sharesOwned ?? "0",
          status: data?.status ?? "",
          NextOfKinName: data?.NextOfKinName ?? "",
          NextOfKinPhone: data?.NextOfKinPhone ?? "",
          NextOfKinEmail: data?.NextOfKinEmail ?? "",
          NextOfKinAddress: data?.NextOfKinAddress ?? "",
          NextOfKinRelation: data?.NextOfKinRelation ?? "",
          createdAt: data?.createdAt ?? { seconds: Date.now() / 1000 },
        };

        setMember(memberData);

        // Fetch all savings for this user and sum approvedAmount
        const savingsCol = collection(db, "savings");
        const q = query(savingsCol, where("memberUid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total += Number(data.approvedAmount ?? 0);
        });

        setTotalSavings(total);

      } catch (err: any) {
        setError(err.message ?? "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading)
    return (
      <div style={styles.container}>
        <p>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
      </div>
    );

  if (!member) return null;

  const createdAt = member.createdAt?.seconds
    ? new Date(member.createdAt.seconds * 1000)
    : new Date();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{member.fullName}</h1>

        <div style={styles.section}><span style={styles.label}>Email:</span> {member.email}</div>
        <div style={styles.section}><span style={styles.label}>Phone:</span> {member.phone}</div>
        <div style={styles.section}><span style={styles.label}>DOB:</span> {member.dob}</div>
        <div style={styles.section}><span style={styles.label}>Address:</span> {member.address}</div>
        <div style={styles.section}><span style={styles.label}>Membership ID:</span> {member.membershipId}</div>
        <div style={styles.section}><span style={styles.label}>Joined:</span> {member.dateJoined || createdAt.toLocaleDateString()}</div>
        <div style={styles.section}><span style={styles.label}>Shares:</span> {member.sharesOwned}</div>
        <div style={styles.section}><span style={styles.label}>Status:</span> {member.status}</div>

        {/* Total Savings */}
        <div style={styles.section}>
  <span style={styles.sectionTitle}>Total Savings:</span>{" "}
  <span style={styles.totalSavings}>
    {totalSavings === null ? "Loading..." : `Ush: ${totalSavings.toLocaleString()}`}
  </span>
</div>


        <hr style={{ margin: "1rem 0" }} />

        <h3 style={{ color: "#1e3c72" }}>Next of Kin</h3>
        <div style={styles.section}><strong>Name:</strong> {member.NextOfKinName}</div>
        <div style={styles.section}><strong>Phone:</strong> {member.NextOfKinPhone}</div>
        <div style={styles.section}><strong>Email:</strong> {member.NextOfKinEmail}</div>
        <div style={styles.section}><strong>Address:</strong> {member.NextOfKinAddress}</div>
        <div style={styles.section}><strong>Relation:</strong> {member.NextOfKinRelation}</div>

        <ProfileActions email={member.email} />
      </div>
    </div>
  );
}
