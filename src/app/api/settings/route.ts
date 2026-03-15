import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserAndSync } from "@/lib/auth-server";
import { updateSettingsSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    let settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      settings: {
        is24Hour: settings.is24Hour,
        showSeconds: settings.showSeconds,
        showDate: settings.showDate,
        theme: settings.theme,
        alertSound: settings.alertSound,
        hourlyChime: settings.hourlyChime,
      },
    });
  } catch (error) {
    console.error("[GET /api/settings] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await getUserAndSync(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;

    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const {
      is24Hour,
      showSeconds,
      showDate,
      theme,
      alertSound,
      hourlyChime,
    } = parsed.data;

    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        is24Hour: is24Hour ?? undefined,
        showSeconds: showSeconds ?? undefined,
        showDate: showDate ?? undefined,
        theme: theme ?? undefined,
        alertSound: alertSound ?? undefined,
        hourlyChime: hourlyChime ?? undefined,
      },
      update: {
        ...(is24Hour !== undefined && { is24Hour }),
        ...(showSeconds !== undefined && { showSeconds }),
        ...(showDate !== undefined && { showDate }),
        ...(theme !== undefined && { theme }),
        ...(alertSound !== undefined && { alertSound }),
        ...(hourlyChime !== undefined && { hourlyChime }),
      },
    });

    return NextResponse.json({
      settings: {
        is24Hour: settings.is24Hour,
        showSeconds: settings.showSeconds,
        showDate: settings.showDate,
        theme: settings.theme,
        alertSound: settings.alertSound,
        hourlyChime: settings.hourlyChime,
      },
    });
  } catch (error) {
    console.error("[PUT /api/settings] error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
