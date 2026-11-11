import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing workflowId parameter." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const formData = {
      eventId : body.id,
      eventType : body.type,
      timestamp : body.created,
      livemode : body.livemode,
      raw : body.data?.object,
    };

    //trigger an inngest job
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: formData,
      },
    });

    return NextResponse.json({ success: true },  { status: 200 });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing the Stripe webhook.",
      },
      { status: 500 },
    );
  }
}
