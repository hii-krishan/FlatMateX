"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/data-context";
import { Utensils, Shirt, Star, Lightbulb, MapPin, ExternalLink, ShoppingCart, Tv, CookingPot, Armchair, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const serviceIcons = {
  "Tiffin": CookingPot,
  "Laundry": Shirt,
  "Grocery Store": ShoppingCart,
  "Restaurant": Utensils,
  "Electronics": Tv,
  "Furniture": Armchair
};
const serviceTypes = Object.keys(serviceIcons);
const mapPlaceholder = PlaceHolderImages.find((img) => img.id === "map-placeholder");
function ServicesFinder() {
  const { services, addService, updateService, deleteService } = useData();
  const [filter, setFilter] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const filteredServices = filter === "All" ? services : services.filter((s) => s.type === filter);
  const handleEditClick = (service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };
  const handleAddClick = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };
  const handleDeleteClick = (id) => {
    deleteService(id);
  };
  const handleSaveService = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      name: formData.get("name"),
      type: formData.get("type"),
      rating: parseFloat(formData.get("rating")),
      distance: formData.get("distance")
    };
    if (editingService) {
      updateService({ ...editingService, ...serviceData });
    } else {
      addService(serviceData);
    }
    setIsDialogOpen(false);
    setEditingService(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "flex-row justify-between items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "font-headline", children: "Find Nearby Services" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Filter by category to find what you need." })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleAddClick, children: [
          /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
          "Add Service"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: filter === "All" ? "default" : "outline", onClick: () => setFilter("All"), children: "All" }),
        serviceTypes.map((type) => /* @__PURE__ */ jsxs(Button, { variant: filter === type ? "default" : "outline", onClick: () => setFilter(type), children: [
          React.createElement(serviceIcons[type], { className: "mr-2 h-4 w-4" }),
          type
        ] }, type))
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 flex flex-col space-y-6", children: [
        /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: mapPlaceholder && /* @__PURE__ */ jsxs("div", { className: "aspect-[16/9] relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: mapPlaceholder.imageUrl,
              alt: mapPlaceholder.description,
              className: "object-cover",
              "data-ai-hint": mapPlaceholder.imageHint
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-4 text-white p-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-headline text-2xl font-bold", children: "Your Local Area" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Showing services near you" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto pr-2", children: filteredServices.map((service) => {
          const Icon = serviceIcons[service.type];
          return /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-lg transition-shadow duration-300 group", children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex justify-between items-start text-lg", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-primary" }),
                service.name
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: service.type })
            ] }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-amber-500 fill-amber-500" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold", children: service.rating })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { children: service.distance })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-full", children: [
                  "Get Directions ",
                  /* @__PURE__ */ jsx(ExternalLink, { className: "ml-2 h-4 w-4" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditClick(service), children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleDeleteClick(service.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
                ] })
              ] })
            ] })
          ] }, service.id);
        }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs(Card, { className: "sticky top-20 bg-accent/10 border-accent", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "font-headline flex items-center gap-2 text-accent-foreground/90", children: [
          /* @__PURE__ */ jsx(Lightbulb, { className: "text-accent" }),
          "AI Suggestion"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col text-center items-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-accent-foreground/80", children: "\u201CYou\u2019ve been visiting Tasty Meals often. Want me to find a cheaper tiffin option nearby?\u201D" }),
          /* @__PURE__ */ jsx(Button, { variant: "link", className: "mt-4 text-accent h-auto p-0", children: "Find Cheaper Options" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editingService ? "Edit Service" : "Add New Service" }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveService, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Service Name" }),
          /* @__PURE__ */ jsx(Input, { id: "name", name: "name", defaultValue: editingService?.name, required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "type", children: "Type" }),
          /* @__PURE__ */ jsxs(Select, { name: "type", defaultValue: editingService?.type, required: true, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "type", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: serviceTypes.map((type) => /* @__PURE__ */ jsx(SelectItem, { value: type, children: type }, type)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "rating", children: "Rating" }),
            /* @__PURE__ */ jsx(Input, { id: "rating", name: "rating", type: "number", step: "0.1", defaultValue: editingService?.rating, required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "distance", children: "Distance" }),
            /* @__PURE__ */ jsx(Input, { id: "distance", name: "distance", defaultValue: editingService?.distance, required: true })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Save Service" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ServicesFinder
};
