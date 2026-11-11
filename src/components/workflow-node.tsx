"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";

interface WorkflowNodeProps {
    children : ReactNode;
    onDelete?: () => void;
    onSettings?: () => void;
    name ?: string;
    description ?: string;
    showToolBar ?: boolean;
}
export function WorkflowNode({children, onDelete, onSettings, name, description , showToolBar = true}:WorkflowNodeProps) {
    return (
        <>
            {showToolBar && (
                <NodeToolbar>
                <Button size="sm" variant="ghost" onClick={onSettings}>
                    <SettingsIcon className="size-4"/>
                </Button>
                <Button size="sm" variant="ghost" onClick={onDelete}>
                    <TrashIcon className="size-4"/>
                </Button>
            </NodeToolbar>
            )}
        {
            children 
        }
        {name && (
            <NodeToolbar
            position={Position.Bottom}
            isVisible
            className="max-w-[200px] text-center"
            >

                <p className="font-medium"> {name}</p>
                {description && 
                <p className="truncate text-sm text-muted-foreground">{description}</p>
                }
            </NodeToolbar>

        )}
        </>
    )
}