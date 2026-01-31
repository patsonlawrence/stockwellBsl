// app/api/statistics/route.ts
import { getAdminDb } from "@/firebaseAdmin";
import { NextResponse } from "next/server";

// ✅ Force Node.js runtime so Admin SDK works on Vercel
export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const db = getAdminDb(); // Admin SDK Firestore

    // 1️⃣ Members count using count()
    const membersCol = db.collection("members");
    const membersCountSnapshot = await membersCol.get();
    const membersCount = membersCountSnapshot.size;

    // 2️⃣ Savings totals
    const savingsCol = db.collection("savings");
    const savingsSnapshot = await savingsCol.get();

    let totalSavings = 0;
    let monthlyContributions = 0;
    let lastYearTotal = 0;

    savingsSnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.submittedAmount || 0);
      totalSavings += amount;

      // Convert Firestore Timestamp safely
      const date = data.createdAt?.toDate?.() || new Date();
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        monthlyContributions += amount;
      }
      if (date.getFullYear() === now.getFullYear() - 1) {
        lastYearTotal += amount;
      }
    });

    // 3️⃣ TOTAL PROFITS (resolved investments)
    const investmentsCol = db.collection("investments");
    const investmentsSnapshot = await investmentsCol.get();
    let totalProfits = 0;

    investmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "resolved") {
        totalProfits += Number(data.profitEarned || 0);
      }
    });

    // 4️⃣ TOTAL EXPENDITURES
    const expendituresCol = db.collection("expenditures");
    const expendituresSnapshot = await expendituresCol.get();
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

    // ✅ Return stats
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
