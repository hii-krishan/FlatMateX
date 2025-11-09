"use client";

import { useState } from 'react';
import { mockNotes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const noteColors = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-pink-200',
  'bg-purple-200',
];

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddNote = () => {
    if (newNoteContent.trim() === '') return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
    };

    setNotes([...notes, newNote]);
    setNewNoteContent('');
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Shared Notes</h1>
          <p className="text-muted-foreground">
            A collaborative space for your flat's reminders and ideas.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Note</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Type your note here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[120px] text-black"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddNote}>Add Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className={`${note.color}`}>
            <CardContent className="p-4">
              <p className="text-black whitespace-pre-wrap">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
