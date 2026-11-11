"use client";

import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import {  LucideIcon, Workflow } from "lucide-react";
import { WorkflowNode } from "@/components/workflow-node";
import { memo } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import Image from "next/image";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { NodeStatus  , NodeStatusIndicator} from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps{
    icon : LucideIcon | string
    name : string;
    description?:string;
    children ?: React.ReactNode;
    onSettings?: ()=>void;
    onDoubleClick ?: ()=>void;
    status?: NodeStatus;
};
export const BaseExecutionNode = memo(
    ({
    id,
    icon : Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
    status = "initial"

} : BaseExecutionNodeProps) => {
    const {setNodes , setEdges} = useReactFlow();
        const handleDelete = () => {
            setNodes((currentNodes) => {
                const updatedNodes = currentNodes.filter((node) => node.id !== id);
                return updatedNodes;
            });
            setEdges((currentEdges) => {
                const updatedEdges = currentEdges.filter((edge) => edge.source !== id && edge.target !== id);
                return updatedEdges;
            });
        }
    return (
        <WorkflowNode
        name={name}
        description={description}
        onSettings={onSettings}
        onDelete={handleDelete}
    >
        <NodeStatusIndicator
        status={status}
        variant="border"
        >
        <BaseNode status={status} onDoubleClick={onDoubleClick}>
            <BaseNodeContent>
                {typeof Icon === "string" ? (
                    <Image src={Icon} alt={name} height={16} width={16} />
                ) : (
                    <Icon className="size-4 text-muted-foreground" />
                )}
                {
                    children
                }
                <BaseHandle 
                id = "target-1"
                type="target"
                position={Position.Left} />
                <BaseHandle 
                id = "source-1"
                type="source"
                position={Position.Right} />

            </BaseNodeContent>
        </BaseNode>
        </NodeStatusIndicator>
    </WorkflowNode>
    )
},
);

BaseExecutionNode.displayName = "BaseExecutionNode";