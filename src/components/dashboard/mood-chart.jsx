"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Line, ComposedChart } from "recharts";
import { mockMoodData } from "@/lib/data";
const chartData = mockMoodData.map((d) => ({
  date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  "Sleep Hours": d.sleepHours,
  "Productivity": d.productivity === "High" ? 3 : d.productivity === "Medium" ? 2 : 1,
  mood: d.mood
}));
const moodToValue = {
  "Happy": 5,
  "Productive": 4,
  "Calm": 3,
  "Stressed": 2,
  "Sad": 1
};
const valueToMood = ["Sad", "Stressed", "Calm", "Productive", "Happy"];
const moodChartData = mockMoodData.map((d) => ({
  date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  sleep: d.sleepHours,
  mood: moodToValue[d.mood],
  productivity: d.productivity === "High" ? 3 : d.productivity === "Medium" ? 2 : 1
}));
const chartConfig = {
  sleep: {
    label: "Sleep (hrs)",
    color: "hsl(var(--chart-2))"
  },
  mood: {
    label: "Mood",
    color: "hsl(var(--chart-1))"
  }
};
function MoodChart() {
  return /* @__PURE__ */ jsx("div", { className: "h-80 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ComposedChart, { data: moodChartData, children: [
    /* @__PURE__ */ jsx(CartesianGrid, { vertical: false, strokeDasharray: "3 3" }),
    /* @__PURE__ */ jsx(
      XAxis,
      {
        dataKey: "date",
        tickLine: false,
        axisLine: false,
        tickMargin: 8,
        fontSize: 12
      }
    ),
    /* @__PURE__ */ jsx(YAxis, { yAxisId: "left", orientation: "left", stroke: "hsl(var(--chart-1))", fontSize: 12 }),
    /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, 10], stroke: "hsl(var(--chart-2))", fontSize: 12 }),
    /* @__PURE__ */ jsx(
      Tooltip,
      {
        content: ({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return /* @__PURE__ */ jsx("div", { className: "rounded-lg border bg-background p-2.5 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-1.5 text-sm", children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: label }),
              /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                "Mood: ",
                /* @__PURE__ */ jsx("span", { className: "font-bold", style: { color: "hsl(var(--chart-1))" }, children: valueToMood[payload[0].value - 1] })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                "Sleep: ",
                /* @__PURE__ */ jsxs("span", { className: "font-bold", style: { color: "hsl(var(--chart-2))" }, children: [
                  payload[1].value,
                  " hrs"
                ] })
              ] })
            ] }) });
          }
          return null;
        }
      }
    ),
    /* @__PURE__ */ jsx(Legend, {}),
    /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "mood", fill: "hsl(var(--chart-1))", name: "Mood", barSize: 20, radius: [4, 4, 0, 0] }),
    /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "sleep", stroke: "hsl(var(--chart-2))", name: "Sleep (hrs)", strokeWidth: 2, dot: false })
  ] }) }) });
}
export {
  MoodChart
};
