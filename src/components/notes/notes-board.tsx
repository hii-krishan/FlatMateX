"use client";

import { useState } from 'react';
import { mockNotes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const noteColors = ['bg-yellow-200 dark:bg-yellow-800/50', 'bg-blue-200 dark:bg-blue-800/50', 'bg-green-200 dark:bg-green-800/50', 'bg-pink-200 dark:bg-pink-800/50', 'bg-purple-200 dark:bg-purple-800/50'];

export function NotesBoard() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [newNoteContent, setNewNoteContent] = useState('');

  const addNote = () => {
    if (newNoteContent.trim() === '') return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <Textarea
              placeholder="Type a new announcement or reminder..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="flex-grow"
              rows={3}
            />
            <Button onClick={addNote} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
        </CardContent>
      </Card>
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        style={{ gridAutoRows: 'min-content' }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg shadow-md break-words ${note.color} border border-black/10 dark:border-white/10`}
          >
            <p className="text-black dark:text-gray-200">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
