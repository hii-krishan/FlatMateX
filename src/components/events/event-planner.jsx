"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, PartyPopper, Film, CakeSlice, School, Vote, Trash2, Pencil, X } from "lucide-react";
import { useData } from "@/context/data-context";
const eventIcons = {
  "Movie Night": Film,
  "Birthday": CakeSlice,
  "College Fest": School,
  "Outing": PartyPopper
};
function EventPlanner() {
  const { events, addEvent, deleteEvent, polls, updatePoll, voteOnPoll } = useData();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const handleCreateEvent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvent = {
      title: formData.get("title"),
      date: formData.get("date"),
      type: formData.get("type")
    };
    addEvent(newEvent);
    setIsEventDialogOpen(false);
  };
  const handleVote = (pollId, optionIndex) => {
    voteOnPoll(pollId, optionIndex);
  };
  const handleEditPollClick = (poll) => {
    setEditingPoll(JSON.parse(JSON.stringify(poll)));
    setIsPollDialogOpen(true);
  };
  const handleSavePoll = (e) => {
    e.preventDefault();
    if (!editingPoll) return;
    const formData = new FormData(e.currentTarget);
    const updatedOptions = editingPoll.options.map((opt, index) => ({
      ...opt,
      text: formData.get(`pollOption-${index}`)
    })).filter((opt) => opt.text && opt.text.trim() !== "");
    const newOptionText = formData.get("newPollOption");
    if (newOptionText && newOptionText.trim() !== "") {
      updatedOptions.push({ text: newOptionText.trim(), votes: 0, voters: [] });
    }
    const updatedPoll = {
      ...editingPoll,
      question: formData.get("pollQuestion"),
      options: updatedOptions
    };
    updatePoll(updatedPoll);
    setEditingPoll(null);
    setIsPollDialogOpen(false);
  };
  const handlePollOptionChange = (index, value) => {
    if (!editingPoll) return;
    const newOptions = [...editingPoll.options];
    newOptions[index].text = value;
    setEditingPoll({ ...editingPoll, options: newOptions });
  };
  const handleRemovePollOption = (index) => {
    if (!editingPoll) return;
    const newOptions = editingPoll.options.filter((_, i) => i !== index);
    setEditingPoll({ ...editingPoll, options: newOptions });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Upcoming Events" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Plan your movie nights, birthdays, and fests." })
          ] }),
          /* @__PURE__ */ jsxs(Dialog, { open: isEventDialogOpen, onOpenChange: setIsEventDialogOpen, children: [
            /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { children: [
              /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
              " Create Event"
            ] }) }),
            /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Create a New Event" }) }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateEvent, className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Event Title" }),
                  /* @__PURE__ */ jsx(Input, { id: "title", name: "title", required: true })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "date", children: "Date" }),
                  /* @__PURE__ */ jsx(Input, { id: "date", name: "date", type: "date", required: true })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: "type", children: "Type" }),
                  /* @__PURE__ */ jsxs(Select, { name: "type", required: true, children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { id: "type", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select type" }) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "Movie Night", children: "Movie Night" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "Birthday", children: "Birthday" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "College Fest", children: "College Fest" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "Outing", children: "Outing" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", children: "Create Event" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          events.length === 0 && /* @__PURE__ */ jsx("p", { children: "No upcoming events." }),
          events.map((event) => {
            const Icon = eventIcons[event.type];
            const eventDate = new Date(event.date);
            const isPast = eventDate < /* @__PURE__ */ new Date();
            return /* @__PURE__ */ jsxs("div", { className: `flex items-center space-x-4 rounded-lg border p-4 group ${isPast ? "opacity-50" : ""}`, children: [
              /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 bg-muted rounded-lg p-3", children: Icon && /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: event.title }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: eventDate.toDateString() })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 opacity-0 group-hover:opacity-100", onClick: () => deleteEvent(event.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] }, event.id);
          })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Vote, {}),
            " Flat Polls"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Decide on group activities together." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
          polls.length === 0 && /* @__PURE__ */ jsx("p", { children: "No active polls." }),
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsx("p", { className: "font-semibold", children: poll.question }),
                /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => handleEditPollClick(poll), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "space-y-3", children: poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? option.votes / totalVotes * 100 : 0;
                return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
                    /* @__PURE__ */ jsx("span", { children: option.text }),
                    /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => handleVote(poll.id, index), children: "Vote" })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: percentage }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    option.votes,
                    " votes"
                  ] })
                ] }, index);
              }) })
            ] }, poll.id);
          })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isPollDialogOpen, onOpenChange: setIsPollDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Poll" }) }),
      editingPoll && /* @__PURE__ */ jsxs("form", { onSubmit: handleSavePoll, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "pollQuestion", children: "Poll Question" }),
          /* @__PURE__ */ jsx(Input, { id: "pollQuestion", name: "pollQuestion", defaultValue: editingPoll.question, required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Options" }),
          editingPoll.options.map((option, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                name: `pollOption-${index}`,
                value: option.text,
                onChange: (e) => handlePollOptionChange(index, e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => handleRemovePollOption(index), children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }, index)),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(Input, { name: "newPollOption", placeholder: "Add new option" }) })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => {
            setIsPollDialogOpen(false);
            setEditingPoll(null);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Changes" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  EventPlanner
};
