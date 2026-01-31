import { getAdminDb } from "@/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const db = getAdminDb(); // Admin SDK Firestore

    // 1️⃣ Members count
    const membersSnapshot = await db.collection("members").get();
    const membersCount = membersSnapshot.size;

    // 2️⃣ Savings: total, monthly contributions, and last year total
    const savingsSnapshot = await db.collection("savings").get();
    let totalSavings = 0;
    let monthlyContributions = 0;
    let lastYearTotal = 0;

    savingsSnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.submittedAmount || 0);
      totalSavings += amount;

      const date = data.createdAt?.toDate?.() || new Date();
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        monthlyContributions += amount;
      }
      if (date.getFullYear() === now.getFullYear() - 1) {
        lastYearTotal += amount;
      }
    });

    // 3️⃣ TOTAL PROFITS (resolved investments)
    const investmentsSnapshot = await db.collection("investments").get();
    let totalProfits = 0;
    investmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "resolved") totalProfits += Number(data.profitEarned || 0);
    });

    // 4️⃣ TOTAL EXPENDITURES
    const expendituresSnapshot = await db.collection("expenditures").get();
    let totalExpenditures = 0;
    expendituresSnapshot.forEach((doc) => {
      const data = doc.data();
      totalExpenditures += Number(data.amount || 0);
    });

    // 5️⃣ TOTAL FUND VALUE
    const totalFund = totalSavings + totalProfits - totalExpenditures;

    // 6️⃣ Annual Growth %
    const annualGrowth = lastYearTotal
      ? ((totalFund - lastYearTotal) / lastYearTotal) * 100
      : 0;

    // 7️⃣ Return stats
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
