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
      formId: body.formId,
      responseId: body.responseId,
      formTitle: body.formTitle,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    //trigger an inngest job
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        googleForm: formData,
      },
    });

    return NextResponse.json({ success: true },  { status: 200 });
  } catch (error) {
    console.error("Error handling Google Form trigger:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing the Google Form trigger.",
      },
      { status: 500 },
    );
  }
}
