import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Define the upload directory
const uploadDir = path.join(process.cwd(), "public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// API Route Handler for Product Creation
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract Product Data
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;
    const subCategoryId = formData.get("subCategoryId") as string;
    const name = formData.get("name") as string;
    const productSerialNo = formData.get("productSerialNo") as string;
    const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
    const sellingPrice = parseFloat(formData.get("sellingPrice") as string);
    const hasVariants = formData.get("hasVariants") === "true";
    const quantity = formData.get("quantity") as string | null;
    const variantsData = formData.get("variants");

    if (!brandId || !categoryId || !subCategoryId || !name || !productSerialNo || isNaN(purchasePrice) || isNaN(sellingPrice)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse Variants (if exists)
    let variants = [];
    if (hasVariants && variantsData) {
      try {
        variants = JSON.parse(variantsData as string);
      } catch (error) {
        console.error("Error parsing variants:", error);
        return NextResponse.json({ error: "Invalid variants format" }, { status: 400 });
      }
    }

    // Create Product in Database
    const newProduct = await prisma.product.create({
      data: {
        brandId: parseInt(brandId, 10),
        categoryId: parseInt(categoryId, 10),
        subCategoryId: parseInt(subCategoryId, 10),
        name,
        productSerialNo,
        purchasePrice,
        sellingPrice,
        hasVariants,
        quantity: hasVariants ? null : quantity ? parseInt(quantity, 10) : null,
        variants: hasVariants ? { create: variants } : undefined,
      },
    });

    // Handle Image Upload
    const uploadedFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of uploadedFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      imageUrls.push(`/uploads/${fileName}`); // Store relative image path
    }

    // Save Image URLs to Database
    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((imageUrl) => ({
          productId: newProduct.id,
          imageUrl,
        })),
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}


// 🚀 **GET: Fetch all products**
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        subCategory: true,
        images: true, // Ensure images are included
      },
    });

    // Fix image paths (Remove "/public" if present)
    const updatedProducts = products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        imageUrl: image.imageUrl.startsWith("/uploads/")
          ? image.imageUrl
          : `/uploads/${image.imageUrl.split("/").pop()}`,
      })),
    }));

    return NextResponse.json(updatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
