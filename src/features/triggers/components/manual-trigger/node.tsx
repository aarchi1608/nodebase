import { NodeProps } from "@xyflow/react";
import React, { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointer } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { MANUAL_TRIGGER_CHANNEL_NAME } from "@/inngest/channel/manual-request";
import { fetchManualTriggerRealtimeToken } from "./actions";

export const ManualTriggerNode = memo((props : NodeProps) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const nodeStatus = useNodeStatus({
            nodeId : props.id,
            channel : MANUAL_TRIGGER_CHANNEL_NAME,
            topic : "status",
            refreshToken : fetchManualTriggerRealtimeToken
    });

    const handleOpenSettings = () => setDialogOpen(true);
    return (
        <>
        <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <BaseTriggerNode
        {...props}
        name="When clicking 'Execute Workflow'"
        icon={MousePointer}
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        />
        </>
    )
});