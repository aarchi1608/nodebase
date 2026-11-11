"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import React, { memo} from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { ANTHROPIC_CHANNEL } from "@/inngest/channel/anthropic";
import { AnthropicDialog, AnthropicFormValues } from "./dialog";
import { fetchAnthropicRealtimeToken } from "./actions";

type AnthropicNodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};
type AnthropicNodeType = Node<AnthropicNodeData>;
export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
    const { setNodes } = useReactFlow();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
        nodeId : props.id,
        channel : ANTHROPIC_CHANNEL,
        topic : "status",
        refreshToken : fetchAnthropicRealtimeToken,
    })
    const handleSubmit = (values : AnthropicFormValues) => {
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
            <AnthropicDialog 
            open = {dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultvalues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                description={description}
                name="Anthropic"
                icon="/logos/anthropic.svg"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}

                />

        </> 
     )
});
AnthropicNode.displayName = "AnthropicNode";
