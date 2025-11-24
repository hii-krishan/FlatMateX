"use client";

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import type { Note } from '@/lib/types';
import { useMemo } from 'react';

const noteColors = [
  'bg-yellow-200',
  'bg-green-200',
  'bg-blue-200',
  'bg-pink-200',
  'bg-purple-200',
];

export function NotesBoard() {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firestore = useFirestore();

  const notesCollection = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'notes');
  }, [firestore]);

  const { data: notes, loading } = useCollection<Note>(notesCollection);

  const handleAddNote = async () => {
    if (newNoteContent.trim() === '' || !firestore) return;

    const newNote = {
      content: newNoteContent,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      createdAt: serverTimestamp(),
      author: 'Anonymous',
    };

    await addDoc(collection(firestore, 'notes'), newNote);
    setNewNoteContent('');
    setIsDialogOpen(false);
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'notes', noteId));
  }

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
              className="min-h-[120px]"
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

      {loading && <p>Loading notes...</p>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {notes?.map((note) => (
          <Card key={note.id} className={`${note.color} relative group`}>
            <CardContent className="p-4">
              <p className="text-black whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-black/60 mt-2">By {note.author}</p>
            </CardContent>
            
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteNote(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
