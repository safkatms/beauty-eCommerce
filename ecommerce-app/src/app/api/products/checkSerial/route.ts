import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const serialNo = url.searchParams.get("serialNo");

  if (!serialNo) {
    return NextResponse.json({ error: "Missing serial number" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { productSerialNo: serialNo },
  });

  return NextResponse.json({ exists: !!product });
}
