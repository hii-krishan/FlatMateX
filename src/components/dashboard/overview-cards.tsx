
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface OverviewCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    loading?: boolean;
}

export function OverviewCard({ title, value, icon: Icon, description, loading }: OverviewCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                ) : (
                    <div className="text-2xl font-bold font-headline">{value}</div>
                )}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
