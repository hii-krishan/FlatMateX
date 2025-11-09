"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, ComposedChart } from "recharts"
import { mockMoodData } from "@/lib/data"
import { ChartTooltip, ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const chartData = mockMoodData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    "Sleep Hours": d.sleepHours,
    "Productivity": d.productivity === 'High' ? 3 : d.productivity === 'Medium' ? 2 : 1,
    mood: d.mood,
}));

const moodToValue = {
    'Happy': 5,
    'Productive': 4,
    'Calm': 3,
    'Stressed': 2,
    'Sad': 1
};
const valueToMood = ['Sad', 'Stressed', 'Calm', 'Productive', 'Happy'];

const moodChartData = mockMoodData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sleep: d.sleepHours,
    mood: moodToValue[d.mood],
    productivity: d.productivity === 'High' ? 3 : d.productivity === 'Medium' ? 2 : 1,
}));

const chartConfig = {
    sleep: {
      label: "Sleep (hrs)",
      color: "hsl(var(--chart-2))",
    },
    mood: {
      label: "Mood",
      color: "hsl(var(--chart-1))",
    },
  }

export function MoodChart() {
    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={moodChartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} stroke="hsl(var(--chart-2))" fontSize={12} />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="rounded-lg border bg-background p-2.5 shadow-sm">
                                    <div className="grid grid-cols-1 gap-1.5 text-sm">
                                        <p className="font-medium">{label}</p>
                                        <p className="text-muted-foreground">
                                            Mood: <span className="font-bold" style={{color: "hsl(var(--chart-1))"}}>{valueToMood[payload[0].value -1]}</span>
                                        </p>
                                        <p className="text-muted-foreground">
                                            Sleep: <span className="font-bold" style={{color: "hsl(var(--chart-2))"}}>{payload[1].value} hrs</span>
                                        </p>
                                    </div>
                                </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="mood" fill="hsl(var(--chart-1))" name="Mood" barSize={20} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="sleep" stroke="hsl(var(--chart-2))" name="Sleep (hrs)" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
