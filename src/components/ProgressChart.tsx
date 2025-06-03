
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface ChartData {
  date?: string;
  value: number;
  name?: string;
}

interface ProgressChartProps {
  title: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'pie';
  color?: string;
  unit?: string;
}

export function ProgressChart({ 
  title, 
  data, 
  type, 
  color = "#00FF66",
  unit = ""
}: ProgressChartProps) {
  const COLORS = ['#00FF66', '#00CC52', '#00993D', '#006628'];

  return (
    <Card className="bg-dark-bg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' && (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#fff" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#fff" 
                  fontSize={12}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color} 
                  strokeWidth={3}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
            {type === 'bar' && (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#fff" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#fff" 
                  fontSize={12}
                  tickFormatter={(value) => `${value}${unit}`}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {type === 'pie' && (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
