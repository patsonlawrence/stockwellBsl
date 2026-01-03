"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", value: 80000 },
  { month: "Feb", value: 85000 },
  { month: "Mar", value: 92000 },
  { month: "Apr", value: 100000 },
  { month: "May", value: 115000 },
  { month: "Jun", value: 125400 },
];

export default function InvestmentChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0f172a"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
