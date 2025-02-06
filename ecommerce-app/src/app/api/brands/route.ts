import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    // Validate input
    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({ where: { name } });
    if (existingBrand) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    }

    // Create brand
    const newBrand = await prisma.brand.create({
      data: { name },
    });

    return NextResponse.json({ message: "Brand created successfully", brand: newBrand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

