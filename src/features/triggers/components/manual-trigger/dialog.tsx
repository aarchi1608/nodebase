"use client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
interface Props{
    open : boolean;
    onOpenChange : (open : boolean) => void;

};
export const ManualTriggerDialog = ({
    open,
    onOpenChange,
} : Props) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manual Trigger</DialogTitle>
                    <DialogDescription>
                        Configure the manual trigger settings here.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Use to manually execute a workflow. No configuration available.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
};