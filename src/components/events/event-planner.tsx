
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, PartyPopper, Film, CakeSlice, School, Vote, Trash2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import type { Event, Poll } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const eventIcons = {
  'Movie Night': Film,
  'Birthday': CakeSlice,
  'College Fest': School,
  'Outing': PartyPopper,
};

export function EventPlanner() {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);
  const { data: events, loading: eventsLoading } = useCollection<Event>(eventsCollection, {
    orderBy: 'date',
    direction: 'asc'
  });
  
  const pollsCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'polls');
  }, [firestore]);
  const { data: polls, loading: pollsLoading } = useCollection<Poll>(pollsCollection);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !eventsCollection) return;
    const formData = new FormData(e.currentTarget);
    const newEvent: Omit<Event, 'id'> = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as Event['type'],
    };
    addDoc(eventsCollection, newEvent)
      .then(() => {
        setIsEventDialogOpen(false);
        toast({title: 'Event Created!'})
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: eventsCollection.path,
            operation: 'create',
            requestResourceData: newEvent,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!firestore) return;
    const eventRef = doc(firestore, "events", eventId);
    deleteDoc(eventRef)
      .then(() => {
        toast({ title: "Event deleted." });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: eventRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!firestore) return;
    const pollDocRef = doc(firestore, "polls", pollId);
    const poll = polls?.find(p => p.id === pollId);
    if (!poll) return;
    
    const updates: { [key: string]: any } = {};
    updates[`options.${optionIndex}.votes`] = poll.options[optionIndex].votes + 1;
    
    updateDoc(pollDocRef, updates)
      .then(() => {
        toast({ title: "Vote counted!" });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: pollDocRef.path,
            operation: 'update',
            requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Upcoming Events</CardTitle>
              <CardDescription>Plan your movie nights, birthdays, and fests.</CardDescription>
            </div>
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Movie Night">Movie Night</SelectItem>
                        <SelectItem value="Birthday">Birthday</SelectItem>
                        <SelectItem value="College Fest">College Fest</SelectItem>
                        <SelectItem value="Outing">Outing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Event</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventsLoading && <p>Loading events...</p>}
            {events?.map(event => {
                const Icon = eventIcons[event.type];
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();
                return (
                    <div key={event.id} className={`flex items-center space-x-4 rounded-lg border p-4 group ${isPast ? 'opacity-50' : ''}`}>
                        <div className="flex-shrink-0 bg-muted rounded-lg p-3">
                           <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{eventDate.toDateString()}</p>
                        </div>
                        {isPast ? 
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteEvent(event.id!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button> :
                          <div className="text-sm text-primary font-medium">Upcoming</div>
                        }
                    </div>
                );
            })}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Vote /> Flat Polls</CardTitle>
            <CardDescription>Decide on group activities together.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pollsLoading && <p>Loading polls...</p>}
            {polls?.map(poll => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                return (
                    <div key={poll.id} className="space-y-3">
                        <p className="font-semibold">{poll.question}</p>
                        <div className="space-y-3">
                            {poll.options.map((option, index) => {
                                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>{option.text}</span>
                                            <Button size="sm" variant='outline' onClick={() => handleVote(poll.id!, index)}>
                                              Vote
                                            </Button>
                                        </div>
                                        <Progress value={percentage} />
                                        <span className="text-xs text-muted-foreground">{option.votes} votes</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
