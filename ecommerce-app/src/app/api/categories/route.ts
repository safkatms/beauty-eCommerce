import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
      const { name } = await req.json();
  
      // Validate input
      if (!name) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
  
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({ where: { name } });
      if (existingCategory) {
        return NextResponse.json({ error: "Category already exists" }, { status: 409 });
      }
  
      // Create category
      const newCategory = await prisma.category.create({
        data: { name },
      });
  
      return NextResponse.json({ message: "Category created successfully", category: newCategory }, { status: 201 });
    } catch (error) {
      console.error("Error creating category:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  