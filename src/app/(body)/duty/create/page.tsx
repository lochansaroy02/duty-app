"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useDutyStore } from "@/store/dutyStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
    dutyName: z.string().min(3),
    dutyType: z.enum(["EASY", "MEDIUM", "HARD"]),
    location: z.string().min(3),
});

export default function CreateDutyPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { createDuty } = useDutyStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { dutyName: "", dutyType: "MEDIUM", location: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await createDuty({ ...values, stationId: user?.id });
        toast.success("Duty created!");
        router.push("/dashboard/duties");
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Create Duty / Roster</CardTitle>
                    <Button onClick={() => {
                        router.push("create/bulk-create");
                    }} variant="outline">
                        <FileUp className="mr-2 h-4 w-4" /> Bulk Roster
                    </Button>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="dutyName" render={({ field }) => (
                                <FormItem><FormLabel>Duty Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="dutyType" render={({ field }) => (
                                <FormItem><FormLabel>Difficulty</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="EASY">Easy</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HARD">Hard</SelectItem></SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="w-full">Create Manual Duty</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}