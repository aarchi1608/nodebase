import { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channel/stripe-trigger";
type Stripe = Record<string, unknown>;
export const stripeTriggerExecutor : NodeExecutor<Stripe> = async ({ 
    data,
    nodeId,
    context,
    step,
    publish,
 }) => {
    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status : "loading",
        }),

    )
    await publish(
        stripeTriggerChannel().status({
            nodeId,
            status : "success",
        }),
        
    )
    
    const result = await step.run("stripe-trigger" , async()=>context);
    return result;
};