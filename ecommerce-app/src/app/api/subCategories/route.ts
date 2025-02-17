import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";

const prisma = new PrismaClient();
// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const file = formData.get("image") as File | null;

    if (!name || !categoryId) {
      return NextResponse.json({ error: "Name and Category ID are required" }, { status: 400 });
    }

    // Check if subcategory already exists
    const existingSubCategory = await prisma.subCategory.findUnique({ where: { name } });
    if (existingSubCategory) {
      return NextResponse.json({ error: "SubCategory already exists" }, { status: 409 });
    }

    // Upload the file to Cloudinary if present
    let imageUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ folder: "subcategories" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(buffer);
      });

      imageUrl = (uploadResult as cloudinary.UploadApiResponse).secure_url;
    }

    // Create the SubCategory in the database
    const newSubCategory = await prisma.subCategory.create({
      data: {
        name,
        categoryId: parseInt(categoryId, 10),
        imageUrl,
      },
    });

    return NextResponse.json({ message: "SubCategory created successfully", subCategory: newSubCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}