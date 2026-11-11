"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import React, { memo} from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { GEMINI_CHANNEL } from "@/inngest/channel/gemini";
import { GeminiDialog, GeminiFormValues } from "./dialog";
import { fetchGeminiRealtimeToken } from "./actions";

type GeminiNodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};
type GeminiNodeType = Node<GeminiNodeData>;
export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
    const { setNodes } = useReactFlow();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
        nodeId : props.id,
        channel : GEMINI_CHANNEL,
        topic : "status",
        refreshToken : fetchGeminiRealtimeToken,
    })
    const handleSubmit = (values : GeminiFormValues) => {
        setNodes((nodes) => 
                    nodes.map((node) => {
                        if (node.id === props.id) {
                            return { ...node, data: { ...node.data , ...values } };
                        }
                        return node;
                    })
                );
    }
    const handleOpenSettings = () => setDialogOpen(true);
    const nodeData = props.data;
    const description = nodeData?.model
     ? `Model: ${nodeData.model}` : "Not Configured";
     return (
        <>
            <GeminiDialog 
            open = {dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultvalues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                description={description}
                name="Gemini"
                icon="/logos/gemini.svg"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}

                />

        </> 
     )
});
GeminiNode.displayName = "GeminiNode";