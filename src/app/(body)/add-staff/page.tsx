"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useAuthStore } from "@/store/authStore";
import { useStaffStore } from "@/store/staffStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { ArrowLeft, FileUp, Hash, Loader2, Phone, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    forceNo: z.string().min(3, "Force Number is required."),
    rank: z.string().min(1, "Rank is required (e.g., HC, Const, Insp)."),
    mobileNumber: z.string().min(10, "Enter a valid mobile number."),
});

const AddStaffPage = () => {
    const router = useRouter();
    const { user } = useAuthStore();
    const { createStaff } = useStaffStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            forceNo: "",
            rank: "",
            mobileNumber: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user?.id) {
            toast.error("You must be logged in to add staff.");
            return;
        }

        try {
            setIsSubmitting(true);
            await createStaff({
                ...values,
                stationId: user.id
            });

            toast.success("Staff member added successfully!");
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Failed to create staff record.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleBulkSuccess = () => {
        setIsUploadModalOpen(false);
        toast.success("Bulk import completed successfully!");
        router.push("/dashboard");
        router.refresh();
    };


    const handlebulkUpload = () => {
        router.push("/add-staff/bulk-import")
    }
    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <Button
                variant="ghost"
                className="gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>

            <Card className="border-slate-200 shadow-lg">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Add New Staff</CardTitle>
                                <CardDescription>
                                    Register personnel members manually or via Excel.
                                </CardDescription>
                            </div>
                        </div>
                        <Button onClick={handlebulkUpload
                        } variant="outline" className="gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 cursor-pointer">
                            <FileUp className="h-4 w-4" />
                            Bulk Import
                        </Button>
                    </div>
                    <Separator />
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="John Doe" className="pl-9" {...field} />
                                                <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="forceNo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Force Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="88723" className="pl-9" {...field} />
                                                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rank</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input placeholder="HC / Const / SI" className="pl-9" {...field} />
                                                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="mobileNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input placeholder="98927337XX" type="tel" className="pl-9" {...field} />
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-semibold cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving to Database...
                                        </>
                                    ) : (
                                        "Register Staff Member"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStaffPage;