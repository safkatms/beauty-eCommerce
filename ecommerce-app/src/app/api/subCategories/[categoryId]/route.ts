// pages/api/subcategories/[categoryId].ts

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Get categoryId from the URL path
    const url = new URL(req.url);
    const categoryId = url.pathname.split("/").pop(); // Extract categoryId from the path

    // Validate categoryId
    if (!categoryId || isNaN(Number(categoryId))) {
      return NextResponse.json({ error: "Valid Category ID is required" }, { status: 400 });
    }

    const categoryIdInt = Number(categoryId);

    // Fetch subcategories associated with the given categoryId
    const subcategories = await prisma.subCategory.findMany({
      where: {
        categoryId: categoryIdInt,
      },
    });

    // Return the list of subcategories
    return NextResponse.json(subcategories, { status: 200 });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}
