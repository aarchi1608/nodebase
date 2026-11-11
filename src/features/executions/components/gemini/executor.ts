import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { geminiChannel } from "@/inngest/channel/gemini";
import {generateText} from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
const GEMINI_TIMEOUT_MS = 30000;

Handlebars.registerHelper("json", (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);
    return safeString;
});
type GeminiData = {
    variableName?: string;
    model?: any;
    systemPrompt?: string;
    userPrompt?: string;
    credentialId?: string;
};
export const GeminiExecutor : NodeExecutor<GeminiData> = async ({ 
    data,
    nodeId,
    context,
    step,
    publish,
    userId,
 }) => {
    await publish(
        geminiChannel().status({
            nodeId,
            status : "loading",
        }),
    );

    if (!data.variableName){
        await publish(
        geminiChannel().status({
            nodeId,
            status : "error",
        }),
    );
    throw new NonRetriableError("Variable name is required to store the response");
    }
    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status : "error",
            }),
        );
        throw new NonRetriableError("User prompt is required");
    }
    if (!data.credentialId) {
        await publish(
            geminiChannel().status({
                nodeId,
                status : "error",
            }),
        );
        throw new NonRetriableError("Gemini credential is required");
    }

    
   const systemPrompt = data.systemPrompt ? Handlebars.compile(data.systemPrompt)(context) : "You are a helpful assistant that helps with making API calls.";
   const userPrompt = Handlebars.compile(data.userPrompt)(context);
    const credential = await step.run("get credential", ()=>{
        return prisma.credential.findUnique({
            where : {
                id : data.credentialId,
                userId,
            },
        });
    })
    if (!credential) {
        throw new NonRetriableError("Credential not found");
    }
   const google = createGoogleGenerativeAI({
        apiKey : decrypt(credential.value),

   });

   try {
        const { text } = await step.ai.wrap("gemini generate text", generateText , {
            model : google(data.model || "gemini-3.8-flash"),
            system : systemPrompt,
            prompt : userPrompt,
            experimental_telemetry : {
                isEnabled : true,
                recordInputs : true,
                recordOutputs : true,
            },
        });

        await publish(
            geminiChannel().status({
                nodeId,
                status : "success",
            }),
        );

        return {
            ...context,
            [data.variableName] : {aiResponse : text || ""},
        }
   } catch (error) {
    await publish(
        geminiChannel().status({
            nodeId,
            status : "error",
        }),
    );
    throw error;
}
};