import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky ,  {type Options as KyOptions} from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channel/http-request";
const HTTP_REQUEST_TIMEOUT_MS = 30000;

Handlebars.registerHelper("json", (context) => {
    const stringified = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(stringified);
    return safeString;
});
type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;

};
export const httpRequestExecutor : NodeExecutor<HttpRequestData> = async ({ 
    data,
    nodeId,
    context,
    step,
    publish,
 }) => {
    await publish(
        httpRequestChannel().status({
            nodeId,
            status : "loading",
        }),
    );

    try {
        
        const result = await step.run("http-request", async()=>{
            if (!data.variableName) {
            throw new NonRetriableError("Variable name is required");
            }

            if (!data.endpoint) {
                throw new NonRetriableError("Endpoint is required");
            }
            if (!data.method) {
                throw new NonRetriableError("Method is required");
            }
            const endpoint = Handlebars.compile(data.endpoint)(context);
            const method = data.method || "GET";

            const options : KyOptions = {
                method,
                timeout: HTTP_REQUEST_TIMEOUT_MS,
                retry: 0,
            };
            if (["POST", "PUT", "PATCH"].includes(method)) {
                const resolved = Handlebars.compile(data.body || "{}")(context);
                JSON.parse(resolved); // validate JSON
                options.body = resolved;
                options.headers = {
                    "Content-Type": "application/json",
                };
            }
            let response: Response;

            try {
                response = await ky(endpoint, options);
            } catch (error) {
                if (error instanceof Error && error.name === "TimeoutError") {
                    throw new NonRetriableError(`Request timed out after ${HTTP_REQUEST_TIMEOUT_MS}ms: ${method} ${endpoint}`);
                }

                throw error;
            }
            
            const contentType = response.headers.get("content-type");
            const responseData = contentType?.includes("application/json") ? await response.json() : await response.text();
            const responsePayload = {
                httpResponse : {
                    status : response.status,
                    statusText : response.statusText,
                    data : responseData,
                }
            }
            return {
                ...context,
                [data.variableName]: responsePayload,
            }
        });

        await publish(
            httpRequestChannel().status({
                nodeId,
                status : "success",
            }),
        );

        return result;
    } catch (error) {
        await publish(
            httpRequestChannel().status({
                nodeId,
                status : "error",
            }),
        );
        throw error;
    }
};