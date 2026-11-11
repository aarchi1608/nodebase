"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import React, { memo} from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { OPENAI_CHANNEL } from "@/inngest/channel/openai";
import { OpenAIDialog, OpenAIFormValues } from "./dialog";
import { fetchOpenAIRealtimeToken } from "./actions";

type OpenAINodeData = {
    variableName?: string;
    model?: string;
    systemPrompt?: string;
    userPrompt?: string;
};
type OpenAINodeType = Node<OpenAINodeData>;
export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
    const { setNodes } = useReactFlow();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
        nodeId : props.id,
        channel : OPENAI_CHANNEL,
        topic : "status",
        refreshToken : fetchOpenAIRealtimeToken,
    })
    const handleSubmit = (values : OpenAIFormValues) => {
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
            <OpenAIDialog 
            open = {dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultvalues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                description={description}
                name="OpenAI"
                icon="/logos/openai.svg"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}

                />

        </> 
     )
});
OpenAINode.displayName = "OpenAINode";
