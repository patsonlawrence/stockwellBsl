// app/dashboard/members/[uid]/page.tsx
import { getAdminDb } from "@/firebaseAdmin"; // your admin Firestore
import { notFound } from "next/navigation";
import ResetPasswordButtonWrapper from "../../../../components/ResetPasswordButtonWrapper";
// inside render
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
  NextOfKinName: string;
  NextOfKinPhone: string;
  NextOfKinAddress: string;
  NextOfKinRelation: string;
  NextOfKinEmail: string;
  sharesOwned: string;
  status: string;
  createdAt: { seconds: number; nanoseconds: number }; // Firestore Timestamp
  [key: string]: any;
}


export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;  
  try {
    const adminDb = getAdminDb();
    const docRef = adminDb.collection("members").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return notFound();

    const member = docSnap.data() as Member;
    if (!member) return notFound();

    const createdAt = member.createdAt
      ? new Date(member.createdAt.seconds * 1000)
      : new Date();

    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "2rem auto",
          padding: "2rem",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 600,
            color: "#1e3c72",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          {member.fullName}
        </h1>

        <div style={{ marginBottom: "1rem" }}>
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Phone:</strong> {member.phone}</p>
          <p><strong>Date of Birth:</strong> {member.dob}</p>
          <p><strong>Address:</strong> {member.address}</p>
          <p><strong>Membership ID:</strong> {member.membershipId}</p>
          <p><strong>Date Joined:</strong> {member.dateJoined || createdAt.toLocaleDateString()}</p>
          <p><strong>Initial Contribution:</strong> {member.initialContribution}</p>
          <p><strong>Ongoing Contribution:</strong> {member.ongoingContribution}</p>
          <p><strong>Shares Owned:</strong> {member.sharesOwned}</p>
          <p><strong>Status:</strong> {member.status}</p>
        </div>

        <h2 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#1e3c72" }}>Next of Kin</h2>
        <div style={{ marginBottom: "1rem" }}>
          <p><strong>Name:</strong> {member.NextOfKinName}</p>
          <p><strong>Phone:</strong> {member.NextOfKinPhone}</p>
          <p><strong>Email:</strong> {member.NextOfKinEmail}</p>
          <p><strong>Address:</strong> {member.NextOfKinAddress}</p>
          <p><strong>Relation:</strong> {member.NextOfKinRelation}</p>
        </div>

        <ResetPasswordButtonWrapper email={member.email} />
      </div>
    );
  } catch (error: any) {
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
        Error loading member: {error.message}
      </p>
    );
  }
}
