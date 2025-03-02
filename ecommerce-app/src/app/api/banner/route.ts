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

// 🚀 Fetch All Banners
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: "asc" }, // Sort by position
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🚀 Create Banner with Cloudinary Image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const link = formData.get("link") as string | null;
    const position = Number(formData.get("position") || 0);
    const isActive = formData.get("isActive") === "true";
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "Banner image is required" }, { status: 400 });
    }

    // 🚀 Upload image to Cloudinary
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataUri = `data:${image.type};base64,${base64Image}`;

    const uploadResult = await cloudinary.v2.uploader.upload(dataUri, {
      folder: "banners",
    });

    const imageUrl = uploadResult.secure_url;

    // ✅ Save to Database
    const newBanner = await prisma.banner.create({
      data: {
        imageUrl,
        title,
        description,
        link,
        position,
        isActive,
      },
    });

    return NextResponse.json({ message: "Banner created successfully", banner: newBanner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
