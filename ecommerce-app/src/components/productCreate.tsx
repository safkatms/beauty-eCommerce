"use client";

import React, { useEffect, useState } from "react";

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

export default function ProductForm({ onProductAdded }: { onProductAdded: () => void }) {
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
          const response = await fetch(`/api/subCategories/${selectedCategory}`);
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
  
      setSuccess("Product added successfully!");
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong.");
      }
    }
  
    setLoading(false);
  };
  


  const handleVariantChange = (index: number, field: keyof Variant, value: string | number | File) => {
    const updatedVariants = [...productData.variants];
    if (field === "imageUrl" && value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        updatedVariants[index] = { ...updatedVariants[index], [field]: reader.result as string };
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
      variants: [...productData.variants, { shade: "", quantity: 0, imageUrl: "" }],
    });
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
          onChange={(e) => setProductData({ ...productData, name: e.target.value })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Brand Selection */}
        <select
          value={productData.brandId}
          onChange={(e) => setProductData({ ...productData, brandId: e.target.value })}
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
            onChange={(e) => setProductData({ ...productData, subCategoryId: e.target.value })}
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
          onChange={(e) => setProductData({ ...productData, productSerialNo: e.target.value })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Purchase & Selling Price */}
        <input
          type="number"
          placeholder="Purchase Price"
          value={productData.purchasePrice}
          onChange={(e) => setProductData({ ...productData, purchasePrice: parseFloat(e.target.value) })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        <input
          type="number"
          placeholder="Selling Price"
          value={productData.sellingPrice}
          onChange={(e) => setProductData({ ...productData, sellingPrice: parseFloat(e.target.value) })}
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Images Upload */}
        <input type="file" multiple onChange={(e) => setProductData({ ...productData, images: Array.from(e.target.files!) })} className="border p-2 rounded w-full" />
         {/* Checkbox for Variants */}
         <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={productData.hasVariants}
            onChange={() => setProductData({ ...productData, hasVariants: !productData.hasVariants })}
          />
          This product has variants
        </label>

        {/* Single Quantity Field (if no variants) */}
        {!productData.hasVariants && (
          <input
            type="number"
            placeholder="Quantity"
            value={productData.quantity || ""}
            onChange={(e) => setProductData({ ...productData, quantity: parseInt(e.target.value, 10) || 0 })}
            className="border p-2 rounded w-full"
            required
          />
        )}

        {/* Variant Section */}
        {productData.hasVariants && (
          <div>
            <h3 className="text-md font-bold mb-2">Variants</h3>
            {productData.variants.map((variant, index) => (
              <div key={index} className="flex flex-col gap-2 mb-4 border p-2 rounded">
                <input
                  type="text"
                  placeholder="Shade"
                  value={variant.shade}
                  onChange={(e) => handleVariantChange(index, "shade", e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChange={(e) => handleVariantChange(index, "quantity", parseInt(e.target.value, 10))}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="file"
                  onChange={(e) => e.target.files && handleVariantChange(index, "imageUrl", e.target.files[0])}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
            <button type="button" onClick={addVariant} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Variant
            </button>
          </div>
        )}
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
