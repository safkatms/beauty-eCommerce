"use client";

import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
}

interface ProductData {
  brandId: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  productSerialNo: string;
  purchasePrice: number;
  sellingPrice: number;
  hasVariants: boolean;
  quantity?: number;
  images: File[];
  variants: Variant[];
}

interface Variant {
  shade: string;
  quantity: number;
  imageUrl?: string;
}

export default function ProductForm({
  onProductAdded,
}: {
  onProductAdded: () => void;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [productData, setProductData] = useState<ProductData>({
    brandId: "",
    categoryId: "",
    subCategoryId: "",
    name: "",
    productSerialNo: "",
    purchasePrice: 0,
    sellingPrice: 0,
    hasVariants: false,
    quantity: undefined,
    images: [],
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [serialNumberError, setSerialNumberError] = useState<string | null>(
    null
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const checkSerialNumberUnique = async (serialNo: string) => {
    if (!serialNo) return;

    try {
      const response = await fetch(
        `/api/products/checkSerial?serialNo=${serialNo}`
      );
      const data = await response.json();

      if (data.exists) {
        setSerialNumberError("This serial number is already in use.");
      } else {
        setSerialNumberError(null);
      }
    } catch (error) {
      console.error("Error checking serial number:", error);
      setSerialNumberError("Error checking serial number.");
    }
  };

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const serialNo = e.target.value;
    setProductData({ ...productData, productSerialNo: serialNo });
    checkSerialNumberUnique(serialNo);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsRes = await fetch("/api/brands");
        const categoriesRes = await fetch("/api/categories");
        setBrands(await brandsRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== null) {
      const fetchSubCategories = async () => {
        try {
          const response = await fetch(
            `/api/subCategories/${selectedCategory}`
          );
          setSubCategories(await response.json());
        } catch (error) {
          console.error("Error fetching subcategories", error);
        }
      };
      fetchSubCategories();
    }
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("brandId", productData.brandId);
    formData.append("categoryId", productData.categoryId);
    formData.append("subCategoryId", productData.subCategoryId);
    formData.append("name", productData.name);
    formData.append("productSerialNo", productData.productSerialNo);
    formData.append("purchasePrice", productData.purchasePrice.toString());
    formData.append("sellingPrice", productData.sellingPrice.toString());
    formData.append("hasVariants", JSON.stringify(productData.hasVariants));

    if (!productData.hasVariants && productData.quantity !== undefined) {
      formData.append("quantity", productData.quantity.toString());
    }

    // Append images
    productData.images.forEach((image) => {
      formData.append("images", image);
    });

    // Append variants
    if (productData.hasVariants) {
      formData.append("variants", JSON.stringify(productData.variants));
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create product");

      toast.success("✅ Product added successfully!"); // Success toast

      setProductData({
        brandId: "",
        categoryId: "",
        subCategoryId: "",
        name: "",
        productSerialNo: "",
        purchasePrice: 0,
        sellingPrice: 0,
        hasVariants: false,
        quantity: undefined,
        images: [],
        variants: [],
      });

      onProductAdded();
    } catch (error) {
      toast.error("❌ Error creating product!"); // Error toast
    } finally {
      setLoading(false);
    }
  };
  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number | File
  ) => {
    const updatedVariants = [...productData.variants];
    if (field === "imageUrl" && value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        updatedVariants[index] = {
          ...updatedVariants[index],
          [field]: reader.result as string,
        };
        setProductData({ ...productData, variants: updatedVariants });
      };
      reader.readAsDataURL(value);
    } else {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      setProductData({ ...productData, variants: updatedVariants });
    }
  };

  const addVariant = () => {
    setProductData({
      ...productData,
      variants: [
        ...productData.variants,
        { shade: "", quantity: 0, imageUrl: "" },
      ],
    });
  };
  const removeVariant = (index: number) => {
    setProductData((prevData) => ({
      ...prevData,
      variants: prevData.variants.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Add a New Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Product Name */}
        <input
          type="text"
          placeholder="Product Name"
          value={productData.name}
          onChange={(e) =>
            setProductData({ ...productData, name: e.target.value })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Brand Selection */}
        <select
          value={productData.brandId}
          onChange={(e) =>
            setProductData({ ...productData, brandId: e.target.value })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        {/* Category Selection */}
        <select
          value={productData.categoryId}
          onChange={(e) => {
            const categoryId = e.target.value;
            setProductData({ ...productData, categoryId });
            setSelectedCategory(parseInt(categoryId));
          }}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* SubCategory Selection */}
        {productData.categoryId && (
          <select
            value={productData.subCategoryId}
            onChange={(e) =>
              setProductData({ ...productData, subCategoryId: e.target.value })
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        )}

        {/* Product Serial Number */}
        <input
          type="text"
          placeholder="Product Serial Number"
          value={productData.productSerialNo}
          onChange={handleSerialNumberChange}
          className={`border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            serialNumberError ? "border-red-500" : ""
          }`}
          required
        />
        {serialNumberError && (
          <p className="text-red-500 text-sm">{serialNumberError}</p>
        )}

        {/* Purchase Price */}
        <input
          type="number"
          placeholder="Purchase Price"
          value={
            productData.purchasePrice === 0 ? "" : productData.purchasePrice
          } // Allow empty input
          onChange={(e) => {
            const value = e.target.value;
            setProductData({
              ...productData,
              purchasePrice: value === "" ? 0 : parseFloat(value), // Ensure always a number
            });
          }}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Selling Price */}
        <input
          type="number"
          placeholder="Selling Price"
          value={productData.sellingPrice === 0 ? "" : productData.sellingPrice} // Allow empty input
          onChange={(e) => {
            const value = e.target.value;
            setProductData({
              ...productData,
              sellingPrice: value === "" ? 0 : parseFloat(value), // Ensure always a number
            });
          }}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />


{/* Images Upload with Preview */}
<div>
  <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
      const files = Array.from(e.target.files!);
      setProductData({
        ...productData,
        images: files,
      });

      // Generate preview URLs
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }}
    className="border p-2 rounded w-full"
  />

  {/* Preview Images */}
  {imagePreviews.length > 0 && (
    <div className="mt-4 grid grid-cols-3 gap-4">
      {imagePreviews.map((src, index) => (
        <div key={index} className="relative">
          <img
            src={src}
            alt={`Preview ${index + 1}`}
            className="w-24 h-24 object-cover rounded-lg border"
          />
        </div>
      ))}
    </div>
  )}
</div>

        {/* Checkbox for Variants */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={productData.hasVariants}
            onChange={() =>
              setProductData({
                ...productData,
                hasVariants: !productData.hasVariants,
              })
            }
          />
          This product has variants
        </label>

        {/* Single Quantity Field (if no variants) */}
        {!productData.hasVariants && (
          <input
            type="number"
            placeholder="Quantity"
            value={productData.quantity || ""}
            onChange={(e) =>
              setProductData({
                ...productData,
                quantity: parseInt(e.target.value, 10) || 0,
              })
            }
            className="border p-2 rounded w-full"
            required
          />
        )}

        {/* Variant Section */}
        {productData.hasVariants && (
          <div>
            <h3 className="text-md font-bold mb-2">Variants</h3>
            {productData.variants.map((variant, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 mb-4 border p-2 rounded relative"
              >
                {/* Shade Input */}
                <input
                  type="text"
                  placeholder="Shade"
                  value={variant.shade}
                  onChange={(e) =>
                    handleVariantChange(index, "shade", e.target.value)
                  }
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />

                {/* Quantity Input */}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity === 0 ? "" : variant.quantity} // Allow empty input
                  onChange={(e) => {
                    const value = e.target.value;
                    handleVariantChange(
                      index,
                      "quantity",
                      value === "" ? 0 : parseInt(value, 10) // Ensure always a number
                    );
                  }}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />

                {/* Variant Image Preview */}
                {variant.imageUrl && typeof variant.imageUrl === "string" && (
                  <img
                    src={variant.imageUrl}
                    alt={`Variant ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                )}

                {/* Image Upload */}
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVariantChange(index, "imageUrl", e.target.files[0]);
                    }
                  }}
                  className="border p-2 rounded w-full"
                />

                {/* Remove Variant Button */}
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  ✕ Remove
                </button>
              </div>
            ))}

            {/* Add Variant Button */}
            <button
              type="button"
              onClick={addVariant}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Variant
            </button>
          </div>
        )}

        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading || serialNumberError !== null}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
