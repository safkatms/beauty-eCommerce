import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {

    const body = await req.json();

    // Extract values safely
    const productId = parseInt(body.productId, 10);
    const rating = parseInt(body.rating, 10);
    const comment = body.comment?.trim() || "";
    const userId = body.userId ? parseInt(body.userId, 10) : null;
    const guestName = body.guestName?.trim() || null;

    // 🚨 Validation
    if (!productId || isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    if (!userId && !guestName) {
      return NextResponse.json({ error: "Guest name is required for unauthenticated users" }, { status: 400 });
    }

    // ✅ Create Review (Allowing guest users)
    const newReview = await prisma.review.create({
      data: {
        productId,
        rating,
        comment,
        userId, // Null for guests
        guestName, // Null for logged-in users
      },
    });
    return NextResponse.json(newReview, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}
