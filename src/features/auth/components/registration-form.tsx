"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {email, z} from "zod";
import { Button } from "@/components/ui/button";
import {
    Card , CardContent , CardDescription , CardHeader , CardTitle,
}from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
    email : z.email("Please enter valid email address"),
    password : z.string().min(1 , "Password is required"),
    confirmPassword : z.string(),
})
.refine((data) => data.password === data.confirmPassword , {
    message : "Passwords don't match" , 
    path : ["confirmPassword"]
})

type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterForm() {
    const router = useRouter();
    const form = useForm<RegisterFormValues>({
    resolver : zodResolver(registerSchema),
    defaultValues : {
        email : "",
        password : "",
        confirmPassword : "",
    },
});
    const onSubmit = async (values : RegisterFormValues) => {
        await authClient.signUp.email({
            name : values.email  , 
            password : values.password,
            email : values.email,
            callbackURL : "/",
        },
        {
            onSuccess : () => {
                router.push("/")
            },
            onError : (ctx) => {
                toast.error(ctx.error.message);
            },
        },
    )
    }
    const signInGithub = async () => {
       const data = await authClient.signIn.social({
            provider : "github",
            callbackURL : "/",
        },
        {
            onSuccess : () => {
                router.push("/")
            },
            onError : (ctx) => {
                toast.error(ctx.error.message)
            },
        }
    );
    };
    const signInGoogle = async () => {
       const data = await authClient.signIn.social({
            provider : "google",
            callbackURL : "/",
        },
        {
            onSuccess : () => {
                router.push("/")
            },
            onError : (ctx) => {
                toast.error(ctx.error.message)
            },
        }
    );
    };
    const isPending = form.formState.isSubmitting;
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        SignUp to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline" className="width-full" type="button" disabled={isPending} onClick={signInGithub}>
                                        <Image src="/logos/github.svg" width={20} height={20} alt="GitHub" />
                                        Continue with GitHub
                                    </Button>
                                    <Button variant="outline" className="width-full" type="button" disabled={isPending} onClick={signInGoogle}>
                                        <Image src="/logos/google.svg" width={20} height={20} alt="Google" />
                                        Continue with Google
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField 
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="abc@example.com" {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField 
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="*****" {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField 
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="*****" {...field}/>
                                                </FormControl>
                                                <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <Button className="w-full" type="submit" disabled={isPending}>
                                        SignUp
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Already have an account? 
                                    <Link href="/login" className="underline underline-offset-4">LogIn
                                    </Link>
                                </div>
                                
                            </div>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};
