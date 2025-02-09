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
    images: [],
    variants: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch brands and categories
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

  // Fetch subcategories when category is selected
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
  
    // Append images
    productData.images.forEach((image) => {
      formData.append("images", image);
    });
  
    // Append variants
    formData.append("variants", JSON.stringify(productData.variants));
  
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

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Add a New Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Product Name, Brand, Category, etc. */}
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

        <select
          value={productData.brandId}
          onChange={(e) =>
            setProductData({ ...productData, brandId: e.target.value })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={productData.categoryId}
          onChange={(e) => {
            const categoryId = e.target.value;
            setProductData({ ...productData, categoryId });
            setSelectedCategory(parseInt(categoryId)); // Update selectedCategory for subcategory fetching
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

        {productData.categoryId && (
          <select
            value={productData.subCategoryId}
            onChange={(e) =>
              setProductData({ ...productData, subCategoryId: e.target.value })
            }
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Product Serial Number"
          value={productData.productSerialNo}
          onChange={(e) =>
            setProductData({ ...productData, productSerialNo: e.target.value })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

<input
  type="number"
  placeholder="Purchase Price"
  value={productData.purchasePrice || 0} // Ensure a number is provided, default to 0 if NaN
  onChange={(e) =>
    setProductData({
      ...productData,
      purchasePrice: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
    })
  }
  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
  required
/>

<input
  type="number"
  placeholder="Selling Price"
  value={productData.sellingPrice || 0} // Ensure a number is provided, default to 0 if NaN
  onChange={(e) =>
    setProductData({
      ...productData,
      sellingPrice: isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value),
    })
  }
  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
  required
/>


        {/* File Upload */}
        <input
          type="file"
          multiple
          onChange={(e) =>
            setProductData({
              ...productData,
              images: Array.from(e.target.files!),
            })
          }
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* Add variants */}
        <div>
          <h3 className="text-md font-bold mb-2">Variants</h3>
          {productData.variants.map((variant, index) => (
            <div key={index} className="flex flex-col gap-2 mb-4">
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
              <input
                type="number"
                placeholder="Quantity"
                value={variant.quantity}
                onChange={(e) =>
                  handleVariantChange(
                    index,
                    "quantity",
                    parseInt(e.target.value, 10)
                  )
                }
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      handleVariantChange(
                        index,
                        "imageUrl",
                        reader.result as string
                      );
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Variant
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}
