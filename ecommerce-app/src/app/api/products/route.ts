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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract product data
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;
    const subCategoryId = formData.get("subCategoryId") as string;
    const name = formData.get("name") as string;
    const productSerialNo = formData.get("productSerialNo") as string;
    const purchasePrice = parseFloat(formData.get("purchasePrice") as string) || 0;
    const sellingPrice = parseFloat(formData.get("sellingPrice") as string) || 0;
    const hasVariants = formData.get("hasVariants") === "true";
    const quantity = formData.get("quantity") as string | null;
    const ingredients = formData.get("ingredients") as string;
    const description = formData.get("description") as string;
    const variantsData = formData.get("variants");

    // Validate required fields
    if (!brandId || !categoryId || !subCategoryId || !name || !productSerialNo || !ingredients || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse variants if provided
    let variants = [];
    if (hasVariants && variantsData) {
      try {
        variants = JSON.parse(variantsData as string);
      } catch (error) {
        return NextResponse.json({ error: "Invalid variants format" }, { status: 400 });
      }
    }

    // Create product in database
    const newProduct = await prisma.product.create({
      data: {
        brandId: parseInt(brandId, 10),
        categoryId: parseInt(categoryId, 10),
        subCategoryId: parseInt(subCategoryId, 10),
        name,
        productSerialNo,
        purchasePrice,
        sellingPrice,
        ingredients,
        description,
        hasVariants,
        quantity: hasVariants ? null : quantity ? parseInt(quantity, 10) : null,
      },
    });

    // Upload product images to Cloudinary
    const uploadedFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    for (const file of uploadedFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: "ecommerce_products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      const cloudinaryResult = uploadResult as cloudinary.UploadApiResponse;
      imageUrls.push(cloudinaryResult.secure_url);
    }

    // Save product images
    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url) => ({
          productId: newProduct.id,
          imageUrl: url,
        })),
      });
    }

    // Upload variant images if present
    if (hasVariants && variants.length > 0) {
      const variantEntries = [];

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        let variantImageUrl = null;

        const file = formData.get(`variantImage-${i}`) as File;
        if (file) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
              { folder: "ecommerce_products/variants" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });

          const cloudinaryResult = uploadResult as cloudinary.UploadApiResponse;
          variantImageUrl = cloudinaryResult.secure_url;
        }

        variantEntries.push({
          productId: newProduct.id,
          shade: variant.shade,
          quantity: variant.quantity,
          imageUrl: variantImageUrl,
        });
      }

      await prisma.productVariant.createMany({
        data: variantEntries,
      });
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// 🚀 **GET: Fetch All Products**
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        subCategory: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
