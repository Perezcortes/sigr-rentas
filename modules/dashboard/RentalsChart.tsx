"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts"

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

// Color base de la serie = primario (expuesto como --color-rentals por ChartContainer)
const chartConfig = {
  rentals: {
    label: "Rentas",
    color: "var(--color-primary)",
  },
} as const

export function RentalsChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />

              {/* Cursor del tooltip con tinte primario */}
              <ChartTooltip
                cursor={{ fill: "var(--color-primary)", opacity: 0.12 }}
                content={<ChartTooltipContent hideLabel />}
              />

              {/* Barras: base primario, hover secundario */}
              <Bar dataKey="rentals" radius={4} isAnimationActive>
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={activeIndex === i ? "var(--color-secondary)" : "var(--color-rentals)"}
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                    style={{ transition: "fill 160ms ease" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
