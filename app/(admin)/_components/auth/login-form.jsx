"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username is required",
  }),
  password: z.string().min(2, {
    message: "Password is required",
  }),
});

export function LoginForm() {
  const { user, login, loading, error } = useAuthStore();
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    await login(values.username, values.password);
  };

  useEffect(() => {
    if (error && error.message) {
      toast.error(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, router]);

  useEffect(() => {
    // Get redirect URL from cookies
    const storedRedirect = document.cookie
      .split("; ")
      .find((row) => row.startsWith("redirectUrl="))
      ?.split("=")[1];

    if (storedRedirect) {
      setRedirectUrl(decodeURIComponent(storedRedirect));
    }
  }, []);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your YSFON account
                </p>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8 mt-3"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            {...field}
                            placeholder="Username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            type="password"
                            placeholder="Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || loading}
                    className="w-full cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className=" animate-spin" /> Please wait...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
          <div className="relative hidden bg-muted md:block">
            <Image
              src="/placeholder.svg"
              alt="Image"
              layout="fill"
              objectFit="cover"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
