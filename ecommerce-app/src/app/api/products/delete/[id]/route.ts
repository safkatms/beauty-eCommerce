import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
      }
  
      await prisma.product.delete({
        where: { id: parseInt(id, 10) },
      });
  
      return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
  }
  