import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        brand: true,
        category: true,
        subCategory: true,
        images: true,
        variants: true,
        _count: { select: { reviews: true } }, // Count total reviews
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" }, // Order reviews by latest
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate average rating
    const totalRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = product.reviews.length > 0 ? (totalRatings / product.reviews.length).toFixed(1) : "0.0";

    return NextResponse.json({
      ...product,
      avgRating: parseFloat(avgRating), // Ensure it's a number
      totalReviews: product._count.reviews,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}