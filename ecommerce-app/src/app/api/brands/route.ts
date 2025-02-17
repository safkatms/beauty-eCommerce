import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";

const prisma = new PrismaClient();

// 🌩️ Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🚀 Fetch All Brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🚀 Create Brand with Cloudinary Image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    // ✅ Check if brand exists
    const existingBrand = await prisma.brand.findUnique({ where: { name } });
    if (existingBrand) {
      return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    }

    let imageUrl = "";

    // 🚀 Upload image to Cloudinary
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const dataUri = `data:${image.type};base64,${base64Image}`;

      const uploadResult = await cloudinary.v2.uploader.upload(dataUri, {
        folder: "brand_images",
      });

      imageUrl = uploadResult.secure_url;
    }

    // ✅ Save to Database
    const newBrand = await prisma.brand.create({
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json({ message: "Brand created successfully", brand: newBrand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
