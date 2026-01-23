// app/api/statistics/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../firebase";
import { collection, getCountFromServer, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const now = new Date();

    // 1️⃣ Members count
    const membersCol = collection(db, "members");
    const membersSnapshot = await getCountFromServer(membersCol);
    const membersCount = membersSnapshot.data().count || 0;

    // 2️⃣ Savings: total, monthly contributions, and last year total
    const savingsCol = collection(db, "savings");
    const savingsSnapshot = await getDocs(savingsCol);

    let totalSavings = 0;
    let monthlyContributions = 0;
    let lastYearTotal = 0;

    savingsSnapshot.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.submittedAmount || 0);

      totalSavings += amount;

      const rawDate = data.createdAt;
      const date = rawDate instanceof Date ? rawDate : rawDate?.toDate?.();
      if (!date) return;

      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        monthlyContributions += amount;
      }

      if (date.getFullYear() === now.getFullYear() - 1) {
        lastYearTotal += amount;
      }
    });

    // 3️⃣ TOTAL PROFITS (resolved investments only)
    const investmentsCol = collection(db, "investments");
    const investmentsSnapshot = await getDocs(investmentsCol);

    let totalProfits = 0;

    investmentsSnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.status === "resolved") {
        totalProfits += Number(data.profitEarned || 0);
      }
    });

    // 4️⃣ TOTAL EXPENDITURES
    const expendituresCol = collection(db, "expenditures");
    const expendituresSnapshot = await getDocs(expendituresCol);

    let totalExpenditures = 0;

    expendituresSnapshot.forEach((doc) => {
      const data = doc.data();
      totalExpenditures += Number(data.amount || 0);
    });

    // 5️⃣ TOTAL FUND VALUE (🔥 FINAL TRUTH 🔥)
    const totalFund = totalSavings + totalProfits - totalExpenditures;

    // 6️⃣ Annual Growth %
    const annualGrowth = lastYearTotal
      ? ((totalFund - lastYearTotal) / lastYearTotal) * 100
      : 0;    

    // 7️⃣ Return stats
    return NextResponse.json({
      membersCount: membersCount || 0,
      totalFund: totalFund || 0,
      monthlyContributions: monthlyContributions || 0,
      annualGrowth: `${annualGrowth.toFixed(2)}%` || "0%",
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Unable to fetch stats" },
      { status: 500 }
    );
  }
}
