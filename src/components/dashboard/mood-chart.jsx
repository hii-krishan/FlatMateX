"use client";
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart
} from "recharts";
import { useData } from "@/context/data-context";

const moodToValue = {
  Happy: 5,
  Productive: 4,
  Calm: 3,
  Stressed: 2,
  Sad: 1
};

const valueToMood = ["Sad", "Stressed", "Calm", "Productive", "Happy"];

const moodEmojis = {
  Happy: "😊",
  Productive: "⚡",
  Calm: "😌",
  Stressed: "😰",
  Sad: "😢"
};

export function MoodChart() {
  const { moodData } = useData();

  // Dynamically map 7 rolling days ending on Today from live moodData in DataContext!
  const moodChartData = useMemo(() => {
    const now = new Date();
    const days = [];

    // Rolling 7 days ending on today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const isToday = i === 0;

      const matched = (moodData || []).find((item) => item.date === dateStr);
      days.push({
        date: isToday ? "Today" : `${weekday} ${dayNum}`,
        fullDate: dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
        sleep: matched ? Number(matched.sleepHours) : 0,
        mood: matched ? moodToValue[matched.mood] || 3 : 0,
        moodName: matched?.mood || "Not logged",
        productivity: matched ? (matched.productivity === "High" ? 3 : matched.productivity === "Medium" ? 2 : 1) : 0
      });
    }

    return days;
  }, [moodData]);

  if (!moodChartData || moodChartData.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center text-sm text-muted-foreground italic">
        No wellness check-ins recorded yet. Head over to the Wellness tab to log sleep & mood!
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={moodChartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          {/* Left Y-axis: Mood (1 to 5) */}
          <YAxis
            yAxisId="left"
            orientation="left"
            domain={[0, 6]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(val) => valueToMood[val - 1] || ""}
            stroke="hsl(var(--chart-1))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          {/* Right Y-axis: Sleep Hours (0 to 14) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 14]}
            tickFormatter={(val) => `${val}h`}
            stroke="hsl(var(--chart-2))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-xl border bg-background/95 backdrop-blur p-3 shadow-lg text-xs space-y-1.5">
                    <p className="font-bold text-sm text-foreground">
                      {label} ({item.fullDate})
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Sleep Duration:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {item.sleep} hrs
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Mood:</span>
                      <strong className="text-primary font-bold">
                        {item.moodName} {moodEmojis[item.moodName]}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t pt-1">
                      <span className="text-muted-foreground">Productivity:</span>
                      <span className="font-semibold text-foreground">
                        {item.productivity === 3 ? "High" : item.productivity === 2 ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
          />

          {/* Bar for Mood */}
          <Bar
            yAxisId="left"
            dataKey="mood"
            fill="hsl(var(--chart-1))"
            name="Mood Score"
            barSize={24}
            radius={[6, 6, 0, 0]}
          />

          {/* Line for Sleep Hours */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sleep"
            stroke="hsl(var(--chart-2))"
            name="Sleep (hrs)"
            strokeWidth={3}
            dot={{ r: 4, fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
