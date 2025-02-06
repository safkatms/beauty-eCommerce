import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    // Get ID from request URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract ID from the path

    // Validate input
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Valid Brand ID is required" }, { status: 400 });
    }

    const brandId = Number(id);

    // Check if brand exists
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Delete the brand
    await prisma.brand.delete({ where: { id: brandId } });

    return NextResponse.json({ message: "Brand deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
