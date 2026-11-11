"use client"

import { ExecutionStatus } from "@/generated/prisma/enums"
import { CheckCircle2Icon, CheckIcon, ClockIcon, CopyIcon, Loader2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useSuspenseExecution } from "../hooks/use-executions"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

const AiResponseCard = ({ variableName, content }: { variableName: string; content: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 bg-muted/30 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-primary" />
                    {variableName} <span className="text-muted-foreground font-normal">(AI Response)</span>
                </p>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                    {copied ? <CheckIcon className="size-3.5 text-green-600 mr-1" /> : <CopyIcon className="size-3.5 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>
            <div className="text-sm text-foreground leading-relaxed bg-background p-5 rounded-md border font-sans overflow-hidden">
                <ReactMarkdown
                    components={{
                        h1: ({ ...props }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2 pb-1 border-b" {...props} />,
                        h2: ({ ...props }) => <h2 className="text-lg font-bold text-foreground mt-3 mb-2 pb-1 border-b" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1" {...props} />,
                        p: ({ ...props }) => <p className="mb-3 leading-relaxed text-foreground last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc list-outside ml-5 mb-3 space-y-1 text-foreground" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal list-outside ml-5 mb-3 space-y-1 text-foreground" {...props} />,
                        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                        em: ({ ...props }) => <em className="italic" {...props} />,
                        code: ({ className, children, ...props }) => {
                            const isInline = !className?.includes("language-");
                            if (isInline) {
                                return <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-medium text-foreground" {...props}>{children}</code>;
                            }
                            return <code className="block text-xs font-mono" {...props}>{children}</code>;
                        },
                        pre: ({ ...props }) => <pre className="bg-muted/70 p-4 rounded-lg overflow-x-auto text-xs font-mono my-3 border leading-snug" {...props} />,
                        blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary/40 pl-3 italic my-3 text-muted-foreground" {...props} />,
                        hr: ({ ...props }) => <hr className="my-4 border-border" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

const getStatusIcon = (status: ExecutionStatus) => {
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

const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export const ExecutionView = ({ executionId }: { executionId: string }) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShowStackTrace] = useState(false);
    const duration = execution.completedAt ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000) : null;
    return (
        <Card className="shadow-none">
            <CardHeader className="flex items-center gap-3">
                <div>
                    {getStatusIcon(execution.status)}
                    <div>
                        <CardTitle>{formatStatus(execution.status)}</CardTitle>
                        <CardDescription>Execution for {execution.workflow.name}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground ">
                            Workflow
                        </p>
                        <Link
                            className="text-sm hover:underline text-primary"
                            href={`/workflows/${execution.workflowId}`}>{execution.workflow.name}
                        </Link>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground ">
                            Status
                        </p>
                        <p className="text-sm">
                            {formatStatus(execution.status)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground ">
                            Started
                        </p>
                        <p className="text-sm">
                            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                        </p>
                    </div>
                    {execution.completedAt && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground ">
                                Completed
                            </p>
                            <p className="text-sm">
                                {formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                            </p>
                        </div>
                    )}
                    {duration && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground ">
                                Duration
                            </p>
                            <p className="text-sm">
                                {duration}s
                            </p>
                        </div>
                    )}
                    {execution.inngestEventId && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground ">
                                Inngest Event ID
                            </p>
                            <p className="text-sm">
                                {execution.inngestEventId}
                            </p>
                        </div>
                    )}
                </div>
                {execution.error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
                        <div>
                            <p className="text-sm font-medium text-red-900 mb-2">
                                Error
                            </p>
                            <p className="text-sm text-red-800 font-mono">
                                {execution.error}
                            </p>
                        </div>
                        {execution.errorStack && (
                            <Collapsible
                                open={showStackTrace}
                                onOpenChange={setShowStackTrace}
                            >
                                <CollapsibleTrigger
                                    asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-900 hover:bg-red-100"
                                    >
                                        {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="text-xs text-red-800 font-mono overflow-auto mt-2 p-2 bg-red-100 rounded">
                                        {execution.errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                )}
                {execution.output && (
                    <div className="mt-6 space-y-4">
                        {typeof execution.output === "object" && execution.output !== null && (
                            <div className="space-y-4">
                                {Object.entries(execution.output as Record<string, any>).map(([key, val]) => {
                                    if (val?.aiResponse) {
                                        return (
                                            <AiResponseCard
                                                key={key}
                                                variableName={key}
                                                content={val.aiResponse}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}

                        <div className="p-4 bg-muted/20 border rounded-lg space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                Raw Output (JSON)
                            </p>
                            <pre className="text-xs font-mono whitespace-pre-wrap break-all overflow-auto p-3 bg-muted/50 rounded-md max-h-96">
                                {JSON.stringify(execution.output, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}