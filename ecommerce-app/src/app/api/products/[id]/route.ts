import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await `params` before using
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) }, // Ensure it's a number
      include: {
        brand: true,
        category: true,
        subCategory: true,
        images: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const formData = await req.json();

    const {
      name,
      productSerialNo,
      brandId,
      categoryId,
      subCategoryId,
      purchasePrice,
      sellingPrice,
      discount,
      hasVariants,
      quantity,
      variants,
    } = formData;

    // Validate Required Fields
    if (!name || !productSerialNo || !brandId || !categoryId || !subCategoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the serial number is unique (if changed)
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (existingProduct.productSerialNo !== productSerialNo) {
      const serialExists = await prisma.product.findUnique({ where: { productSerialNo } });
      if (serialExists) {
        return NextResponse.json({ error: "Product Serial Number must be unique" }, { status: 400 });
      }
    }

    // Calculate price after discount
    const priceAfterDiscount = discount
      ? sellingPrice - sellingPrice * (discount / 100)
      : sellingPrice;

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        productSerialNo,
        brandId: parseInt(brandId, 10),
        categoryId: parseInt(categoryId, 10),
        subCategoryId: parseInt(subCategoryId, 10),
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        discount: discount ? parseFloat(discount) : 0,
        priceAfterDiscount,
        hasVariants,
        quantity: hasVariants ? null : quantity ? parseInt(quantity, 10) : null,

        // Handle Variants
        variants: hasVariants
          ? {
            deleteMany: {}, // Remove existing variants
            create: variants.map((variant: any) => ({
              shade: variant.shade,
              quantity: parseInt(variant.quantity, 10),
              imageUrl: variant.imageUrl || null,
            })),
          }
          : undefined,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Await params before accessing `id`
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Delete the product from the database
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}