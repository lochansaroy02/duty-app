"use client";

import { useStaffStore } from "@/store/staffStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { useAuthStore } from "@/store/authStore";
import {
    ArrowLeft,
    Briefcase,
    Clock,
    History,
    MapPin,
    Phone,
    Plane,
    ShieldCheck
} from "lucide-react";

const StaffProfilePage = () => {
    const [staff, setStaff] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore()
    const { fetchStaffById } = useStaffStore();
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const data = await fetchStaffById(id);
                setStaff(data);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) getData();
    }, [id, fetchStaffById]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-muted-foreground animate-pulse">Loading Profile...</div>;
    }

    if (!staff) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Staff member not found</h2>
                <Button variant="link" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Logic to separate the first item (current) from the rest
    const currentDuty = staff.duties?.[0];
    const pastDuties = staff.duties?.slice(1) || [];

    const currentLeave = staff.leaves?.[0];
    const pastLeaves = staff.leaves?.slice(1) || [];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <Button
                variant="ghost"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/20">
                                {staff.name.charAt(0)}
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">{staff.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="font-mono">{staff.rank}</Badge>
                                    <span className="text-muted-foreground text-sm">Force No: {staff.forceNo}</span>
                                </div>
                            </div>
                        </div>
                        <Badge className={`text-sm px-4 py-1 ${staff.status === "AVAILABLE" ? "bg-emerald-500" :
                            staff.status === "LEAVE" ? "bg-orange-500" : "bg-blue-500"
                            }`}>
                            {staff.status}
                        </Badge>
                    </div>
                </div>

                <CardContent className="grid md:grid-cols-3 gap-6 p-6">
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contact</p>
                            <p className="text-sm font-medium">{staff.mobileNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Station Name</p>
                            <p className="text-sm font-medium font-mono">{user?.stationName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Updated</p>
                            <p className="text-sm font-medium">{formatDate(staff.updatedAt)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="duties" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                    <TabsTrigger value="duties" className="gap-2">
                        <Briefcase className="h-4 w-4" /> Duty Logs
                    </TabsTrigger>
                    <TabsTrigger value="leaves" className="gap-2">
                        <Plane className="h-4 w-4" /> Leave Records
                    </TabsTrigger>
                </TabsList>

                {/* Duty Table */}
                <TabsContent value="duties">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Assignment History</CardTitle>
                            <CardDescription>Highlighted row represents the current active duty.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Duty Type</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Reporting Time</TableHead>
                                        <TableHead>Relieving Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* HIGHLIGHTED CURRENT DUTY */}
                                    {currentDuty && (
                                        <TableRow className="bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary">
                                            <TableCell>
                                                <Badge className="bg-primary text-white animate-pulse">CURRENT</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">{formatDate(currentDuty.date)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-primary text-primary">{currentDuty.dutyType}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {currentDuty.location}
                                            </TableCell>
                                            <TableCell>{formatTime(currentDuty.reportingTime)}</TableCell>
                                            <TableCell>{formatTime(currentDuty.relievingTime)}</TableCell>
                                        </TableRow>
                                    )}

                                    {/* PAST DUTIES */}
                                    {pastDuties.length > 0 ? (
                                        pastDuties.map((duty: any) => (
                                            <TableRow key={duty.id} className="opacity-80">
                                                <TableCell>
                                                    <History className="h-4 w-4 text-muted-foreground" />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(duty.date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{duty.dutyType}</Badge>
                                                </TableCell>
                                                <TableCell className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-slate-400" /> {duty.location}
                                                </TableCell>
                                                <TableCell>{formatTime(duty.reportingTime)}</TableCell>
                                                <TableCell>{formatTime(duty.relievingTime)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : !currentDuty && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No duty records found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Leave Table */}
                <TabsContent value="leaves">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Leave History</CardTitle>
                            <CardDescription>Highlighted row represents the most recent or active leave.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>From</TableHead>
                                        <TableHead>To</TableHead>
                                        <TableHead>Approved By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* HIGHLIGHTED CURRENT LEAVE */}
                                    {currentLeave && (
                                        <TableRow className="bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-500">
                                            <TableCell>
                                                <Badge className="bg-orange-500 text-white">ACTIVE</Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">{currentLeave.leaveType}</TableCell>
                                            <TableCell className="font-medium">{formatDate(currentLeave.fromDate)}</TableCell>
                                            <TableCell className="font-medium">{formatDate(currentLeave.toDate)}</TableCell>
                                            <TableCell>{currentLeave.approvedBy}</TableCell>
                                        </TableRow>
                                    )}

                                    {/* PAST LEAVES */}
                                    {pastLeaves.length > 0 ? (
                                        pastLeaves.map((leave: any) => (
                                            <TableRow key={leave.id} className="opacity-80">
                                                <TableCell>
                                                    <History className="h-4 w-4 text-muted-foreground" />
                                                </TableCell>
                                                <TableCell className="font-medium text-muted-foreground">{leave.leaveType}</TableCell>
                                                <TableCell>{formatDate(leave.fromDate)}</TableCell>
                                                <TableCell>{formatDate(leave.toDate)}</TableCell>
                                                <TableCell>{leave.approvedBy}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : !currentLeave && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No leave applications found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StaffProfilePage;