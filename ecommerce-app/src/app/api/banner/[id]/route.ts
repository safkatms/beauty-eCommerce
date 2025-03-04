import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// 🚀 DELETE a Banner
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid banner ID" }, { status: 400 });
    }
    const bannerId = Number(id);
    // ✅ Ensure banner exists before deleting
    const existingBanner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // 🗑 Delete the banner
    await prisma.banner.delete({ where: { id: bannerId } });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

// 🚀 Toggle Banner Active/Inactive
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);
    const { isActive } = await req.json();

    // ✅ Ensure banner exists before updating
    const existingBanner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // 🔄 Update banner status
    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: { isActive },
    });

    return NextResponse.json({ message: "Banner status updated", banner: updatedBanner });
  } catch (error) {
    console.error("Error updating banner status:", error);
    return NextResponse.json({ error: "Failed to update banner status" }, { status: 500 });
  }
}