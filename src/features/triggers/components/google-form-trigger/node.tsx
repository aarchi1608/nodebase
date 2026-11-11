import { NodeProps } from "@xyflow/react";
import React, { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchGoogleFormTriggerRealtimeToken } from "./actions";
import { GOOGLE_FORM_TRIGGER_CHANNEL_NAME } from "@/inngest/channel/google-form-trigger";
export const GoogleFormTrigger = memo((props : NodeProps) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
                nodeId : props.id,
                channel : GOOGLE_FORM_TRIGGER_CHANNEL_NAME,
                topic : "status",
                refreshToken : fetchGoogleFormTriggerRealtimeToken
        });

    const handleOpenSettings = () => setDialogOpen(true);
    return (
        <>
        <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode
        {...props}
        name="Google Form"
        icon="/logos/googleform.svg"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});