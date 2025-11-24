
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockServices } from "@/lib/data";
import type { Service } from "@/lib/types";
import { Utensils, Shirt, BookOpen, Hospital, Landmark, Star, Lightbulb, MapPin, ExternalLink } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ServiceType = 'Tiffin' | 'Laundry' | 'Stationery' | 'Hospital' | 'ATM';

const serviceIcons: { [key in ServiceType]: React.ElementType } = {
  Tiffin: Utensils,
  Laundry: Shirt,
  Stationery: BookOpen,
  Hospital: Hospital,
  ATM: Landmark,
};

const mapPlaceholder = PlaceHolderImages.find(img => img.id === 'map-placeholder');

export function ServicesFinder() {
  const [filter, setFilter] = useState<ServiceType | 'All'>('All');

  const filteredServices = filter === 'All' ? mockServices : mockServices.filter(s => s.type === filter);

  return (
    <div className="flex flex-col h-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Find Nearby Services</CardTitle>
          <CardDescription>Filter by category to find what you need.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>All</Button>
          {(Object.keys(serviceIcons) as ServiceType[]).map(type => (
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
                        <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
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
                               <Button variant="outline" className="w-full">
                                  Get Directions <ExternalLink className="ml-2 h-4 w-4" />
                               </Button>
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
    </div>
  );
}
