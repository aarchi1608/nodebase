"use server";

import { openaiChannel } from "@/inngest/channel/openai";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type OpenAIToken = Realtime.Token<
    typeof openaiChannel,
    ["status"]
>;

export async function fetchOpenAIRealtimeToken() : Promise<OpenAIToken>{
    const token = await getSubscriptionToken(inngest , {
        channel : openaiChannel(),
        topics : ["status"],
    });
    return token;
    
}
