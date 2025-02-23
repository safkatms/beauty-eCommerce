"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingBag, Heart, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface Product {
  id: number;
  name: string;
  brand: { name: string };
  category: { name: string };
  subCategory: { name: string };
  sellingPrice: number;
  purchasePrice: number;
  discount?: number;
  priceAfterDiscount?: number;
  description?: string;
  hasVariants: boolean;
  quantity?: number;
  images: { imageUrl: string }[];
  variants: { shade: string; quantity: number; imageUrl?: string }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/details/${productId}`);
        if (!response.ok) throw new Error("Failed to load product details");

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        setError("Error loading product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    toast.success("Product added to cart!");
  };

  if (loading) return <div className="text-center p-10">Loading product...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          {product?.images.length ? (
            <Swiper spaceBetween={10} slidesPerView={1} className="rounded-lg">
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image.imageUrl}
                    alt={`Product Image ${index + 1}`}
                    className="w-full rounded-lg border shadow-md"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p>No images available</p>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          {/* Breadcrumb */}
          <div className="text-gray-500 text-sm flex items-center space-x-2 mb-2">
            <span>{product?.category.name}</span>
            <ChevronRight size={14} />
            <span>{product?.subCategory.name}</span>
            <ChevronRight size={14} />
            <span className="text-pink-600 font-semibold">{product?.brand.name}</span>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl font-bold text-gray-800">{product?.name}</h1>

          {/* Price & Discount */}
          <div className="flex items-center space-x-3 mt-3">
            <span className="text-xl font-bold text-pink-600">${product?.priceAfterDiscount || product?.sellingPrice}</span>
            {product?.discount && (
              <span className="text-gray-500 line-through">${product?.sellingPrice}</span>
            )}
            {product?.discount && (
              <span className="text-green-600 text-sm font-medium">-{product?.discount}% OFF</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mt-4">{product?.description || "No description available."}</p>

          {/* Variants */}
          {product?.hasVariants && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Select Variant:</h3>
              <div className="flex gap-4 mt-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    className={`p-3 border rounded-lg text-sm ${
                      selectedVariant === index ? "border-pink-600" : "border-gray-300"
                    }`}
                    onClick={() => setSelectedVariant(index)}
                  >
                    {variant.shade}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-lg flex items-center gap-2 hover:border-gray-500 transition">
              <Heart size={18} /> Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
