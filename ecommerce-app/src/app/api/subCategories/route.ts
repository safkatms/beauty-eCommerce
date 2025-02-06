import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all subcategories
export async function GET() {
  try {
    const subcategories = await prisma.subCategory.findMany({
      include: {
        category: true, // Include category relation if needed
      },
    });
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new subcategory
export async function POST(req: Request) {
  try {
    const { name, categoryId } = await req.json();

    // Validate input
    if (!name || !categoryId) {
      return NextResponse.json({ error: "SubCategory name and categoryId are required" }, { status: 400 });
    }

    // Check if the category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if subcategory already exists
    const existingSubCategory = await prisma.subCategory.findUnique({ where: { name } });
    if (existingSubCategory) {
      return NextResponse.json({ error: "SubCategory already exists" }, { status: 409 });
    }

    // Create subcategory
    const newSubCategory = await prisma.subCategory.create({
      data: { name, categoryId },
    });

    return NextResponse.json({ message: "SubCategory created successfully", subCategory: newSubCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

