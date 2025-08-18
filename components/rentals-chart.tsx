"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { month: "Ene", rentals: 45 },
  { month: "Feb", rentals: 52 },
  { month: "Mar", rentals: 48 },
  { month: "Abr", rentals: 61 },
  { month: "May", rentals: 55 },
  { month: "Jun", rentals: 67 },
  { month: "Jul", rentals: 72 },
  { month: "Ago", rentals: 69 },
  { month: "Sep", rentals: 58 },
  { month: "Oct", rentals: 63 },
  { month: "Nov", rentals: 71 },
  { month: "Dic", rentals: 78 },
]

const chartConfig = {
  rentals: {
    label: "Rentas",
    color: "hsl(var(--chart-1))",
  },
}

export function RentalsChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Rentas por Mes</CardTitle>
        <CardDescription>Número de rentas procesadas mensualmente</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="rentals" fill="var(--color-rentals)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
