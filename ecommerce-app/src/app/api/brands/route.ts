import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Define Upload Directory
const uploadDir = path.join(process.cwd(), "public/uploads/brands");

// Ensure Directory Exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🚀 Fetch All Brands with Images
export async function GET() {
  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🚀 Create a New Brand with Image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // Check if Brand Already Exists
    const existingBrand = await prisma.brand.findUnique({ where: { name } });
    if (existingBrand) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    }

    let imageUrl: string | null = null;

    // ✅ Handle Image Upload
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/brands/${fileName}`; // Store relative path
    }

    // ✅ Create Brand in Database
    const newBrand = await prisma.brand.create({
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(
      { message: "Brand created successfully", brand: newBrand },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
