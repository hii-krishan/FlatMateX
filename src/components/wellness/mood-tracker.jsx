"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { HeartPulse, Calendar, Check, Clock, Sparkles } from "lucide-react";
import { useData } from "@/context/data-context";

const moods = ["Happy", "Calm", "Productive", "Stressed", "Sad"];
const productivityLevels = ["High", "Medium", "Low"];

const moodEmojis = {
  Happy: "😊",
  Calm: "😌",
  Productive: "⚡",
  Stressed: "😰",
  Sad: "😢"
};

// Formats local date as YYYY-MM-DD avoiding UTC offset errors
function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generates the rolling 7-day window ending on TODAY as the 7th (last) day
// Automatically updates with the actual current date
function getRollingSevenDays() {
  const days = [];
  const now = new Date();

  // i = 6 (6 days ago), i = 5, ..., i = 0 (today is the 7th and last day)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = formatLocalDate(d);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const shortName = d.toLocaleDateString("en-US", { weekday: "short" });
    const isToday = i === 0;

    days.push({
      dayName,
      shortName,
      date: dateStr,
      isToday,
      order: 7 - i, // 1 to 7 (Day 7 is Today)
      dayNumber: d.getDate(),
      monthShort: d.toLocaleDateString("en-US", { month: "short" })
    });
  }
  return days;
}

export function MoodTracker() {
  const { moodData, addMoodEntry } = useData();

  // Re-evaluate rolling 7-day window dynamically based on today's date
  const [currentDateKey, setCurrentDateKey] = useState(() => formatLocalDate(new Date()));

  // Periodically check if day has changed (e.g. at midnight) to keep window automatically updated
  useEffect(() => {
    const interval = setInterval(() => {
      const todayKey = formatLocalDate(new Date());
      if (todayKey !== currentDateKey) {
        setCurrentDateKey(todayKey);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDateKey]);

  const weekDays = useMemo(() => getRollingSevenDays(), [currentDateKey]);
  const todayStr = useMemo(() => formatLocalDate(new Date()), [currentDateKey]);

  // Selected day state - defaults to Today (the 7th day)
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDayName, setSelectedDayName] = useState(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  });

  const [mood, setMood] = useState("Calm");
  const [sleepHours, setSleepHours] = useState(7);
  const [productivity, setProductivity] = useState("Medium");

  // Keep selected date updated if currentDateKey rolls over and user had today selected
  useEffect(() => {
    setSelectedDate((prev) => (prev === todayStr ? todayStr : prev));
  }, [todayStr]);

  // When selectedDate changes, load existing entry if logged
  useEffect(() => {
    const existing = moodData.find((entry) => entry.date === selectedDate);
    if (existing) {
      setMood(existing.mood || "Calm");
      setSleepHours(Number(existing.sleepHours) || 7);
      setProductivity(existing.productivity || "Medium");
    } else {
      setMood("Calm");
      setSleepHours(7);
      setProductivity("Medium");
    }
  }, [selectedDate, moodData]);

  const handleSelectDay = (dayObj) => {
    setSelectedDate(dayObj.date);
    setSelectedDayName(dayObj.dayName);
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSelectedDate(val);
      const parsed = new Date(val + "T00:00:00");
      const parsedDay = parsed.toLocaleDateString("en-US", { weekday: "long" });
      setSelectedDayName(parsedDay);
    }
  };

  const handleSave = () => {
    addMoodEntry({
      date: selectedDate,
      day: selectedDayName,
      mood,
      sleepHours,
      productivity
    });
  };

  // 7-day rolling chart ending on today (Day 7)
  const chartData = useMemo(() => {
    return weekDays.map((d) => {
      const entry = moodData.find((item) => item.date === d.date);
      return {
        date: d.isToday ? "Today (#7)" : `${d.shortName} ${d.dayNumber}`,
        fullDate: d.date,
        dayName: d.dayName,
        sleep: entry ? Number(entry.sleepHours) : 0,
        mood: entry?.mood || "None",
        productivity: entry?.productivity || "None",
        hasEntry: !!entry
      };
    });
  }, [weekDays, moodData]);

  const existingEntryForSelected = moodData.find((e) => e.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* 1. Day of the Week Selector Bar: Rolling 7 days ending on Today as 7th day */}
      <Card className="rounded-2xl border-primary/20 shadow-sm bg-gradient-to-r from-card via-card to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-headline text-xl font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  7-Day Wellness Tracker
                </CardTitle>
                <Badge variant="secondary" className="border border-primary/25 bg-primary/10 text-primary font-semibold text-xs px-2.5 py-0.5">
                  Today is Day 7
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Rolling 7-day cycle ending today. The date and window update automatically every day.
              </CardDescription>
            </div>

            {/* Custom Date Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Jump to date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={handleCustomDateChange}
                className="h-8 w-36 rounded-lg text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {/* 7-day selection buttons: Day 1 (6 days ago) to Day 7 (Today) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const isSelected = selectedDate === d.date;
              const hasEntry = moodData.some((entry) => entry.date === d.date);
              const entry = moodData.find((e) => e.date === d.date);

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/25 scale-[1.02]"
                      : d.isToday
                      ? "border-primary/60 bg-primary/10 hover:bg-primary/15 ring-1 ring-primary/30"
                      : hasEntry
                      ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  {/* Top Header: Day Name & # Order Indicator */}
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? "text-primary-foreground/90"
                        : d.isToday
                        ? "text-primary font-extrabold"
                        : "text-muted-foreground"
                    }`}>
                      {d.isToday ? "Today" : d.shortName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : d.isToday
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground/80"
                    }`}>
                      Day {d.order}
                    </span>
                  </div>

                  {/* Day of Month & Month */}
                  <div className="my-1 flex items-baseline gap-1">
                    <span className={`text-base font-extrabold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {d.dayNumber}
                    </span>
                    <span className={`text-[10px] font-medium ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {d.monthShort}
                    </span>
                  </div>

                  {/* Status / Mood Emoji Preview */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasEntry ? (
                      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        isSelected ? "text-primary-foreground" : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        <span>{moodEmojis[entry?.mood] || "✓"}</span>
                        <span>{entry?.sleepHours}h</span>
                      </span>
                    ) : (
                      <span className={`text-[10px] ${
                        isSelected
                          ? "text-primary-foreground/80"
                          : d.isToday
                          ? "text-primary font-bold"
                          : "text-muted-foreground/80"
                      }`}>
                        {d.isToday ? "Log today" : "Not logged"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Check-in Form for Selected Day & Sleep History Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CHECK-IN FOR SELECTED DAY */}
        <Card className="rounded-2xl border-primary/20 shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl font-bold flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  Check-in for {selectedDayName}
                </CardTitle>
                <CardDescription>
                  Date: <span className="font-mono font-semibold text-foreground">{selectedDate}</span>
                </CardDescription>
              </div>

              {existingEntryForSelected ? (
                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                  ✓ Logged
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Not logged
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Mood selection */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                How did you feel on {selectedDayName}?
              </Label>
              <div className="flex flex-wrap gap-2">
                {moods.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={mood === value ? "default" : "outline"}
                    onClick={() => setMood(value)}
                    className="gap-1.5 rounded-xl text-xs font-medium"
                  >
                    <span>{moodEmojis[value]}</span>
                    <span>{value}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Hours slept */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hours slept last night
                </Label>
                <span className="font-mono text-base font-bold text-primary">
                  {sleepHours} hours
                </span>
              </div>
              <Slider
                value={[sleepHours]}
                max={14}
                min={2}
                step={0.5}
                onValueChange={([value]) => setSleepHours(value)}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>2 hrs</span>
                <span>7-8 hrs (Recommended)</span>
                <span>14 hrs</span>
              </div>
            </div>

            {/* Productivity */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Productivity level
              </Label>
              <div className="flex flex-wrap gap-2">
                {productivityLevels.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={productivity === value ? "default" : "outline"}
                    onClick={() => setProductivity(value)}
                    className="rounded-xl text-xs font-medium"
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <Button
              className="w-full rounded-xl font-semibold gap-2 shadow-md shadow-primary/20"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
              <span>Save check-in for {selectedDayName}</span>
            </Button>
          </CardFooter>
        </Card>

        {/* SLEEP HISTORY CHART (SYNCED) */}
        <Card className="rounded-2xl border-primary/20 shadow-sm flex flex-col">
          <CardHeader className="border-b pb-4">
            <CardTitle className="font-headline text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Sleep History (Synced)
            </CardTitle>
            <CardDescription>
              Weekly sleep hours synced dynamically with every check-in.
            </CardDescription>
          </CardHeader>

          <CardContent className="h-72 pt-4">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                No sleep records yet. Log your first check-in!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 12]} tickFormatter={(val) => `${val}h`} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border bg-background p-2.5 shadow-md text-xs space-y-1">
                            <p className="font-bold">{data.date} ({data.fullDate})</p>
                            <p className="text-primary font-semibold">Sleep: {data.sleep} hrs</p>
                            <p className="text-muted-foreground">Mood: {data.mood} {moodEmojis[data.mood]}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="sleep"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
