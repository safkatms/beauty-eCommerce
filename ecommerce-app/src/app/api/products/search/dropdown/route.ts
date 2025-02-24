import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.get("query") || "";

        if (!query) {
            return NextResponse.json({ products: [] }, { status: 200 });
        }

        // Fetch at most 2 products for dropdown
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { brand: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            include: {
                brand: true,
                images: true,
            },
            take: 2, // Limit results to 2
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error("Error fetching dropdown products:", error);
        return NextResponse.json({ error: "Failed to fetch dropdown products" }, { status: 500 });
    }
}
