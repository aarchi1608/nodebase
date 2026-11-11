import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { OpenAIExecutor } from "../components/openai/executor";
import { AnthropicExecutor } from "../components/anthropic/executor";
import { DiscordExecutor } from "../components/discord/executor";

export const executorRegistry : Partial<Record<NodeType , NodeExecutor>> = {
    [NodeType.INITIAL] : manualTriggerExecutor,
    [NodeType.HTTP_REQUEST] : httpRequestExecutor,
    [NodeType.MANUAL_TRIGGER] : manualTriggerExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER] : googleFormTriggerExecutor,
    [NodeType.STRIPE_TRIGGER] : stripeTriggerExecutor, 
    [NodeType.GEMINI] : GeminiExecutor,
    [NodeType.OPENAI] : OpenAIExecutor,
    [NodeType.ANTHROPIC] : AnthropicExecutor,
    [NodeType.DISCORD] : DiscordExecutor,
};

export const getExecutor = (type : NodeType) : NodeExecutor => {
    const executor = executorRegistry[type];
    
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }
    return executor;
}