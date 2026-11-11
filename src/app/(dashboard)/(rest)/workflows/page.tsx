import { redirect } from "next/navigation";
import { WorkflowsList, WorkflowsContainer, WorkflowsLoading, ErrorLoading } from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient, prefetch } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    searchParams : Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
    const rawParams = await searchParams;
    if (rawParams && typeof rawParams === "object" && "error" in rawParams && rawParams.error) {
        redirect(`/login?error=${encodeURIComponent(String(rawParams.error))}`);
    }
    await requireAuth();
    const params = await workflowsParamsLoader(searchParams);
    prefetchWorkflows(params);
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<ErrorLoading />}>
                <Suspense fallback={<WorkflowsLoading />}>
                    <WorkflowsContainer>
                        <WorkflowsList />
                    </WorkflowsContainer>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    );
};
export default Page;