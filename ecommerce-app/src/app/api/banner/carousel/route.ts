import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🚀 Fetch Only Active Banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true }, // ✅ Only fetch active banners
      orderBy: { position: "asc" }, // ✅ Sort banners by position
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
