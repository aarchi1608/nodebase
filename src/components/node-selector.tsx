"use client";

import { NodeType } from "@/generated/prisma/enums";
import {createId} from "@paralleldrive/cuid2";
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { SheetTrigger  , Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription} from "./ui/sheet";
import { Separator } from "@radix-ui/react-separator";
import { useReactFlow } from "@xyflow/react";
import { use, useCallback } from "react";
import { toast } from "sonner";
import { set } from "zod";
import { no } from "zod/v4/locales";
export type NodeTypeOption = {
    type : NodeType,
    label : string,
    description : string,
    icon : React.ComponentType<{className ?: string}> | string

};
const triggerNodes : NodeTypeOption[] = [
    {
        type : NodeType.MANUAL_TRIGGER,
        label : "Manual Trigger",
        description : "Trigger the workflow manually",
        icon : MousePointerIcon,
    },
    {
        type : NodeType.GOOGLE_FORM_TRIGGER,
        label : "Google Form Trigger",
        description : "Trigger the workflow when a Google Form is submitted",
        icon : "/logos/googleform.svg",
    },
    {
        type : NodeType.STRIPE_TRIGGER,
        label : "Stripe Trigger",
        description : "Trigger the workflow when a Stripe event occurs",
        icon : "/logos/stripe.svg",
    }
];


const executionNodes : NodeTypeOption[] = [
    {
        type : NodeType.HTTP_REQUEST,
        label : "HTTP Request",
        description : "Make an HTTP request to an external API",
        icon : GlobeIcon,
    },
    {
        type : NodeType.GEMINI,
        label : "Gemini",
        description : "Interact with the Gemini API",
        icon : "/logos/gemini.svg",
    },
    {
        type : NodeType.OPENAI,
        label : "OpenAI",
        description : "Interact with the OpenAI API",
        icon : "/logos/openai.svg",
    },
    {
        type : NodeType.ANTHROPIC,
        label : "Anthropic",
        description : "Interact with the Anthropic API",
        icon : "/logos/anthropic.svg",
    },
    {
        type : NodeType.DISCORD,
        label : "Discord",
        description : "Interact with the Discord API",
        icon : "/logos/discord.svg",
    },
];

interface NodeSelectorProps {
    open : boolean;
    onOpenChange : (open : boolean) => void;
    children : React.ReactNode;
};
export function NodeSelector({open, onOpenChange, children} : NodeSelectorProps) {
    const {setNodes , getNodes , screenToFlowPosition} = useReactFlow();
    const handleNodeSelect = useCallback((selection : NodeTypeOption)=>{
            if (selection.type === NodeType.MANUAL_TRIGGER){
                const nodes = getNodes();
                const hasManualTrigger = nodes.some(
                    (node) => node.type === NodeType.MANUAL_TRIGGER,
                );
                if (hasManualTrigger) {
                    toast.error("Only one manual trigger is allowed per workflow");
                    return;
                }
            }

            setNodes((nodes)=>{
                const hasInitialNode = nodes.some(
                    (node) => node.type === NodeType.INITIAL,
                );
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const flowPosition = screenToFlowPosition({x : centerX + (Math.random() - 0.5) * 200, y : centerY + (Math.random() - 0.5) * 200});

                const newNode = {
                    id : createId(),
                    data : {},
                    position: flowPosition,
                    type : selection.type,
                };
                if (hasInitialNode) {
                    return [newNode];
                }
                return [...nodes , newNode];
            });

    } , [screenToFlowPosition, getNodes , setNodes , onOpenChange]);
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        What triggers this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger is an event that starts the workflow.
                    </SheetDescription>          
                  </SheetHeader>
                  <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                            className="w-full justify-start h-auto py-5 px-4 *:rounded-none
                            cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            key = {nodeType.type}
                            onClick={()=>handleNodeSelect(nodeType)}>
                                
                            <div className="flex items-center gap-6 w-full overflow-hidden">
                                {typeof Icon === "string" ? (
                                    <img src={Icon} alt={nodeType.label} className="size-5 object-contain rounded-sm"/>
                                ) : (
                                    <Icon className="size-5"/>
                                )
                                }
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-sm" >
                                        {nodeType.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {nodeType.description}
                                    </span>
                                </div>
                                
                            </div>
                            </div>
                        )
                    })}
                  </div>
                  <Separator/>
                  <div>
                    {executionNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        return (
                            <div
                            className="w-full justify-start h-auto py-5 px-4 *:rounded-none
                            cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                            key = {nodeType.type}
                            onClick={()=>handleNodeSelect(nodeType)}>
                                
                            <div className="flex items-center gap-6 w-full overflow-hidden">
                                {typeof Icon === "string" ? (
                                    <img src={Icon} alt={nodeType.label} className="size-5 object-contain rounded-sm"/>
                                ) : (
                                    <Icon className="size-5"/>
                                )
                                }
                                <div className="flex flex-col items-start text-left">
                                    <span className="font-medium text-sm" >
                                        {nodeType.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {nodeType.description}
                                    </span>
                                </div>
                                
                            </div>
                            </div>
                        )
                    })}
                  </div>
            </SheetContent>
        </Sheet>
    )
}