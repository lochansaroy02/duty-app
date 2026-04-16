"use client";

import { useAuthStore } from "@/store/authStore";
import { useDutyStore } from "@/store/dutyStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Shadcn UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Icons
import { Briefcase, MapPin, Plus, RefreshCw } from "lucide-react";

const DutyListPage = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const { duties, fetchDuties, isLoading } = useDutyStore();

    useEffect(() => {
        if (user?.id) {
            fetchDuties(user.id);
        }
    }, [user?.id, fetchDuties]);

    const getDifficultyBadge = (type: string) => {
        switch (type) {
            case "HARD": return <Badge variant="destructive">Hard</Badge>;
            case "MEDIUM": return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
            case "EASY": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Easy</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Duty Management</h1>
                    <p className="text-muted-foreground">Manage and view all operational duties for this station.</p>
                </div>
                <Button
                    onClick={() => router.push("/duty/create")}
                    className="gap-2 cursor-pointer shadow-md"
                >
                    <Plus className="h-4 w-4" /> Create Duty
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <CardTitle>Active Duty List</CardTitle>
                    </div>
                    <CardDescription>A total of {duties?.length || 0} duties registered.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground font-medium">Loading duties...</p>
                        </div>
                    ) : duties?.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                            <Briefcase className="h-10 w-10 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900">No duties found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                You haven't created any duties yet. Click the "Create Duty" button to get started.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="pl-6 font-semibold">Duty Name</TableHead>
                                    <TableHead className="font-semibold">Type</TableHead>
                                    <TableHead className="font-semibold">Location</TableHead>
                                    <TableHead className="text-right pr-6">Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {duties.map((duty) => (
                                    <TableRow key={duty.id} className="hover:bg-slate-50/30 transition-colors">
                                        <TableCell className="pl-6 font-medium text-slate-900">
                                            {duty.dutyName}
                                        </TableCell>
                                        <TableCell>
                                            {getDifficultyBadge(duty.dutyType)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm">{duty.location}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-slate-500 text-sm">
                                            {new Date(duty.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DutyListPage;