"use client";
import z from "zod";

const formSchema = z.object({
    variableName : z
    .string()
    .min(1 , {message : "Variable name is required"})
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {message : "Variable name must start with a letter, $ or _ and can only contain letters, numbers, $ and _"}),
    endpoint : z.string({message : "Please enter a valid url"}),
    method : z.enum(["POST" , "PUT" , "PATCH" , "GET" , "DELETE"]),
    body : z
    .string()
    .optional()
    // .refine()
})

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
interface Props{
    open : boolean;
    onOpenChange : (open : boolean) => void;
    onSubmit : (values : z.infer<typeof formSchema>) => void;
    defaultvalues ?: Partial<HttpRequestFormValues>;
};


export type HttpRequestFormValues = z.infer<typeof formSchema>;

export const HttpRequestDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultvalues,
} : Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : {
            variableName : defaultvalues?.variableName || "",
            endpoint : defaultvalues?.endpoint,
            method : defaultvalues?.method,
            body : defaultvalues?.body,
        }
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName : defaultvalues?.variableName || "",
                endpoint : defaultvalues?.endpoint,
                method : defaultvalues?.method,
                body : defaultvalues?.body,
            });

        }
    }, [open , defaultvalues , form]);

    const watchMethod = form.watch("method");
    const watchVariableName = form.watch("variableName") || "myApiCall";
    const showBodyField = ["POST" , "PUT" , "PATCH"].includes(watchMethod);
    const handleSubmit = (values : z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>HTTP Request</DialogTitle>
                    <DialogDescription>
                        Configure the settings for the HTTP Request trigger here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-8 mt-4"
                    >

                        <FormField 
                        control={form.control}
                        name="variableName"
                        render={({ field}) => (
                            <FormItem>
                                <FormLabel>Variable Name</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="Enter a variable name"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Use this name to reference the result in other nodes:
                                    {""}
                                    {`{(${watchVariableName}.httpResponse.data)}`}
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name="method"
                        render={({ field}) => (
                            <FormItem>
                                <FormLabel>METHOD</FormLabel>
                                <Select 
                                onValueChange={field.onChange}
                                value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a method" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                        <SelectItem value="PATCH">PATCH</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    The HTTP method to use for this request
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <FormField 
                        control={form.control}
                        name="endpoint"
                        render={({ field}) => (
                            <FormItem>
                                <FormLabel>Endpoint URL</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="https://api.example.com/users/{(httpResponse.data.id)}"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Static URL or use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify the objects.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />
                        {showBodyField && (
                            <FormField
                            render={({ field}) => (
                            <FormItem>
                                <FormLabel>Request Body</FormLabel>
                                <FormControl>
                                    <Textarea
                                    className="min-h-[120px] font-mono text-sm"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                   JSON with template variables .Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify the objects.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                        control={form.control}
                        name="body"
                            />
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
};