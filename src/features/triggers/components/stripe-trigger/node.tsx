import { NodeProps } from "@xyflow/react";
import React, { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { StripeTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { STRIPE_TRIGGER_CHANNEL_NAME } from "@/inngest/channel/stripe-trigger";
import { fetchStripeTriggerRealtimeToken } from "./actions";
export const StripeTriggerNode = memo((props : NodeProps) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
                nodeId : props.id,
                channel : STRIPE_TRIGGER_CHANNEL_NAME,
                topic : "status",
                refreshToken : fetchStripeTriggerRealtimeToken
        });

    const handleOpenSettings = () => setDialogOpen(true);
    return (
        <>
        <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode
        {...props}
        name="Stripe"
        icon="/logos/stripe.svg"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});