"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { Loader2, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const page = ({ onSuccess }: { onSuccess: () => void }) => {
    const { user } = useAuthStore();
    const [rosterData, setRosterData] = useState<any[]>([]);
    const [days, setDays] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target?.result, { type: "binary" });
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            setRosterData(data);
        };
        reader.readAsBinaryString(file);
    };

    const handleAssign = async () => {
        setIsProcessing(true);
        try {
            await axios.post("/api/duty/assign-roster", {
                assignments: rosterData,
                durationDays: days,
                assignedBy: user?.name
            });
            toast.success("Roster Successfully Assigned!");
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Check your Excel data");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Duration (Days)</label>
                    <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min={1} />
                </div>
                <div className="flex-[2] space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Select Excel</label>
                    <Input type="file" accept=".xlsx" onChange={handleFile} />
                </div>
            </div>

            {rosterData.length > 0 && (
                <div className="space-y-4">
                    <div className="max-h-[300px] overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Force No (pnNo)</TableHead>
                                    <TableHead>Duty Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rosterData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono">{row.pnNo}</TableCell>
                                        <TableCell>{row.dutyName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button onClick={handleAssign} className="w-full" disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Run Capability Check & Assign
                    </Button>
                </div>
            )}
        </div>
    );
};
export default page