import { Button } from "@/components/ui/button"
import { useExecuteWorkflow, useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react"
import { useAtomValue } from "jotai";
import { editorAtom } from "../store/atoms";

export const ExecuteWorkflowButton = ({workflowId} : {workflowId : string}) => {
    const executeWorkflow = useExecuteWorkflow();
    const saveWorkflow = useUpdateWorkflow();
    const editor = useAtomValue(editorAtom);

    const handleExecute = async () => {
        if (editor) {
            const nodes = editor.getNodes();
            const edges = editor.getEdges();
            await saveWorkflow.mutateAsync({id : workflowId , nodes , edges});
        }
        executeWorkflow.mutate({id : workflowId});
    }
    return (
        <Button size="lg" onClick={handleExecute} disabled={executeWorkflow.isPending || saveWorkflow.isPending}>
            <FlaskConicalIcon className="size-4"/>
            Execute Workflow
        </Button>
    );
};
