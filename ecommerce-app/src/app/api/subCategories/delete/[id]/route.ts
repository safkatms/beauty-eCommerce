import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Delete subcategory
export async function DELETE(req: Request) {
    try {
      // Get ID from request URL
      const url = new URL(req.url);
      const id = url.pathname.split("/").pop(); // Extract ID from the path
  
      // Validate input
      if (!id || isNaN(Number(id))) {
        return NextResponse.json({ error: "Valid SubCategory ID is required" }, { status: 400 });
      }
  
      const subCategoryId = Number(id);
  
      // Check if subcategory exists
      const subCategory = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });
      if (!subCategory) {
        return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
      }
  
      // Delete the subcategory
      await prisma.subCategory.delete({ where: { id: subCategoryId } });
  
      return NextResponse.json({ message: "SubCategory deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  