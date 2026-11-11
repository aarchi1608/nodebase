import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionParams } from "./use-execution-params";
// hook to fetch executions using suspense
export const useSuspenseExecutions = () => {
    const trpc = useTRPC();
    const [params] = useExecutionParams();
    return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

export const useSuspenseExecution = (id : string) => {
    const trpc = useTRPC();
    return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
