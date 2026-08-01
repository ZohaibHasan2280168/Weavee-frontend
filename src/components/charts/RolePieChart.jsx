import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

const DEFAULT_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F43F5E", "#3B82F6", "#3DD598", "#F97316"
];

export default function RolePieChart({ data }) {
  const navigate = useNavigate();

  const handleClick = (entry) => {
    if (entry?.name) navigate(`/role/${entry.name.toLowerCase()}`);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          onClick={handleClick}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
