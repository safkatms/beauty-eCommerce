import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import path from "path";
import { IncomingMessage } from "http";

// Create a Prisma Client instance
const prisma = new PrismaClient();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

// Initialize multer
const upload = multer({ storage });

const handleUpload = (req: IncomingMessage, res: NextApiResponse) => {
  return new Promise<void>((resolve, reject) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err instanceof Error) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      // First handle file upload
      await handleUpload(req, res);

      // Extract other form data from the body
      const { brandId, categoryId, subCategoryId, name, productSerialNo, purchasePrice, sellingPrice, variants } = req.body;

      // Map uploaded image files to their file paths
      const images = req.files?.map((file: any) => ({
        imageUrl: `/uploads/${file.filename}`,
      }));

      // Create the product with nested images and variants
      const newProduct = await prisma.product.create({
        data: {
          brandId: parseInt(brandId, 10),
          categoryId: parseInt(categoryId, 10),
          subCategoryId: parseInt(subCategoryId, 10),
          name,
          productSerialNo,
          purchasePrice: parseFloat(purchasePrice),
          sellingPrice: parseFloat(sellingPrice),
          images: {
            create: images, // Insert image URLs into the database
          },
          variants: {
            create: variants.map((variant: { shade: string; quantity: number; imageUrl?: string }) => ({
              shade: variant.shade,
              quantity: variant.quantity,
              imageUrl: variant.imageUrl || null,
            })),
          },
        },
        include: {
          images: true, // Include images in the response
          variants: true, // Include variants in the response
        },
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
