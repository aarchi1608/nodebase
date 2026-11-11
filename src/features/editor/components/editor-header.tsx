"use client";
import { useEffect,  useRef , useState } from "react";
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SaveIcon } from "lucide-react"
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useSuspenseWorkflow, useUpdateWorkflow, useUpdateWorkflowName } from "@/features/workflows/hooks/use-workflows";
import { Input } from "@/components/ui/input";
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";

export const EditorHeader = ({workflowId} : {workflowId : string}) => {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <div className="flex flex-row items-center justify-between gap-x-4 w-full">
            <EditorBreadcrumbs workflowId={workflowId}/>
            <EditorSaveButton workflowId={workflowId}/>
        </div>
        </header>
    )
}
export const EditorBreadcrumbs = ({workflowId} : {workflowId : string}) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild className="text-muted-foreground transition-colors cursor-pointer hover:text-foreground">
                        <Link prefetch href="/workflows">Workflows</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <EditorNameInput workflowId={workflowId}/>
            </BreadcrumbList>
            
        </Breadcrumb>
    )
}
export const EditorSaveButton = ({workflowId} : {workflowId : string}) => {
    const editor = useAtomValue(editorAtom);
    const saveWorkflow = useUpdateWorkflow();

    const handleSave = () => {
        if (!editor) return;
        const nodes = editor.getNodes();
        const edges = editor.getEdges();
        saveWorkflow.mutate({id : workflowId , nodes , edges});
    }
    return (
        <div className="ml-auto">
            <Button disabled={saveWorkflow.isPending} size="sm" onClick={handleSave}>
                <SaveIcon className="size-4"/>
                Save
            </Button>
        </div>
    )
};
export const EditorNameInput = ({workflowId} : {workflowId : string}) => {
    const {data : workflow} = useSuspenseWorkflow(workflowId);
    const updateWorkflow = useUpdateWorkflowName();
    const [name , setName] = useState(workflow.name);
    const [isEditing , setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(()=>{
        if (workflow.name) {
            setName(workflow.name);
        }
    },[workflow.name]);
    useEffect(()=>{
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    },[isEditing]);
    const handleSave = async() => {
        if (name === workflow.name) {
            setIsEditing(false);
            return;
        }
        try {
            await updateWorkflow.mutateAsync({id : workflowId , name});
        } catch  {
            setName(workflow.name);
        }finally {
            setIsEditing(false);
        }
    }

    const handleKeyDown = (e : React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave(); 
        }
        else if (e.key === "Escape") {
            setName(workflow.name);
            setIsEditing(false);
        }
    }

    if (isEditing) {
        return (
            <Input ref={inputRef} 
            disabled={updateWorkflow.isPending}
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
            onBlur={handleSave} onKeyDown={handleKeyDown} 
            className="h-7 w-auto min-w-[180px] px-2"/>
        )
    }
    return (
        <BreadcrumbItem onClick={()=>setIsEditing(true)} className="cursor-pointer transition-colors hover:text-foreground">
            {workflow.name}
        </BreadcrumbItem>
    )
}

