"use client";
import z from "zod";

const formSchema = z.object({
    variableName : z
    .string()
    .min(1 , {message : "Variable name is required"})
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {message : "Variable name must start with a letter, $ or _ and can only contain letters, numbers, $ and _"}),
    webhookUrl : z.string().min(1 , {message : "Webhook URL is required"}),
    content : z.string().min(1 , {message : "Content is required"}),
    userName : z.string().optional(),  
})

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
interface Props{
    open : boolean;
    onOpenChange : (open : boolean) => void;
    onSubmit : (values : z.infer<typeof formSchema>) => void;
    defaultvalues ?: Partial<DiscordFormValues>;
};


export type DiscordFormValues = z.infer<typeof formSchema>;

export const DiscordDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultvalues,

} : Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver : zodResolver(formSchema),
        defaultValues : {
            variableName : defaultvalues?.variableName || "",
            webhookUrl : defaultvalues?.webhookUrl || "",
            content : defaultvalues?.content || "",
            userName : defaultvalues?.userName || "",
        }
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName : defaultvalues?.variableName || "",
                webhookUrl : defaultvalues?.webhookUrl || "",
                content : defaultvalues?.content || "",
                userName : defaultvalues?.userName || "",
            });

        }
    }, [open , defaultvalues , form]);
    const watchVariableName = form.watch("variableName") || "myApiCall";
    const handleSubmit = (values : z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discord</DialogTitle>
                    <DialogDescription>
                        Configure the settings for the Discord trigger here.
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
                                    {`{(${watchVariableName}.text)}`}
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                        />

                        
                            <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field}) => (
                            <FormItem>
                                <FormLabel>Webhook URL</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="https://discord.com/api/webhooks/../.."
                                    className="min-h-[80px] font-mono text-sm"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                   Sets the behaviour of the assistant. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify the objects.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                            />
                            <FormField
                            control={form.control}
                            name="content"
                            render={({ field}) => (
                            <FormItem>
                                <FormLabel>Content</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Enter the content to send to the webhook:"
                                    className="min-h-[80px] font-mono text-sm"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    The message to send. You can reference other variables in the prompt using {"{{variableName}}"}.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                            />
                        <FormField
                            control={form.control}
                            name="userName"
                            render={({ field}) => (
                            <FormItem>
                                <FormLabel>User Name</FormLabel>
                                <FormControl>
                                    <Input
                                    placeholder="Enter the user name"
                                    className="min-h-[80px] font-mono text-sm"
                                    {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                   The user name to send the message as.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                            />
                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
};