"use client";
import { EmptyView, EntityHeader, EntityItem, EntityList, EntityPagination, ErrorView,LoadingView } from "@/components/entity-components";
import { useCreateWorkflow, useRemoveWorkflow, useSuspenseWorkflows } from "../hooks/use-workflows";
import { EntityContainer , EntitySearch } from "@/components/entity-components";
import { useUpgradeModal } from "../../../hooks/use-upgrade-modal";
import { toast } from "sonner";
import { on } from "events";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "../../../hooks/use-entity-search";
import { useRouter } from "next/navigation";
import type { Workflow } from "@/generated/prisma/client";
import { WorkflowIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { date } from "zod";
export const WorkflowsList = () => {
    const workflows = useSuspenseWorkflows();

   return (
    <EntityList 
        items={workflows.data.items}
        getKey={(workflow) => workflow.id}
        renderItem={(workflow) => 
            <WorkflowItem data={workflow} />
        }
        emptyView={<WorkflowsEmpty/>}
    />
   )
};
export const WorkflowsHeader = ({disabled} : {disabled? : boolean}) => {
    const createWorkflow = useCreateWorkflow();
    const {handleError , modal} = useUpgradeModal();
    const handleCreate = () => {
        createWorkflow.mutate(undefined , {
            onError : (error) => {
                const handled = handleError(error);
                if (!handled) {
                    toast.error("Failed to create workflow");
                }
            },
        });
    }
    return (
        <>
        {modal}
        <EntityHeader 
            title="Workflows"
             description="Create and manage your workflows"
             newButtonLabel="New workflow"
             disabled ={disabled}
             onNew={handleCreate}
             isCreating = {createWorkflow.isPending}
        />
        </>
    )
};

export const WorkflowsPagination = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams();
    return (
        <EntityPagination
            disabled={workflows.isFetching}
            page={workflows.data.page}
            totalPages={workflows.data.totalPages}
            onPageChange={(page) => setParams({...params, page})}
        />
    )
}

export const WorkflowsContainer = ({
    children
} : {children: React.ReactNode}) => {
    return (
        <EntityContainer
        header = {<WorkflowsHeader/>}
        search = {<WorkflowsSearch/>}
        pagination={<WorkflowsPagination/>}
        >
            {children}

        </EntityContainer>
    )
}

export const WorkflowsSearch = () => {
    const [params , setParams] = useWorkflowsParams();
    const {searchValue, onSearchChange} = useEntitySearch({
        params,
        setParams,
    });
    return (
        <EntitySearch 
        value= {searchValue}
        onChange={onSearchChange}
        placeholder="Search workflows"
        />
    )
}

export const WorkflowsLoading = () => {
    return (
        <LoadingView message="Loading Workflows..."/>
    )
};

export const ErrorLoading = () => {
    return (
        <ErrorView message="Error Loading Workflows!"/>
    )
};

export const WorkflowsEmpty = () => {

    const createWorkflow = useCreateWorkflow();
    const router = useRouter();
    const {handleError , modal} = useUpgradeModal();

    const handleCreate = () => {
        createWorkflow.mutate(undefined , {
            onError : (error) => {
                handleError(error);
            },
            onSuccess : (data) => {
                router.push(`/workflows/${data.id}`);
            }
        });
    };
    return (
        <>
        {modal}
        <EmptyView message="Please create workflows to get started"
        onNew={handleCreate}/>
        </>
    )
}

export const WorkflowItem = ({data} : {data : Workflow}) => {
    const removeWorkflow = useRemoveWorkflow();
    const handleRemove = () => {
        removeWorkflow.mutate({id : data.id})
    }
    return (
        <EntityItem 
        href={`/workflows/${data.id}`}
        title={data.name}
        subtitle={
            <>
                Updated {formatDistanceToNow(data.updatedAt , {addSuffix : true})}{" "}
                &bull; Created {" "}
                {formatDistanceToNow(data.createdAt , {addSuffix : true})}
            </>
        }
        image={
            <div className="size-8 flex items-center justify-center">
                <WorkflowIcon className="size-5 text-muted-foreground"/>
            </div>
        }
        onRemove={handleRemove}
        isRemoving={removeWorkflow.isPending}
        />
    );
}