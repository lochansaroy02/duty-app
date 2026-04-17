"use client";

import { useStaffStore } from "@/store/staffStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Icons
import { ArrowLeft, ExternalLink, Users } from "lucide-react";

const FilteredStaffPage = () => {
    const router = useRouter();
    const params = useParams();
    const { staffList } = useStaffStore();

    const [staffData, setStaffData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    console.log(staffData);
    // Extract and format the status parameter (handles URL case vs DB case)
    const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
    const currentStatus = rawStatus?.toUpperCase() || "";

    useEffect(() => {
        if (staffList) {
            const data = staffList.filter((item: any) => item.status === currentStatus);
            setStaffData(data);
            setIsLoading(false);
        }
    }, [currentStatus, staffList]);

    // Helper for dynamic titles based on status
    const getPageConfig = () => {
        switch (currentStatus) {
            case "AVAILABLE":
                return { title: "Available Staff", desc: "Staff members currently ready for assignment." };
            case "DUTY":
                return { title: "On Duty", desc: "Staff members currently assigned to active duties." };
            case "LEAVE":
                return { title: "On Leave", desc: "Staff members currently on approved leave." };
            default:
                return { title: `Status: ${currentStatus}`, desc: "Filtered staff records." };
        }
    };

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

    const config = getPageConfig();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Navigation */}
            <Button
                variant="ghost"
                className="gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {/* Main Content Card */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b bg-slate-50/50">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{config.title}</CardTitle>
                        <CardDescription className="mt-1.5">{config.desc}</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground animate-pulse">
                            Filtering records...
                        </div>
                    ) : staffData.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No records found</h3>
                            <p className="text-sm text-muted-foreground">
                                There are currently no staff members with the status "{currentStatus}".
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="w-[250px] pl-6 font-semibold text-slate-900">Personnel</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Force No.</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Contact</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Rank</TableHead>
                                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                    <TableHead className="text-right pr-6 font-semibold text-slate-900">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="">
                                {staffData.map((staff) => (
                                    <TableRow key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="pl-0">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{staff.name}</span>
                                                <span className="text-xs text-muted-foreground font-mono mt-0.5">{staff.rank}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{staff.pnoNo}</TableCell>
                                        <TableCell className="text-slate-600">{staff.mobileNumber}</TableCell>
                                        <TableCell className="text-slate-600">{staff.rank}</TableCell>
                                        <TableCell>{getStatusBadge(staff.status)}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary cursor-pointer hover:text-primary hover:bg-primary/10 gap-2"
                                                // Change this route to match your actual staff detail page structure
                                                onClick={() => router.push(`/assign/${staff.id}`)}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
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

export default FilteredStaffPage;