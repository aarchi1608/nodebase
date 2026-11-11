import { NodeExecutor } from "@/features/executions/types";
import { googleFormTriggerChannel } from "@/inngest/channel/google-form-trigger";
type googleFormTriggerData = Record<string, unknown>;
export const googleFormTriggerExecutor : NodeExecutor<googleFormTriggerData> = async ({ 
    data,
    nodeId,
    context,
    step,
    publish,
 }) => {
    await publish(
        googleFormTriggerChannel().status({
            nodeId,
            status : "loading",
        }),

    )
    await publish(
        googleFormTriggerChannel().status({
            nodeId,
            status : "success",
        }),
        
    )
    
    const result = await step.run("google-form-trigger" , async()=>context);
    return result;
};