"use client";

import axios from "axios";
import {
  AlertCircle,
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { parseExcel } from "@/utils/excelToData";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "STATION", // This is the default value
    },
  });

  const selectedRole = watch("role");

  // Ensure the form value is registered correctly for the Select component on mount
  useEffect(() => {
    register("role");
  }, [register]);

  const onSubmit = async (data: any) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/auth/login", data);

      if (response.data.success) {
        login(response.data.token, response.data.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel(file);
      console.log("Parsed Data:", data);



    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center  px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
              Duty Management
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Duty Management System
            </p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Sign in</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Centered Role Selection */}
              <div className="flex flex-col  w-full space-y-2">
                <Label htmlFor="role" className="text-center">Please select role</Label>
                <div className="w-full max-w-[250px]"> {/* Control width to keep it centered and tidy */}
                  <Select
                    onValueChange={(value) => setValue("role", value)}
                    value={selectedRole}
                  >
                    <SelectTrigger id="role" className="bg-white text-center">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATION">Police Station</SelectItem>
                      <SelectItem value="ADMIN">District Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@agency.gov"
                    className="pl-10 bg-white"
                    {...register("email", { required: true })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-white"
                    {...register("password", { required: true })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full my-4 bg-blue-600 "
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}