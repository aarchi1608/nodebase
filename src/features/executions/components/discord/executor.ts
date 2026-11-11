import { NodeExecutor } from "@/features/executions/types";
import Handlebars from "handlebars";
import { discordChannel } from "@/inngest/channel/discord";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { decode } from "html-entities";
import ky from "ky";
const DISCORD_TIMEOUT_MS = 30000;

Handlebars.registerHelper("json", (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);
    return safeString;
});
type DiscordData = {
    variableName?: string;
    webhookUrl?: string;
    content?: string;
    userName?: string;
};
export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId,
}) => {
    await publish(
        discordChannel().status({
            nodeId,
            status: "loading",
        }),
    );


    if (!data.variableName) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Variable name is required to store the response");
    }
    if (!data.webhookUrl) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Webhook URL is required");
    }
    if (!data.content) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Content is required");
    }


    const rawContent = Handlebars.compile(data.content)(context);
    const content = decode(rawContent);

    const username = data.userName ? Handlebars.compile(data.userName)(context) : undefined;

    try {
        const result = await step.run("send-discord-message", async () => {
            await ky.post(data.webhookUrl!, {
                json: {
                    content: content.slice(0, 2000),
                    username,
                },
                timeout: DISCORD_TIMEOUT_MS,
            });
            return {
                ...context,
                [data.variableName!]: { messageSent: true },
            }
        });

        await publish(
            discordChannel().status({
                nodeId,
                status: "success",
            }),
        );
        return result;
    } catch (error) {
        await publish(
            discordChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};