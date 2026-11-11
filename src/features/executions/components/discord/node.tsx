"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import React, { memo} from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { useNodeStatus } from "../../hooks/use-node-status";
import { DiscordDialog, DiscordFormValues } from "./dialog";
import { fetchDiscordRealtimeToken } from "./actions";
import { DISCORD_CHANNEL } from "@/inngest/channel/discord";

type DiscordNodeData = {
    variableName? : string;
    webhookUrl?: string;
    content?: string;
    userName?: string;
};
type DiscordNodeType = Node<DiscordNodeData>;
export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
    const { setNodes } = useReactFlow();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
        nodeId : props.id,
        channel : DISCORD_CHANNEL,
        topic : "status",
        refreshToken : fetchDiscordRealtimeToken,
    })
    const handleSubmit = (values : DiscordFormValues) => {
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
    const description = nodeData?.content
     ? `Send ${nodeData.content}` : "Not Configured";
     return (
        <>
            <DiscordDialog 
            open = {dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
            defaultvalues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                description={description}
                name="Discord"
                icon="/logos/discord.svg"
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                status={nodeStatus}

                />

        </> 
     )
});
DiscordNode.displayName = "DiscordNode";