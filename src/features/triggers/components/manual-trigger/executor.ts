import { NodeExecutor } from "@/features/executions/types";
import { manualTriggerChannel } from "@/inngest/channel/manual-request";
import { resumePluginState } from "next/dist/build/build-context";
type ManualTriggerData = Record<string, unknown>;
export const manualTriggerExecutor : NodeExecutor<ManualTriggerData> = async ({ 
    data,
    nodeId,
    context,
    step,
    publish,
 }) => {
    await publish(
        manualTriggerChannel().status({
            nodeId,
            status : "loading",
        }),

    )
    await publish(
        manualTriggerChannel().status({
            nodeId,
            status : "success",
        }),
        
    )
    
    const result = await step.run("manual-trigger" , async()=>context);
    return result;
};