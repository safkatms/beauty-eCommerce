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

        // Fetch products with reviews
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
                reviews: { select: { rating: true } }, // Fetch only ratings
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        // Calculate average rating and total reviews
        const productsWithRatings = products.map((product) => {
            const totalReviews = product.reviews.length;
            const sumRatings = product.reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

            return {
                ...product,
                avgRating: parseFloat(avgRating.toFixed(1)), // 1 decimal place
                totalReviews, // Store total number of reviews
            };
        });

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
