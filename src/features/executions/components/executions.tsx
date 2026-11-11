"use client";
import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, ErrorView, LoadingView } from "@/components/entity-components";
import { EntityContainer } from "@/components/entity-components";
import { useExecutionParams } from "../hooks/use-execution-params";
import { formatDistanceToNow } from "date-fns";
import { useSuspenseExecutions } from "../hooks/use-executions";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
export const ExecutionsList = () => {
    const executions = useSuspenseExecutions();

    return (
        <EntityList
            items={executions.data.items}
            getKey={(execution) => execution.id}
            renderItem={(execution) =>
                <ExecutionItem data={execution} />
            }
            emptyView={<ExecutionsEmpty />}
        />
    )
};
export const ExecutionsHeader = () => {
    return (
        <EntityHeader
            title="Executions"
            description="Create and manage your executions"
        />
    )
};

export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionParams();
    return (
        <EntityPagination
            disabled={executions.isFetching}
            page={executions.data.page}
            totalPages={executions.data.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const ExecutionsContainer = ({
    children
}: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}

        </EntityContainer>
    )
}


export const ExecutionsLoading = () => {
    return (
        <LoadingView message="Loading Executions..." />
    )
};

export const ExecutionsError = () => {
    return (
        <ErrorView message="Error Loading Executions!" />
    )
};

export const ExecutionsEmpty = () => {
    return (
        <EmptyView
            message="No executions found"
        />
    )
}
const getStatusIcon = (status : ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.SUCCESS:
            return <CheckCircle2Icon className="size-5 text-green-600" />
        case ExecutionStatus.FAILED:
            return <XCircleIcon className="size-5 text-red-600" />
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="size-5 text-blue-600 animate-spin" />
        default:
            return <ClockIcon className="size-5 text-muted-foreground" />
    }
}

export const ExecutionItem = ({ data }: { data: Execution  & {
    workflow: {
        name: string;
        id : string;
    }
}}) => {
    const duration = data.completedAt? Math.round((new Date(data.completedAt).getTime() - new Date(data.startedAt).getTime()) / 1000) : null;
    const subtitle = (
        <>
            {data.workflow.name} &bull; Started{" "}
            {formatDistanceToNow(data.startedAt, { addSuffix: true })}
            {duration !== null  && <> &bull; Took {duration}s</>}

        </>
    )
    return (
        <EntityItem
            href={`/executions/${data.id}`}
            title={formatStatus(data.status)}
            subtitle={subtitle}
            image={
                <div className="size-8 flex items-center justify-center">
                    {getStatusIcon(data.status)}
                </div>
            }
        />
    );
}

const formatStatus = (status : ExecutionStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}