"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { getSelfCareAdvice } from '@/ai/flows/mood-based-self-care-advice';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { mockMoodData } from '@/lib/data';
import type { MoodEntry } from '@/lib/types';
import { HeartPulse, Loader2, Sparkles } from 'lucide-react';

const moodOptions: MoodEntry['mood'][] = ['Happy', 'Calm', 'Productive', 'Stressed', 'Sad'];
const productivityOptions: MoodEntry['productivity'][] = ['High', 'Medium', 'Low'];

const moodChartData = mockMoodData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sleep: d.sleepHours,
}));

export function MoodTracker() {
  const [mood, setMood] = useState<MoodEntry['mood']>('Calm');
  const [sleepHours, setSleepHours] = useState(7);
  const [productivity, setProductivity] = useState<MoodEntry['productivity']>('Medium');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setAdvice('');
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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">How are you feeling today?</CardTitle>
          <CardDescription>Log your mood, sleep, and productivity to get personalized advice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Your Mood</Label>
            <RadioGroup value={mood} onValueChange={(val: MoodEntry['mood']) => setMood(val)} className="flex flex-wrap gap-2">
              {moodOptions.map(option => (
                <Button key={option} type="button" variant={mood === option ? "default" : "outline"} onClick={() => setMood(option)}>{option}</Button>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label>Hours Slept Last Night: <span className="font-bold text-primary">{sleepHours} hours</span></Label>
            <Slider defaultValue={[sleepHours]} max={12} step={0.5} onValueChange={([val]) => setSleepHours(val)} />
          </div>
          <div className="space-y-3">
            <Label>Productivity Level</Label>
             <RadioGroup value={productivity} onValueChange={(val: MoodEntry['productivity']) => setProductivity(val)} className="flex flex-wrap gap-2">
              {productivityOptions.map(option => (
                <Button key={option} type="button" variant={productivity === option ? "default" : "outline"} onClick={() => setProductivity(option)}>{option}</Button>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Get Self-Care Advice
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {(advice || isLoading) && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2 text-primary">
                <HeartPulse /> AI Self-Care Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <p className="text-primary/90 italic">"{advice}"</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Sleep This Week</CardTitle>
            <CardDescription>Your sleep patterns over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip cursor={{ fill: 'hsla(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                <Bar dataKey="sleep" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
