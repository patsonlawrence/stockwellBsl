import { getAdminDb } from "@/firebaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ REQUIRED for Firebase Admin

export async function GET() {
  try {
    const now = new Date();
    const db = getAdminDb();

    // --- 1️⃣ Members count (FAST, no docs loaded) ---
    const membersCountSnap = await db.collection("members").count().get();
    const membersCount = membersCountSnap.data().count || 0;

    // --- 2️⃣ Savings stats (ONLY required fields) ---
    const savingsSnapshot = await db
      .collection("savings")
      .select("submittedAmount", "createdAt")
      .get();

    let totalSavings = 0;
    let monthlyContributions = 0;
    let lastYearTotal = 0;

    savingsSnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.submittedAmount || 0);
      totalSavings += amount;

      const date =
        data.createdAt?.toDate?.() ??
        (data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000)
          : null);

      if (!date) return;

      if (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        monthlyContributions += amount;
      }

      if (date.getFullYear() === now.getFullYear() - 1) {
        lastYearTotal += amount;
      }
    });

    // --- 3️⃣ Total profits (resolved only) ---
    const investmentsSnapshot = await db
      .collection("investments")
      .where("status", "==", "resolved")
      .select("profitEarned")
      .get();

    let totalProfits = 0;
    investmentsSnapshot.forEach((doc) => {
      totalProfits += Number(doc.data().profitEarned || 0);
    });

    // --- 4️⃣ Total expenditures (amount only) ---
    const expendituresSnapshot = await db
      .collection("expenditures")
      .select("amount")
      .get();

    let totalExpenditures = 0;
    expendituresSnapshot.forEach((doc) => {
      totalExpenditures += Number(doc.data().amount || 0);
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
    console.error("STATISTICS API ERROR:", error);
    return NextResponse.json(
      { error: "Unable to fetch statistics" },
      { status: 500 }
    );
  }
}
