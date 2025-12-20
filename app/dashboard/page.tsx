export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          BSL Investment Club Dashboard
        </h1>
        <p className="text-gray-600">
          Track club performance, contributions, and growth
        </p>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Fund Value" value="$125,000" />
        <DashboardCard title="Total Members" value="24" />
        <DashboardCard title="Monthly Contribution" value="$5,200" />
        <DashboardCard title="Annual Growth" value="+12.4%" />
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Investments */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Recent Investments</h2>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>Apple Inc.</span>
              <span className="text-green-600">+$1,200</span>
            </li>
            <li className="flex justify-between">
              <span>S&P 500 ETF</span>
              <span className="text-green-600">+$850</span>
            </li>
            <li className="flex justify-between">
              <span>Crypto Index Fund</span>
              <span className="text-red-600">- $300</span>
            </li>
          </ul>
        </div>

        {/* Member Contributions */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Member</th>
                <th className="py-2">Contribution</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">John D.</td>
                <td className="py-2">$1,000</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Sarah M.</td>
                <td className="py-2">$900</td>
              </tr>
              <tr>
                <td className="py-2">David K.</td>
                <td className="py-2">$850</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* Reusable Card Component */
function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}
