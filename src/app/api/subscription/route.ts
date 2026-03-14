import { NextResponse } from "next/server";
import { getUserAndSync } from "@/lib/auth-server";
import type { Plan } from "@/lib/features";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    let plan: Plan;
    switch (user.plan) {
      case "FLOW":
        plan = "flow";
        break;
      case "DEEP_WORK":
        plan = "deep-work";
        break;
      case "STUDIO":
        plan = "studio";
        break;
      case "SEEDLING":
      default:
        plan = "seedling";
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[GET /api/subscription] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

