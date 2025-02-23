import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.get("query") || "";
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
        const limit = 12; // Number of results per page

        if (!query) {
            return NextResponse.json({ products: [], totalPages: 0 }, { status: 200 });
        }

        // Get total count for pagination
        const totalProducts = await prisma.product.count({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { name: { contains: query, mode: "insensitive" } } },
                    { category: { name: { contains: query, mode: "insensitive" } } },
                    { subCategory: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
        });

        // Fetch products with pre-calculated average rating
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { name: { contains: query, mode: "insensitive" } } },
                    { category: { name: { contains: query, mode: "insensitive" } } },
                    { subCategory: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            include: {
                brand: true,
                category: true,
                subCategory: true,
                images: true,
                _count: { select: { reviews: true } }, // Count total reviews
                reviews: { select: { rating: true } }, // Fetch all ratings
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        // Attach average rating directly in the response
        const productsWithRatings = products.map((product) => ({
            ...product,
            avgRating: product.reviews.length
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0, // If no reviews, return 0
            totalReviews: product._count.reviews, // Include total number of reviews
        }));

        return NextResponse.json({
            products: productsWithRatings,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
