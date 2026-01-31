import { getAdminDb } from "@/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const db = getAdminDb(); // Admin SDK Firestore

    // --- 1️⃣ Members count ---
    const membersCount = await db.collection("members").count().get()
      .then(snapshot => snapshot.data().count || 0)
      .catch(() => 0); // fallback

    // --- 2️⃣ Savings stats ---
    const savingsSnapshot = await db.collection("savings").get();
    let totalSavings = 0;
    let monthlyContributions = 0;
    let lastYearTotal = 0;

    savingsSnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.submittedAmount || 0);
      totalSavings += amount;

      // ✅ Safely parse createdAt
      let date: Date;
      if (data.createdAt?.toDate) {
        date = data.createdAt.toDate();
      } else if (data.createdAt?.seconds) {
        date = new Date(data.createdAt.seconds * 1000);
      } else {
        date = now; // fallback
      }

      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        monthlyContributions += amount;
      }
      if (date.getFullYear() === now.getFullYear() - 1) {
        lastYearTotal += amount;
      }
    });

    // --- 3️⃣ Total profits (resolved investments) ---
    const investmentsSnapshot = await db.collection("investments").get();
    let totalProfits = 0;

    investmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data?.status === "resolved") {
        totalProfits += Number(data.profitEarned || 0);
      }
    });

    // --- 4️⃣ Total expenditures ---
    const expendituresSnapshot = await db.collection("expenditures").get();
    let totalExpenditures = 0;

    expendituresSnapshot.forEach((doc) => {
      const data = doc.data();
      totalExpenditures += Number(data?.amount || 0);
    });

    // --- 5️⃣ Total fund value ---
    const totalFund = totalSavings + totalProfits - totalExpenditures;

    // --- 6️⃣ Annual growth % ---
    const annualGrowth = lastYearTotal
      ? ((totalFund - lastYearTotal) / lastYearTotal) * 100
      : 0;

    // --- 7️⃣ Return stats ---
    return NextResponse.json({
      membersCount,
      totalFund,
      monthlyContributions,
      annualGrowth: `${annualGrowth.toFixed(2)}%`,
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Unable to fetch stats" },
      { status: 500 }
    );
  }
}
