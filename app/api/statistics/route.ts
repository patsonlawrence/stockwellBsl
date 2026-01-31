import { getAdminDb } from "@/firebaseAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const db = getAdminDb();

    // --- 1️⃣ Members count (SAFE) ---
    const membersSnapshot = await db.collection("members").get();
    const membersCount = membersSnapshot.size;

    // --- 2️⃣ Savings ---
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

    // --- 3️⃣ Profits ---
    const investmentsSnapshot = await db
      .collection("investments")
      .where("status", "==", "resolved")
      .select("profitEarned")
      .get();

    let totalProfits = 0;
    investmentsSnapshot.forEach((doc) => {
      totalProfits += Number(doc.data().profitEarned || 0);
    });

    // --- 4️⃣ Expenditures ---
    const expendituresSnapshot = await db
      .collection("expenditures")
      .select("amount")
      .get();

    let totalExpenditures = 0;
    expendituresSnapshot.forEach((doc) => {
      totalExpenditures += Number(doc.data().amount || 0);
    });

    // --- 5️⃣ Totals ---
    const totalFund = totalSavings + totalProfits - totalExpenditures;
    const annualGrowth = lastYearTotal
      ? ((totalFund - lastYearTotal) / lastYearTotal) * 100
      : 0;

    return NextResponse.json({
      membersCount,
      totalFund,
      monthlyContributions,
      annualGrowth: `${annualGrowth.toFixed(2)}%`,
    });

  } catch (error: any) {
    console.error("STATISTICS API ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
