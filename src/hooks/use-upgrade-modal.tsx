import { UpgradeModal } from "@/components/upgrade-modal";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";

export const useUpgradeModal = () => {
    const [open, setOpen] = useState(false);
    const handleError = (error : unknown) => {
        console.log("Error received:", error);
        if (error instanceof TRPCClientError) {
            console.log("TRPC Error data:", error.data);
            console.log("TRPC Error code:", error.data?.code);
            if (error.data?.code === "FORBIDDEN") {
                setOpen(true);
                return true;
            }
        }
        return false;
    };

    const modal = <UpgradeModal open = {open} onOpenChange={setOpen} />
    return {handleError , modal};
}