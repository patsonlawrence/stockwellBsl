"use client";

import { useState, useEffect, type CSSProperties } from "react";
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
} from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";


function generateMembershipId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BSL-${randomNum}`;
}

export default function MemberPage() {
  const [member, setMember] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    membershipId: "",
    dateJoined: "",
    initialContribution: "",
    ongoingContribution: "",
    sharesOwned: "",
    status: "Active",
    notes: "",
  });

  const [membersList, setMembersList] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; contribution?: string }>({});

  // Firestore collection reference
  const membersCol = collection(db, "members");

  useEffect(() => {
    // load members on mount
    fetchMembers();
    setMember((prev) => ({ ...prev, membershipId: generateMembershipId() }));
  }, []);

  const fetchMembers = async () => {
    const snapshot = await getDocs(membersCol);
    setMembersList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setMember({ ...member, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!member.email.includes("@")) newErrors.email = "Invalid email address";
    if (Number(member.initialContribution) < 0) newErrors.contribution = "Contribution must be ≥ 0";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (editingId) {
      // update existing
      const docRef = doc(db, "members", editingId);
      await updateDoc(docRef, {
  ...member,
  updatedAt: serverTimestamp(),
});
    } else {
      if (!editingId) {
  const emailQuery = query(
    membersCol,
    where("email", "==", member.email)
  );

  const emailSnapshot = await getDocs(emailQuery);

  if (!emailSnapshot.empty) {
    setErrors({ email: "Email already exists" });
    return;
  }
}
      // add new
      const res = await fetch("/api/create-member", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(member),
});
try {
  const res = await fetch("/api/create-member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create member");
  }

  alert("Member added successfully. Password setup email sent.");
} catch (error: any) {
  alert(error.message);
  return;
}



const data = await res.json();
alert("Member added. Password setup email sent.");

    }

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
      sharesOwned: "",
      status: "Active",
      notes: "",
    });

    fetchMembers();
  };

  const handleEdit = (m: any) => {
    setMember(m);
    setEditingId(m.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

const handleDelete = async (id: string, name: string) => {
  if (confirm(`Delete ${name}?`)) {
    await deleteDoc(doc(db, "members", id));
    fetchMembers();
  }
};
const handleResetPassword = async (email: string) => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent.");
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div style={styles.container}>
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

          <h2 style={styles.sectionTitle}>Investment Info</h2>
          <input type="text" name="membershipId" placeholder="Membership ID" value={member.membershipId} readOnly style={styles.input} />
          <input type="date" name="dateJoined" placeholder="Date Joined" value={member.dateJoined} onChange={handleChange} style={styles.input} />
          <input type="number" name="initialContribution" placeholder="Initial Contribution ($)" value={member.initialContribution} onChange={handleChange} style={styles.input} />
          {errors.contribution && <span style={styles.error}>{errors.contribution}</span>}
          <input type="number" name="ongoingContribution" placeholder="Ongoing Contribution ($)" value={member.ongoingContribution} onChange={handleChange} style={styles.input} />
          <input type="number" name="sharesOwned" placeholder="Shares Owned" value={member.sharesOwned} onChange={handleChange} style={styles.input} />

          <h2 style={styles.sectionTitle}>Account Info</h2>
          <select name="status" value={member.status} onChange={handleChange} style={styles.input}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <textarea name="notes" placeholder="Notes" value={member.notes} onChange={handleChange} style={styles.textarea} />

          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.submitButton}>
              {editingId ? "Save Changes" : "Add Member"}
            </button>
            <button type="button" style={styles.resetButton} 
              onClick={() => {
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
                  sharesOwned: "",
                  status: "Active",
                  notes: "",
                });
              }}
            >Reset</button>
          </div>
        </form>

        {membersList.length > 0 && (
          <div style={styles.summaryContainer}>
            <h2 style={styles.sectionTitle}>Members Summary</h2>
            {membersList.map((m) => (
              <div key={m.id} style={styles.memberCard}>
                <div>
                  <strong>{m.fullName}</strong> ({m.membershipId}) – {m.status}<br />
                  Initial: ${m.initialContribution}, Ongoing: ${m.ongoingContribution}, Shares: {m.sharesOwned}
                </div>
                <div style={styles.memberActions}>
  <button style={styles.editButton} onClick={() => handleEdit(m)}>
    Edit
  </button>

  <button
    style={styles.editButton}
    onClick={() => handleResetPassword(m.email)}
  >
    Reset Password
  </button>

  <button
    style={styles.deleteButton}
    onClick={() => handleDelete(m.id, m.fullName)}
  >
    Delete
  </button>
</div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { minHeight: "100vh", padding: "2rem", background: "linear-gradient(135deg, #1e3c72, #2a5298)", display: "flex", justifyContent: "center", alignItems: "flex-start", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", },
  card: { background: "#fff", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "600px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)", marginBottom: "2rem", },
  title: { textAlign: "center", marginBottom: "1.5rem", color: "#1e3c72" },
  sectionTitle: { marginTop: "1rem", marginBottom: "0.5rem", color: "#1e3c72" },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: "12px", marginBottom: "0.5rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem" },
  textarea: { padding: "12px", marginBottom: "1rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem", resize: "vertical", minHeight: "60px" },
  buttonContainer: { display: "flex", justifyContent: "space-between", gap: "1rem" },
  submitButton: { flex: 1, padding: "12px", backgroundColor: "#1e3c72", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  resetButton: { flex: 1, padding: "12px", backgroundColor: "#ccc", color: "#333", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  summaryContainer: { marginTop: "2rem" },
  memberCard: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", marginBottom: "0.5rem", backgroundColor: "#f0f4ff", borderRadius: "6px" },
  memberActions: { display: "flex", gap: "0.5rem" },
  editButton: { padding: "4px 8px", backgroundColor: "#ffd700", border: "none", borderRadius: "4px", cursor: "pointer" },
  deleteButton: { padding: "4px 8px", backgroundColor: "#ff4d4f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  error: { color: "red", fontSize: "0.85rem", marginBottom: "0.5rem" },
};
