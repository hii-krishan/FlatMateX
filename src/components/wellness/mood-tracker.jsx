"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { getSelfCareAdvice } from "@/ai/flows/mood-based-self-care-advice";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { HeartPulse, Loader2, Sparkles, Pencil } from "lucide-react";
import { useData } from "@/context/data-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
const moodOptions = ["Happy", "Calm", "Productive", "Stressed", "Sad"];
const productivityOptions = ["High", "Medium", "Low"];
function MoodTracker() {
  const { moodData, updateMoodEntry } = useData();
  const [mood, setMood] = useState("Calm");
  const [sleepHours, setSleepHours] = useState(7);
  const [productivity, setProductivity] = useState("Medium");
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSleepDialogOpen, setIsSleepDialogOpen] = useState(false);
  const moodChartData = moodData.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    sleep: d.sleepHours,
    id: d.id,
    fullDate: d.date
  }));
  const handleSubmit = async () => {
    setIsLoading(true);
    setAdvice("");
    try {
      const result = await getSelfCareAdvice({ mood, sleepHours, productivityLevel: productivity });
      setAdvice(result.selfCareAdvice);
    } catch (error) {
      console.error("Failed to get self-care advice:", error);
      setAdvice("Could not load advice at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSleepUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    moodData.forEach((entry) => {
      const newHours = formData.get(`sleep-${entry.id}`);
      if (newHours !== null) {
        updateMoodEntry(entry.id, { sleepHours: parseFloat(newHours) });
      }
    });
    setIsSleepDialogOpen(false);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "How are you feeling today?" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Log your mood, sleep, and productivity to get personalized advice." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { children: "Your Mood" }),
          /* @__PURE__ */ jsx(RadioGroup, { value: mood, onValueChange: (val) => setMood(val), className: "flex flex-wrap gap-2", children: moodOptions.map((option) => /* @__PURE__ */ jsx(Button, { type: "button", variant: mood === option ? "default" : "outline", onClick: () => setMood(option), children: option }, option)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            "Hours Slept Last Night: ",
            /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
              sleepHours,
              " hours"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Slider, { defaultValue: [sleepHours], max: 12, step: 0.5, onValueChange: ([val]) => setSleepHours(val) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { children: "Productivity Level" }),
          /* @__PURE__ */ jsx(RadioGroup, { value: productivity, onValueChange: (val) => setProductivity(val), className: "flex flex-wrap gap-2", children: productivityOptions.map((option) => /* @__PURE__ */ jsx(Button, { type: "button", variant: productivity === option ? "default" : "outline", onClick: () => setProductivity(option), children: option }, option)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs(Button, { onClick: handleSubmit, disabled: isLoading, className: "w-full", children: [
        isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
        "Get Self-Care Advice"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      (advice || isLoading) && /* @__PURE__ */ jsxs(Card, { className: "bg-primary/5 border-primary/20", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2 text-primary", children: [
          /* @__PURE__ */ jsx(HeartPulse, {}),
          " AI Self-Care Tip"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxs("p", { className: "text-primary/90 italic", children: [
          '"',
          advice,
          '"'
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Sleep This Week" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Your sleep patterns over the last 7 days." })
          ] }),
          /* @__PURE__ */ jsxs(Dialog, { open: isSleepDialogOpen, onOpenChange: setIsSleepDialogOpen, children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Sleep Timings" }) }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleSleepUpdate, className: "space-y-4", children: [
                moodData.map((entry) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 items-center gap-4", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: `sleep-${entry.id}`, className: "text-right", children: new Date(entry.date).toLocaleDateString("en-US", { weekday: "long" }) }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: `sleep-${entry.id}`,
                      name: `sleep-${entry.id}`,
                      type: "number",
                      defaultValue: entry.sleepHours,
                      step: "0.5",
                      className: "col-span-2"
                    }
                  )
                ] }, entry.id)),
                /* @__PURE__ */ jsxs(DialogFooter, { children: [
                  /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsSleepDialogOpen(false), children: "Cancel" }),
                  /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-60", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: moodChartData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "date", stroke: "#888888", fontSize: 12, tickLine: false, axisLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "#888888", fontSize: 12, tickLine: false, axisLine: false, tickFormatter: (value) => `${value}h` }),
          /* @__PURE__ */ jsx(Tooltip, { cursor: { fill: "hsla(var(--muted))" }, contentStyle: { backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "sleep", fill: "hsl(var(--primary))", radius: [4, 4, 0, 0] })
        ] }) }) })
      ] })
    ] })
  ] }) });
}
export {
  MoodTracker
};
