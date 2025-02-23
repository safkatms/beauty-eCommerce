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

        // Fetch paginated products
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
            },
            take: limit,
            skip: (page - 1) * limit,
        });

        return NextResponse.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
