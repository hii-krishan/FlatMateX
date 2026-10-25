"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/context/data-context";
function NotesBoard() {
  const { notes, addNote, deleteNote } = useData();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleAddNote = () => {
    if (newNoteContent.trim() === "") return;
    addNote({ content: newNoteContent });
    setNewNoteContent("");
    setIsDialogOpen(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold font-headline", children: "Shared Notes" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "A collaborative space for your flat's reminders and ideas." })
      ] }),
      /* @__PURE__ */ jsxs(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add Note"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add a New Note" }) }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              placeholder: "Type your note here...",
              value: newNoteContent,
              onChange: (e) => setNewNoteContent(e.target.value),
              className: "min-h-[120px]"
            }
          ),
          /* @__PURE__ */ jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", children: "Cancel" }) }),
            /* @__PURE__ */ jsx(Button, { onClick: handleAddNote, children: "Add Note" })
          ] })
        ] })
      ] })
    ] }),
    notes.length === 0 && /* @__PURE__ */ jsx("p", { children: "No notes yet. Add one!" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: notes.map((note) => /* @__PURE__ */ jsxs(Card, { className: `${note.color} relative group`, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-black whitespace-pre-wrap", children: note.content }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-black/60 mt-2", children: [
          "By ",
          note.author
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "absolute top-2 right-2 h-7 w-7 text-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
          onClick: () => deleteNote(note.id),
          children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
        }
      )
    ] }, note.id)) })
  ] });
}
export {
  NotesBoard
};
