"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Ene", prospects: 89 },
  { month: "Feb", prospects: 95 },
  { month: "Mar", prospects: 102 },
  { month: "Abr", prospects: 118 },
  { month: "May", prospects: 125 },
  { month: "Jun", prospects: 142 },
  { month: "Jul", prospects: 138 },
  { month: "Ago", prospects: 156 },
  { month: "Sep", prospects: 149 },
  { month: "Oct", prospects: 167 },
  { month: "Nov", prospects: 178 },
  { month: "Dic", prospects: 185 },
]

const chartConfig = {
  prospects: {
    label: "Interesados",
    color: "hsl(var(--chart-2))",
  },
}

export function ProspectsChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Interesados por Mes</CardTitle>
        <CardDescription>Número de interesados registrados mensualmente</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line
                dataKey="prospects"
                type="monotone"
                stroke="var(--color-prospects)"
                strokeWidth={2}
                dot={{ fill: "var(--color-prospects)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
