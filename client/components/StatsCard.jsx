// components/StatsCard.jsx
export function StatsCard({ title, value, delta, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
      <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
      <div className="text-3xl font-semibold text-gray-800">{value}</div>
      {delta && (
        <div
          className={`text-sm mt-1 ${
            delta.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {delta}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-2">{description}</div>
    </div>
  );
}




