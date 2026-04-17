"use client";

import { useAuthStore } from "@/store/authStore";
import { useStaffStore } from "@/store/staffStore";
import { useEffect, useMemo } from "react";

// Shadcn UI Components (Assumed installed)
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Briefcase, PlaneTakeoff, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const { user } = useAuthStore();
    const { fetchStaff, staffList } = useStaffStore();
    const router = useRouter()
    useEffect(() => {
        if (user?.id) {
            fetchStaff(user.id);
        }
    }, [user, fetchStaff]);

    // Derived statistics
    const stats = useMemo(() => {
        if (!staffList) return { available: 0, onDuty: 0, onLeave: 0 };

        return {
            available: staffList.filter((s: any) => s.status === "AVAILABLE").length,
            onDuty: staffList.filter((s: any) => s.status === "DUTY").length,
            onLeave: staffList.filter((s: any) => s.status === "LEAVE").length,
        };
    }, [staffList]);

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Available</Badge>;
            case "DUTY":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">On Duty</Badge>;
            case "LEAVE":
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">On Leave</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (!staffList) {
        return (
            <div className="flex h-screen items-center justify-center text-muted-foreground">
                Loading staff records...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Overview</h1>
                <p className="text-muted-foreground">Manage and monitor personnel status and assignments.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4  md:grid-cols-3">
                <Card onClick={() => {
                    router.push(`/staff/AVAILABLE`)
                }} className="shadow-sm cursor-pointer border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available Staff</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.available}</div>
                    </CardContent>
                </Card>

                <Card onClick={() => {
                    router.push(`/staff/DUTY`)
                }} className="shadow-sm cursor-pointer border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">On Duty</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onDuty}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
                        <PlaneTakeoff className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onLeave}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Table Section */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Personnel Directory</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-900">Name</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Force No.</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Rank</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Contact</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Current Status</TableHead>
                                    <TableHead className="font-semibold text-slate-900 text-right">Latest Duty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="cursor-pointer" >
                                {staffList.map((staff) => (
                                    <TableRow onClick={() => {
                                        router.push(`/dashboard/${staff.id}`)
                                    }} key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{staff.pnoNo}</TableCell>
                                        <TableCell>
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                                                {staff.rank}
                                            </span>
                                        </TableCell>
                                        <TableCell>{staff.mobileNumber}</TableCell>
                                        <TableCell>{staff.status && getStatusBadge(staff.status)}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {staff.duties?.[0]?.dutyType || "No active duty"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;