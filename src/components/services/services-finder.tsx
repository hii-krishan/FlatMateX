
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/data-context";
import type { Service } from "@/lib/types";
import { Utensils, Shirt, Hospital, Landmark, Star, Lightbulb, MapPin, ExternalLink, ShoppingCart, Tv, CookingPot, Armchair, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ServiceType = 'Tiffin' | 'Laundry' | 'Grocery Store' | 'Restaurant' | 'Electronics' | 'Furniture';

const serviceIcons: { [key in ServiceType]: React.ElementType } = {
    'Tiffin': CookingPot,
    'Laundry': Shirt,
    'Grocery Store': ShoppingCart,
    'Restaurant': Utensils,
    'Electronics': Tv,
    'Furniture': Armchair
};
const serviceTypes = Object.keys(serviceIcons) as ServiceType[];

const mapPlaceholder = PlaceHolderImages.find(img => img.id === 'map-placeholder');

export function ServicesFinder() {
  const { services, addService, updateService, deleteService } = useData();
  const [filter, setFilter] = useState<ServiceType | 'All'>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const filteredServices = filter === 'All' ? services : services.filter(s => s.type === filter);

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    deleteService(id);
  }

  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      name: formData.get('name') as string,
      type: formData.get('type') as ServiceType,
      rating: parseFloat(formData.get('rating') as string),
      distance: formData.get('distance') as string,
    };

    if (editingService) {
      updateService({ ...editingService, ...serviceData });
    } else {
      addService(serviceData);
    }
    setIsDialogOpen(false);
    setEditingService(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <Card>
        <CardHeader className="flex-row justify-between items-center">
            <div>
              <CardTitle className="font-headline">Find Nearby Services</CardTitle>
              <CardDescription>Filter by category to find what you need.</CardDescription>
            </div>
            <Button onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Service
            </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>All</Button>
          {serviceTypes.map(type => (
            <Button key={type} variant={filter === type ? 'default' : 'outline'} onClick={() => setFilter(type)}>
              {React.createElement(serviceIcons[type], { className: "mr-2 h-4 w-4" })}
              {type}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        <div className="lg:col-span-2 flex flex-col space-y-6">
            <Card className="overflow-hidden">
                {mapPlaceholder && (
                <div className="aspect-[16/9] relative">
                    <Image 
                        src={mapPlaceholder.imageUrl} 
                        alt={mapPlaceholder.description}
                        fill
                        className="object-cover"
                        data-ai-hint={mapPlaceholder.imageHint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <div className="absolute bottom-4 left-4 text-white p-2">
                        <h3 className="font-headline text-2xl font-bold">Your Local Area</h3>
                        <p className="text-sm">Showing services near you</p>
                    </div>
                </div>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto pr-2">
                {filteredServices.map(service => {
                    const Icon = serviceIcons[service.type as ServiceType];
                    return (
                        <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300 group">
                          <CardHeader>
                              <CardTitle className="flex justify-between items-start text-lg">
                                  <span className="flex items-center gap-3">
                                      <Icon className="h-6 w-6 text-primary"/>
                                      {service.name}
                                  </span>
                                  <Badge variant="secondary">{service.type}</Badge>
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                      <span className="font-semibold">{service.rating}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{service.distance}</span>
                                  </div>
                              </div>
                               <div className="flex justify-between items-center">
                                    <Button variant="outline" className="w-full">
                                        Get Directions <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(service)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(service.id!)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                               </div>
                          </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>

        <div className="lg:col-span-1">
            <Card className="sticky top-20 bg-accent/10 border-accent">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-accent-foreground/90">
                    <Lightbulb className="text-accent" />
                    AI Suggestion
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col text-center items-center">
                    <p className="text-lg font-medium text-accent-foreground/80">
                    “You’ve been visiting Tasty Meals often. Want me to find a cheaper tiffin option nearby?”
                    </p>
                    <Button variant="link" className="mt-4 text-accent h-auto p-0">Find Cheaper Options</Button>
                </CardContent>
            </Card>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveService} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input id="name" name="name" defaultValue={editingService?.name} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue={editingService?.type} required>
                        <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            {serviceTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rating">Rating</Label>
                        <Input id="rating" name="rating" type="number" step="0.1" defaultValue={editingService?.rating} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="distance">Distance</Label>
                        <Input id="distance" name="distance" defaultValue={editingService?.distance} required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Service</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
