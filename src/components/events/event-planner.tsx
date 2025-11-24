
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, PartyPopper, Film, CakeSlice, School, Vote, Trash2, Pencil, X } from 'lucide-react';
import type { Event, Poll } from '@/lib/types';
import { useData } from '@/context/data-context';

const eventIcons = {
  'Movie Night': Film,
  'Birthday': CakeSlice,
  'College Fest': School,
  'Outing': PartyPopper,
};

export function EventPlanner() {
  const { events, addEvent, deleteEvent, polls, updatePoll, voteOnPoll } = useData();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvent: Omit<Event, 'id' | 'flatmateId'> = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as Event['type'],
    };
    addEvent(newEvent);
    setIsEventDialogOpen(false);
  };
  
  const handleVote = (pollId: string, optionIndex: number) => {
    voteOnPoll(pollId, optionIndex);
  }

  const handleEditPollClick = (poll: Poll) => {
    setEditingPoll(JSON.parse(JSON.stringify(poll))); // Deep copy to avoid direct state mutation
    setIsPollDialogOpen(true);
  };
  
  const handleSavePoll = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingPoll) return;
  
      const formData = new FormData(e.currentTarget);
      
      const updatedOptions = editingPoll.options.map((opt, index) => ({
        ...opt,
        text: formData.get(`pollOption-${index}`) as string,
      })).filter(opt => opt.text && opt.text.trim() !== '');

      const newOptionText = formData.get('newPollOption') as string;
      if (newOptionText && newOptionText.trim() !== '') {
        updatedOptions.push({ text: newOptionText.trim(), votes: 0, voters: [] });
      }

      const updatedPoll: Poll = {
          ...editingPoll,
          question: formData.get('pollQuestion') as string,
          options: updatedOptions
      };
      
      updatePoll(updatedPoll);
      setEditingPoll(null);
      setIsPollDialogOpen(false);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    if (!editingPoll) return;
    const newOptions = [...editingPoll.options];
    newOptions[index].text = value;
    setEditingPoll({ ...editingPoll, options: newOptions });
  };

  const handleRemovePollOption = (index: number) => {
    if (!editingPoll) return;
    const newOptions = editingPoll.options.filter((_, i) => i !== index);
    setEditingPoll({ ...editingPoll, options: newOptions });
  };


  return (
    <>
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
            {events.length === 0 && <p>No upcoming events.</p>}
            {events.map(event => {
                const Icon = eventIcons[event.type];
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();
                return (
                    <div key={event.id} className={`flex items-center space-x-4 rounded-lg border p-4 group ${isPast ? 'opacity-50' : ''}`}>
                        <div className="flex-shrink-0 bg-muted rounded-lg p-3">
                           {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{eventDate.toDateString()}</p>
                        </div>
                        
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => deleteEvent(event.id!)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                         
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
            {polls.length === 0 && <p>No active polls.</p>}
            {polls.map(poll => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                return (
                    <div key={poll.id} className="space-y-3">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold">{poll.question}</p>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditPollClick(poll)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {poll.options.map((option, index) => {
                                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>{option.text}</span>
                                            <Button size="sm" variant={'outline'} onClick={() => handleVote(poll.id!, index)}>
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

    <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Poll</DialogTitle>
            </DialogHeader>
            {editingPoll && (
            <form onSubmit={handleSavePoll} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="pollQuestion">Poll Question</Label>
                    <Input id="pollQuestion" name="pollQuestion" defaultValue={editingPoll.question} required />
                </div>
                
                <div className="space-y-2">
                  <Label>Options</Label>
                  {editingPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        name={`pollOption-${index}`}
                        value={option.text}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePollOption(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   <div className="flex items-center gap-2">
                      <Input name="newPollOption" placeholder="Add new option"/>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => { setIsPollDialogOpen(false); setEditingPoll(null); }}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}

    