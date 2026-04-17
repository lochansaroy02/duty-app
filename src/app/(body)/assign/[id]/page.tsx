"use client";

import { useStaffStore } from '@/store/staffStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Shadcn UI Imports (Adjust paths as needed for your project)
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
const assignDutySchema = z.object({
    date: z.date({ message: "A date is required." }),
    dutyType: z.string().min(1, "Duty type is required."),
    location: z.string().min(1, "Location is required."),
    reportingTime: z.date({ message: "Reporting time is required." }),
    assignedBy: z.string().min(1, "Assigner name is required."),
});

const assignLeaveSchema = z.object({
    leaveType: z.string().min(1, "Leave type is required."),
    fromDate: z.date({ message: "Start date is required." }),
    approvedBy: z.string().min(1, "Approver name is required."),
});

const finishDutySchema = z.object({
    relievingTime: z.date({ message: "Relieving time is required." }),
});

const finishLeaveSchema = z.object({
    toDate: z.date({ message: "End date is required." }),
});
// --- Main Component ---
const StaffAssignmentPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const { staffList } = useStaffStore();
    const [hasMounted, setHasMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [staffData, setStaffdata] = useState<any>();
    const [currentDuty, setCurrentDuty] = useState<any>();
    const [currentLeave, setCurrentLeave] = useState<any>();

    useEffect(() => {
        setHasMounted(true);
        const foundStaff: any = staffList.find((item: any) => item.id === id);

        if (foundStaff) {
            setStaffdata(foundStaff);
            if (foundStaff.status === 'DUTY' && foundStaff.duties?.length > 0) {
                // Assuming duties are sorted by most recent first, or finding the one without a relievingTime
                const activeDuty = foundStaff.duties.find((d: any) => !d.relievingTime) || foundStaff.duties[0];
                setCurrentDuty(activeDuty);
            }
            if (foundStaff.status === 'LEAVE' && foundStaff.leaves?.length > 0) {
                const activeLeave = foundStaff.leaves[0];
                setCurrentLeave(activeLeave);
            }
        }
    }, [id, staffList]);

    // --- Forms Setup ---
    const formDuty = useForm<z.infer<typeof assignDutySchema>>({
        resolver: zodResolver(assignDutySchema),
        defaultValues: {
            dutyType: "", // Default to empty string instead of undefined
            location: "",
            assignedBy: "",
        }
    });

    const formLeave = useForm<z.infer<typeof assignLeaveSchema>>({
        resolver: zodResolver(assignLeaveSchema),
        defaultValues: {
            leaveType: "",
            // fromDate: "",
            approvedBy: "",
        }
    });

    const formFinishDuty = useForm<z.infer<typeof finishDutySchema>>({
        resolver: zodResolver(finishDutySchema),
    });

    const formFinishLeave = useForm<z.infer<typeof finishLeaveSchema>>({
        resolver: zodResolver(finishLeaveSchema),
    });
    // --- Submit Handlers ---
    const onAssignDuty = async (values: z.infer<typeof assignDutySchema>) => {
        setIsLoading(true);
        try {
            const payload = {
                ...values,
                staffId: id,
                date: values.date.toISOString(),
                reportingTime: values.reportingTime.toISOString()
            };

            // PLACEHOLDER API URL
            const res = await fetch('/api/duty', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Duty assigned successfully.");
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to assign duty.");
        } finally {
            setIsLoading(false);
        }
    };

    const onAssignLeave = async (values: z.infer<typeof assignLeaveSchema>) => {
        setIsLoading(true);
        try {
            const payload = {
                ...values,
                staffId: id,
                fromDate: values.fromDate.toISOString()
            };

            // PLACEHOLDER API URL
            const res = await fetch('/api/leave', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Leave assigned successfully.")
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to assign leave.")
        } finally {
            setIsLoading(false);
        }
    };

    const onFinishDuty = async (values: z.infer<typeof finishDutySchema>) => {
        setIsLoading(true);
        try {
            const payload = {
                staffId: id,
                relievingTime: values.relievingTime.toISOString()
            };

            // PLACEHOLDER API URL (using dutyId from state)
            const res = await fetch(`/api/duty?dutyId=${currentDuty?.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Duty finished successfully.");
                router.refresh();
            }
        } catch (error) {
            toast(" Failed to finish duty.");
        } finally {
            setIsLoading(false);
        }
    };

    const onFinishLeave = async (values: z.infer<typeof finishLeaveSchema>) => {
        setIsLoading(true);
        try {
            const payload = {
                staffId: id,
                toDate: values.toDate.toISOString()
            };

            // PLACEHOLDER API URL (using leaveId from state)
            const res = await fetch(`/api/leave?leaveId=${currentLeave?.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Leave finished successfully.")
                router.refresh();
            }
        } catch (error) {
            toast.error("Failed to finish leave.")
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helper Component for Date & Time Picker ---
    const DateTimePicker = ({ field, label }: { field: any, label: string }) => (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                                format(field.value, "PPP HH:mm")
                            ) : (
                                <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    {/* Calendar with dropdowns as requested */}
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    <div className="p-3 border-t border-border">
                        <Input
                            type="time"
                            onChange={(e) => {
                                const date = field.value ? new Date(field.value) : new Date();
                                const [hours, minutes] = e.target.value.split(':');
                                date.setHours(parseInt(hours, 10));
                                date.setMinutes(parseInt(minutes, 10));
                                field.onChange(date);
                            }}
                        />
                    </div>
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    );

    if (!hasMounted) return null;
    if (!staffData) return <div className="p-8 text-center">Staff not found</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{staffData.name}</h1>
                    <p className="text-sm text-muted-foreground">Force No: {staffData.pnoNo}</p>
                </div>
                <div className="text-right">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        staffData.status === 'AVAILABLE' ? "bg-green-100 text-green-800" :
                            staffData.status === 'DUTY' ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                    )}>
                        {staffData.status}
                    </span>
                </div>
            </div>

            {/* --- CONDITION 1: STATUS IS AVAILABLE --- */}
            {staffData.status === 'AVAILABLE' && (
                <Tabs defaultValue="duty" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="duty">Assign Duty</TabsTrigger>
                        <TabsTrigger value="leave">Assign Leave</TabsTrigger>
                    </TabsList>

                    <TabsContent value="duty" className="mt-4 border rounded-lg p-4">
                        <Form {...formDuty}>
                            <form onSubmit={formDuty.handleSubmit(onAssignDuty)} className="space-y-4">
                                <FormField control={formDuty.control} name="dutyType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duty Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select duty type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Patrol">Patrol</SelectItem>
                                                <SelectItem value="Station">Station</SelectItem>
                                                <SelectItem value="Home">Home</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={formDuty.control} name="location" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl><Input placeholder="e.g. Sainpur gav" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={formDuty.control} name="date" render={({ field }) => (
                                    <DateTimePicker field={field} label="Duty Date" />
                                )} />
                                <FormField control={formDuty.control} name="reportingTime" render={({ field }) => (
                                    <DateTimePicker field={field} label="Reporting Time" />
                                )} />
                                <FormField control={formDuty.control} name="assignedBy" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned By</FormLabel>
                                        <FormControl><Input placeholder="Inspector Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Assign Duty
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="leave" className="mt-4 border rounded-lg p-4">
                        <Form {...formLeave}>
                            <form onSubmit={formLeave.handleSubmit(onAssignLeave)} className="space-y-4">
                                <FormField control={formLeave.control} name="leaveType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Leave Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                                <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={formLeave.control} name="fromDate" render={({ field }) => (
                                    <DateTimePicker field={field} label="From Date" />
                                )} />
                                <FormField control={formLeave.control} name="approvedBy" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Approved By</FormLabel>
                                        <FormControl><Input placeholder="Inspector Name" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Assign Leave
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            )}

            {/* --- CONDITION 2: STATUS IS DUTY --- */}
            {staffData.status === 'DUTY' && (
                <div className="border rounded-lg p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-2">Active Duty</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Location: {currentDuty?.location} <br />
                        Reported At: {currentDuty?.reportingTime && new Date(currentDuty.reportingTime).toLocaleString()}
                    </p>

                    <Form {...formFinishDuty}>
                        <form onSubmit={formFinishDuty.handleSubmit(onFinishDuty)} className="space-y-4">
                            <FormField control={formFinishDuty.control} name="relievingTime" render={({ field }) => (
                                <DateTimePicker field={field} label="Relieving Time" />
                            )} />
                            <Button type="submit" variant="default" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finish Duty
                            </Button>
                        </form>
                    </Form>
                </div>
            )}

            {/* --- CONDITION 3: STATUS IS LEAVE --- */}
            {staffData.status === 'LEAVE' && (
                <div className="border rounded-lg p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-2">Active Leave</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Type: {currentLeave?.leaveType} <br />
                        Started At: {currentLeave?.fromDate && new Date(currentLeave.fromDate).toLocaleString()}
                    </p>

                    <Form {...formFinishLeave}>
                        <form onSubmit={formFinishLeave.handleSubmit(onFinishLeave)} className="space-y-4">
                            <FormField control={formFinishLeave.control} name="toDate" render={({ field }) => (
                                <DateTimePicker field={field} label="Leave End Date (To Date)" />
                            )} />
                            <Button type="submit" variant="default" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Finish Leave
                            </Button>
                        </form>
                    </Form>
                </div>
            )}

        </div>
    );
};

export default StaffAssignmentPage;