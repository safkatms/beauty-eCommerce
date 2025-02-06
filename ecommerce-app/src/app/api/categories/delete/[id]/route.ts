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
        return NextResponse.json({ error: "Valid Category ID is required" }, { status: 400 });
      }
  
      const categoryId = Number(id);
  
      // Check if category exists
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
  
      // Delete the category
      await prisma.category.delete({ where: { id: categoryId } });
  
      return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  