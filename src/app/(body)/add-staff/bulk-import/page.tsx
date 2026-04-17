// components/staff/StaffUpload.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import { Loader2, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import * as XLSX from "xlsx";



const page = ({ onSuccess }: { onSuccess: () => void }) => {

    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuthStore()
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryStr = event.target?.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);
            setParsedData(json);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        setIsLoading(true);
        try {
            const finalData = parsedData.map((item) => ({
                ...item,
                pnoNo: item.pnoNo.toString(),
                mobileNumber: item.mobileNumber.toString(),
                stationId: user?.id,
                capablity: item.capablity ? parseInt(item.capablity) : 1,
                condition: item.condition || "NORMAL",
            }));

            const response = await axios.post("/api/staff", finalData);
            console.log(response.data)

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="text-sm cursor-pointer" />
            </div>

            {parsedData.length > 0 && (
                <>
                    <div className="max-h-[300px] overflow-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Force No</TableHead>
                                    <TableHead>Rank</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.pnoNo}</TableCell>
                                        <TableCell>{row.rank}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button onClick={handleUpload} className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Upload {parsedData.length} Records
                    </Button>
                </>
            )}
        </div>
    );
};

export default page
