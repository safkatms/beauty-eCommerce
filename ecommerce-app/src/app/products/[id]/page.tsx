"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminSidebar from "@/components/sidebarAdmin";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Save,
  SeparatorVertical,
  XCircle,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  productSerialNo: string;
  brand: { id: number; name: string };
  category: { id: number; name: string };
  subCategory: { id: number; name: string };
  purchasePrice: number;
  sellingPrice: number;
  discount?: number;
  priceAfterDiscount?: number;
  hasVariants: boolean;
  quantity?: number;
  images: { imageUrl: string }[];
  variants: { shade: string; quantity: number; imageUrl?: string }[];
}

export default function UpdateProduct() {
  const params = useParams();
  const productId = params?.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch product details");
        const data = await response.json();
        setProduct(data);
        setFormData(data);
      } catch (err) {
        setError("Error loading product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updatedValue = value;

      if (name === "sellingPrice" || name === "discount") {
        const sellingPrice =
          name === "sellingPrice"
            ? parseFloat(value) || 0
            : formData.sellingPrice || 0;
        const discount =
          name === "discount" ? parseFloat(value) || 0 : formData.discount || 0;
        const priceAfterDiscount =
          sellingPrice - sellingPrice * (discount / 100);

        return {
          ...prev,
          [name]: parseFloat(value) || 0,
          priceAfterDiscount,
        };
      }

      return {
        ...prev,
        [name]: updatedValue,
      };
    });
  };

  const handleVariantChange = (
    index: number,
    field: keyof Product["variants"][0],
    value: string | number
  ) => {
    const updatedVariants = formData.variants ? [...formData.variants] : [];

    if (updatedVariants[index]) {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
      setFormData((prev) => ({
        ...prev,
        variants: updatedVariants,
      }));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update product");

      setIsEditing(false);
      router.push(`/products/${productId}`);
    } catch (error) {
      setError("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">Loading product details...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6 text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="flex h-screen">
      <AdminSidebar />

      <div className="flex-1 p-6 overflow-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-500 flex items-center gap-2 hover:underline mb-4"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Products
        </button>
        <h1 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Product" : "Product Details"}
        </h1>

        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className={`mb-4 px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            isEditing
              ? "bg-gray-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isEditing ? (
            <>
              <XCircle className="w-5 h-5" /> Disable Edit
            </>
          ) : (
            <>
              <Pencil className="w-5 h-5" /> Enable Edit
            </>
          )}
        </button>

        {/* Product Category, Subcategory & Brand */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-lg font-semibold flex items-center gap-2">
          {product?.category?.name &&
          product?.subCategory?.name &&
          product?.brand?.name ? (
            <>
              <span>{product.category.name}</span>
              <ChevronRight className="w-5 h-5 text-gray-500" />
              <span>{product.subCategory.name}</span>
              <SeparatorVertical className="w-5 h-5 text-gray-500" />
              <span className="text-pink-600">{product.brand.name}</span>
            </>
          ) : (
            <p className="text-gray-500">Category information not available</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            {product?.images?.length ? (
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                className="rounded-lg"
              >
                {product.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image.imageUrl}
                      alt={`Product Image ${index + 1}`}
                      className="w-full rounded-lg border"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p>No images available</p>
            )}
          </div>

          <div className="space-y-4">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing}
            />

            <label>Product Serial No</label>
            <input
              type="text"
              name="productSerialNo"
              value={formData.productSerialNo || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing}
            />

            <label>Purchase Price</label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing}
            />

            <label>Selling Price</label>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing}
            />

            <label>Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount || 0}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing}
            />

            <label>Final Price</label>
            <input
              type="number"
              name="priceAfterDiscount"
              value={formData.priceAfterDiscount || ""}
              className="border p-2 rounded w-full"
              disabled
            />

            <label>Stock</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              disabled={!isEditing || formData.hasVariants}
            />
          </div>
        </div>

        {/* Variants Section */}
        {formData.hasVariants && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Variants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.variants?.map((variant, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <label>Shade</label>
                  <input
                    type="text"
                    value={variant.shade}
                    onChange={(e) =>
                      handleVariantChange(index, "shade", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                    disabled={!isEditing}
                  />

                  <label>Quantity</label>
                  <input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    className="border p-2 rounded w-full"
                    disabled={!isEditing}
                  />

                  <label>Image</label>
                  {variant.imageUrl && (
                    <img
                      src={variant.imageUrl}
                      alt={variant.shade}
                      className="w-full h-auto rounded-lg mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isEditing && (
          <button
            onClick={handleSaveChanges}
            className="mt-6 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            disabled={saving}
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
