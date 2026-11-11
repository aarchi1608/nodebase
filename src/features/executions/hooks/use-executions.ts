import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionParams } from "./use-execution-params";
// hook to fetch executions using suspense with auto-refresh while running
export const useSuspenseExecutions = () => {
    const trpc = useTRPC();
    const [params] = useExecutionParams();
    return useSuspenseQuery({
        ...trpc.executions.getMany.queryOptions(params),
        refetchInterval: 3000,
    });
};

export const useSuspenseExecution = (id : string) => {
    const trpc = useTRPC();
    return useSuspenseQuery({
        ...trpc.executions.getOne.queryOptions({ id }),
        refetchInterval: (query) => {
            return query.state.data?.status === "RUNNING" ? 2000 : false;
        },
    });
};
