"use client";

import { CredentialType } from "@/generated/prisma/enums";
import { useCreateCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(CredentialType),
    value: z.string().min(1, "Value is required")
});

type FormValues = z.infer<typeof formSchema>;
const CredentialTypeOptions = [
    { label: "OpenAI", value: CredentialType.OPENAI , logo : "/logos/openai.svg"},
    { label: "Anthropic", value: CredentialType.ANTHROPIC , logo : "/logos/anthropic.svg"},
    { label: "Gemini", value: CredentialType.GEMINI , logo : "/logos/gemini.svg"}
];
interface CredentialFormProps {
    initialData?:{
        id ?: string;
        name : string;
        type: CredentialType;
        value : string;
    }
}
export const CredentialForm = ({initialData} : (CredentialFormProps)) => {
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const {handleError , modal} = useUpgradeModal();
    const router = useRouter();
    const isEdit = !!initialData?.id;
    const form = useForm<FormValues>({
       resolver: zodResolver(formSchema),
       defaultValues: {
        name: initialData?.name || "",
        type: initialData?.type || CredentialType.OPENAI,
        value: initialData?.value || ""
       }
    });
    const onSubmit = async (data : FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({id: initialData.id, ...data});
        } else {
            await createCredential.mutateAsync(data , {
                onError: (error) => {handleError(error);}
            });
        }
    }
    return (
        <>  
            {modal}
            <Card className="shadow-none">
            <CardHeader>
                <CardTitle>
                    {isEdit ? "Edit Credential" : "Create Credential"}
                </CardTitle>
                <CardDescription>
                    {isEdit ? " Update you credential info" : "Add new credential info"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select credential type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CredentialTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </form>


                <FormField
                    control={form.control}
                    name="value"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                                <Input placeholder="API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={createCredential.isPending || updateCredential.isPending}>
                            {isEdit ? "Update" : "Create"}
                        </Button>
                        <Button variant="outline" onClick={() => router.push("/credentials")} disabled={createCredential.isPending || updateCredential.isPending}>
                            Reset
                        </Button>
                    </div>
                </Form>
            </CardContent>
        </Card>
        </>
    )
}

export const CredentialView =({credentialId}: {credentialId: string})=>{
    const params = useParams();
    const {data : credential} = useSuspenseCredential(credentialId);
    return (
        <CredentialForm initialData={credential} />
    );
};
