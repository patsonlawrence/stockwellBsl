"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { getAuth, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

import { useRouter } from "next/navigation";

// --------------------
// Define Member type
// --------------------
interface Member {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  membershipId: string;
  dateJoined: string;
  initialContribution: string;
  ongoingContribution: string;
  NextOfKinName: string;
  NextOfKinPhone: string;
  NextOfKinAddress: string;
  NextOfKinRelation: string;
  NextOfKinEmail: string;
  sharesOwned: string;
  status: string;
  notes: string;
  role: string; // "member" or "admin"
}

// --------------------
// Generate Membership ID
// --------------------
function generateMembershipId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BSL-${randomNum}`;
}

// --------------------
// Member Page Component
// --------------------
export default function MemberPage() {
  const router = useRouter();
  const auth = getAuth();

  // ---- Declare all hooks at the top ----
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [member, setMember] = useState<Member>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    membershipId: generateMembershipId(),
    dateJoined: "",
    initialContribution: "",
    ongoingContribution: "",
    NextOfKinName: "",
    NextOfKinPhone: "",
    NextOfKinAddress: "",
    NextOfKinRelation: "",
    NextOfKinEmail: "",
    sharesOwned: "",
    status: "Active",
    notes: "",
    role: "member",
  });

  //const [membersList, setMembersList] = useState<Member[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; contribution?: string }>({});
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const membersCol = collection(db, "members");
  const SYSTEM_ADMIN_UID = "Bs2uAtvwYYRaITJ2tfyyGE2Y1w62";

  // ✅ Declare isSystemAdmin AFTER currentUser is known
  const isSystemAdmin = auth.currentUser?.uid === SYSTEM_ADMIN_UID;

  // --------------------
  // Check current user role & redirect if not logged in
  // --------------------
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const ADMIN_UID = "Bs2uAtvwYYRaITJ2tfyyGE2Y1w62"; // put your Firebase Auth UID

    if (user.uid === ADMIN_UID) {
      setCurrentUserRole("admin"); // bypass Firestore check
      return;
    }

      const docRef = doc(db, "members", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        router.push("/login");
        return;
      }

      const data = docSnap.data();
      setCurrentUserRole(data.role || "member");
    };

    fetchUserRole();
  }, [auth, router]);

  // --------------------
  // Fetch all members
  // --------------------
  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(membersCol);
      const data: Member[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as Member),
      }));
      setMembersList(data);
    } catch (err: any) {
      console.error("Error fetching members:", err.message);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // --------------------
  // Handle input changes
  // --------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  // --------------------
  // Validation
  // --------------------
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!member.email.includes("@")) newErrors.email = "Invalid email address";
    if (Number(member.initialContribution) < 0) newErrors.contribution = "Contribution must be ≥ 0";
    return newErrors;
  };

  // --------------------
  // Submit member (create/update)
  // --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      if (editingId) {
        // Update existing member
        const docRef = doc(db, "members", editingId);
        await updateDoc(docRef, {
          ...member,
          updatedAt: serverTimestamp(),
        });
        alert("Member updated successfully.");
      } else {
  // Check email uniqueness (optional but OK)
  const emailQuery = query(membersCol, where("email", "==", member.email));
  const emailSnapshot = await getDocs(emailQuery);
  if (!emailSnapshot.empty) {
    setErrors({ email: "Email already exists" });
    return;
  }

  // 🔥 CALL YOUR ADMIN API (THIS IS THE KEY)
  const res = await fetch("/api/create-member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create member");
  }

  // ✅ NOW Firebase can send the email
  await sendPasswordResetEmail(auth, member.email);

  alert("Member added successfully. Password setup email sent.");
}

    } catch (err: any) {
      alert(err.message);
      return;
    }

    // Reset form
    setEditingId(null);
    setMember({
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      membershipId: generateMembershipId(),
      dateJoined: "",
      initialContribution: "",
      ongoingContribution: "",
      NextOfKinName: "",
      NextOfKinPhone: "",
      NextOfKinAddress: "",
      NextOfKinRelation: "",
      NextOfKinEmail: "",
      sharesOwned: "",
      status: "Active",
      notes: "",
      role: "member",
    });

    fetchMembers();
  };

  // --------------------
  // Edit member
  // --------------------
  const handleEdit = async (docId: string) => {
    setEditingId(docId);
    const docRef = doc(db, "members", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Member;
      setMember({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: data.dob || "",
        address: data.address || "",
        membershipId: data.membershipId || "",
        dateJoined: data.dateJoined || "",
        initialContribution: data.initialContribution || "",
        ongoingContribution: data.ongoingContribution || "",
        NextOfKinName: data.NextOfKinName || "",
        NextOfKinPhone: data.NextOfKinPhone || "",
        NextOfKinAddress: data.NextOfKinAddress || "",
        NextOfKinRelation: data.NextOfKinRelation || "",
        NextOfKinEmail: data.NextOfKinEmail || "",
        sharesOwned: data.sharesOwned || "",
        status: data.status || "Active",
        notes: data.notes || "",
        role: data.role || "member",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --------------------
  // Delete member
  // --------------------
  const handleDelete = async (id: string, name: string) => {
  if (!isSystemAdmin) {
    alert("Contact system administrator for this action.");
    return;
  }

  if (confirm(`Delete ${name}? This action is irreversible.`)) {
    await deleteDoc(doc(db, "members", id));
    fetchMembers();
  }
};


  // --------------------
  // Reset password
  // --------------------
  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --------------------
  // Exit
  // --------------------
  const handleExit = () => {
    localStorage.removeItem("authToken");
    router.push("/dashboard");
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div style={styles.container}>
      {/* Only admins can add/edit members */}
      {currentUserRole === "admin" && (
        <div style={styles.card}>
          <h1 style={styles.title}>{editingId ? "Edit Member" : "Add New Member"}</h1>

          <form onSubmit={handleSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Personal Info</h2>
            <input type="text" name="fullName" placeholder="Full Name" value={member.fullName} onChange={handleChange} style={styles.input} required />
            <input type="email" name="email" placeholder="Email" value={member.email} onChange={handleChange} style={styles.input} required />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
            <input type="tel" name="phone" placeholder="Phone" value={member.phone} onChange={handleChange} style={styles.input} />
            <input type="date" name="dob" placeholder="Date of Birth" value={member.dob} onChange={handleChange} style={styles.input} required />
            <input type="text" name="address" placeholder="Address" value={member.address} onChange={handleChange} style={styles.input} />
            <input type="text" name="NextOfKinName" placeholder="Next Of Kin Name" value={member.NextOfKinName} onChange={handleChange} style={styles.input} />
            <input type="tel" name="NextOfKinPhone" placeholder="Next Of Kin Phone" value={member.NextOfKinPhone} onChange={handleChange} style={styles.input} />
            <input type="text" name="NextOfKinAddress" placeholder="Next Of Kin Address" value={member.NextOfKinAddress} onChange={handleChange} style={styles.input} />
            <input type="text" name="NextOfKinRelation" placeholder="Next Of Kin Relation" value={member.NextOfKinRelation} onChange={handleChange} style={styles.input} />
            <input type="email" name="NextOfKinEmail" placeholder="Next Of Kin Email" value={member.NextOfKinEmail} onChange={handleChange} style={styles.input} />

            <h2 style={styles.sectionTitle}>Investment Info</h2>
            <input type="text" name="membershipId" placeholder="Membership ID" value={member.membershipId} readOnly style={styles.input} />
            <input type="date" name="dateJoined" placeholder="Date Joined" value={member.dateJoined} onChange={handleChange} style={styles.input} />
            <input type="number" name="initialContribution" placeholder="Initial Contribution (Ush)" value={member.initialContribution} onChange={handleChange} style={styles.input} />
            {errors.contribution && <span style={styles.error}>{errors.contribution}</span>}
            <input type="number" name="ongoingContribution" placeholder="Ongoing Contribution (Ush)" value={member.ongoingContribution} onChange={handleChange} style={styles.input} />
            <input type="number" name="sharesOwned" placeholder="Shares Owned" value={member.sharesOwned} onChange={handleChange} style={styles.input} />

            <h2 style={styles.sectionTitle}>Account Info</h2>
            <select name="status" value={member.status} onChange={handleChange} style={styles.input}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select name="role" value={member.role} onChange={handleChange} style={styles.input}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <textarea name="notes" placeholder="Notes" value={member.notes} onChange={handleChange} style={styles.textarea} />

            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.submitButton}>
                {editingId ? "Save Changes" : "Add Member"}
              </button>
              <button type="button" style={styles.resetButton} onClick={() => {
                setEditingId(null);
                setMember({
                  fullName: "",
                  email: "",
                  phone: "",
                  dob: "",
                  address: "",
                  membershipId: generateMembershipId(),
                  dateJoined: "",
                  initialContribution: "",
                  ongoingContribution: "",
                  NextOfKinName: "",
                  NextOfKinPhone: "",
                  NextOfKinAddress: "",
                  NextOfKinRelation: "",
                  NextOfKinEmail: "",
                  sharesOwned: "",
                  status: "Active",
                  notes: "",
                  role: "member",
                });
              }}>Reset</button>
              
            </div>
          </form>
        </div>
      )}

      {/* Members Summary (Read-Only for non-admins) */}
      {membersList.length > 0 && (
        <div style={styles.summaryContainer}>
          <button style={styles.exitButton} onClick={handleExit}>Exit</button>
          <h2 style={styles.sectionTitle}>Members Summary</h2>
          {membersList.map((m) => (
        <div key={m.membershipId} style={styles.memberCard}><div>
    <strong>{m.fullName}</strong> ({m.membershipId}) – {m.status}<br />
    Initial: Ush: {(m.initialContribution ?? 0).toLocaleString()}, Ongoing: Ush: {(m.ongoingContribution ?? 0).toLocaleString()}, Shares: {(m.sharesOwned ?? 0).toLocaleString()}
  </div>
  {currentUserRole === "admin" && (
    <div style={styles.memberActions}>
      <button style={styles.editButton} onClick={() => handleEdit(m.membershipId)}>Edit</button>
      <button style={styles.editButton} onClick={() => handleResetPassword(m.email)}>Reset Password</button>
      
    </div>
    
  )}
  {isSystemAdmin && (
    <div style={styles.memberActions}>
      <button style={styles.deleteButton} onClick={() => handleDelete(m.membershipId, m.fullName)}>Delete</button>
    </div>
    )}
</div>

          ))}
        </div>
      )}
    </div>
  );
}

// --------------------
// Styles
// --------------------
const styles: Record<string, CSSProperties> = {
  container: { minHeight: "100vh", padding: "2rem", background: "linear-gradient(135deg, #1e3c72, #2a5298)", display: "flex", justifyContent: "center", alignItems: "flex-start", flexDirection: "column",fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", },
  card: { background: "#fff", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)", marginBottom: "2rem" },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#1e3c72" },
  sectionTitle: { marginTop: "1rem", marginBottom: "0.5rem", color: "#1e3c72" },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: "12px", marginBottom: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" },
  textarea: { padding: "12px", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem", resize: "vertical", minHeight: "60px" },
  buttonContainer: { display: "flex", justifyContent: "space-between", gap: "1rem" },
  submitButton: { flex: 1, padding: "12px", backgroundColor: "#1e3c72", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  resetButton: { flex: 1, padding: "12px", backgroundColor: "#ccc", color: "#333", border: "none",flexDirection: "column", // stack content vertically
  alignItems: "flex-start", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  summaryContainer: { marginTop: "2rem", width: "100%", maxWidth: "800px" },
  memberCard: { display: "flex",  flexDirection: "column", alignItems: "flex-start", padding: "10px",  marginBottom: "0.5rem",  backgroundColor: "#f0f4ff",  borderRadius: "6px", },
  memberActions: { display: "flex", gap: "0.5rem", marginTop: "0.5rem" },
  editButton: { padding: "4px 8px", backgroundColor: "#ffd700", border: "none", borderRadius: "4px", cursor: "pointer" },
  deleteButton: { padding: "4px 8px", backgroundColor: "#ff4d4f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  exitButton: { padding: "10px 16px", fontSize: "1rem", fontWeight: "bold", backgroundColor: "#f0ba65", border: "none", borderRadius: "6px", cursor: "pointer", minWidth: "100px", },
  error: { color: "red", fontSize: "0.85rem", marginBottom: "0.5rem" },
};
