import { useState } from "react";
import { PlusCircle, PartyPopper, Film, CakeSlice, School, CalendarDays, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";

const eventIcons = { "Movie Night": Film, Birthday: CakeSlice, "College Fest": School, Outing: PartyPopper, Other: CalendarDays };

export function EventPlanner() {
  const { events, addEvent, deleteEvent } = useData();
  const [open, setOpen] = useState(false);

  const createEvent = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addEvent({ title: data.get("title"), date: data.get("date"), type: data.get("type") });
    setOpen(false);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Upcoming Events</CardTitle>
            <CardDescription>Plan movie nights, birthdays, fests, and anything else.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Create Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a New Event</DialogTitle></DialogHeader>
              <form onSubmit={createEvent} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="title">Event title</Label><Input id="title" name="title" required /></div>
                <div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" name="date" type="date" required /></div>
                <div className="space-y-2"><Label>Type</Label><Select name="type" required><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>
                  {Object.keys(eventIcons).map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent></Select></div>
                <Button type="submit" className="w-full">Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
          {events.map((event) => {
            const Icon = eventIcons[event.type] || CalendarDays;
            const eventDate = new Date(event.date);
            return <div key={event.id} className="group flex items-center gap-4 rounded-xl border p-4">
              <div className="rounded-xl bg-muted p-3"><Icon className="h-5 w-5 text-primary" /></div>
              <div className="flex-1"><p className="font-semibold">{event.title}</p><p className="text-sm text-muted-foreground">{event.type} · {eventDate.toDateString()}</p></div>
              <Button variant="ghost" size="icon" className="opacity-0 transition-opacity group-hover:opacity-100" onClick={() => deleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
