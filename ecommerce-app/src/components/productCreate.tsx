"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Palette, Plus, ShoppingCart, Trash2 } from "lucide-react";
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
  purchasePrice: number | "";
  sellingPrice: number | "";
  hasVariants: boolean;
  quantity?: number | "";
  ingredients: string;
  description: string;
  images: File[];
  variants: Variant[];
}

interface Variant {
  shade: string;
  quantity: number | "";
  imageFile?: File;
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
    purchasePrice: "",
    sellingPrice: "",
    hasVariants: false,
    quantity: "",
    ingredients: "",
    description: "",
    images: [],
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [serialNumberError, setSerialNumberError] = useState<string | null>(
    null
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variantImagePreviews, setVariantImagePreviews] = useState<string[]>(
    []
  );

  // 🖼️ Handle Main Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setProductData({ ...productData, images: files });
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  // 🎨 Handle Variant Image Upload
  const handleVariantImageChange = (index: number, file: File) => {
    const updatedVariants = [...productData.variants];
    updatedVariants[index].imageFile = file;
    setProductData({ ...productData, variants: updatedVariants });

    const updatedPreviews = [...variantImagePreviews];
    updatedPreviews[index] = URL.createObjectURL(file);
    setVariantImagePreviews(updatedPreviews);
  };

  // ➕ Add Variant
  const addVariant = () => {
    setProductData({
      ...productData,
      variants: [...productData.variants, { shade: "", quantity: "" }],
    });
  };

  // ❌ Remove Variant
  const removeVariant = (index: number) => {
    const updatedVariants = productData.variants.filter((_, i) => i !== index);
    setProductData({ ...productData, variants: updatedVariants });

    const updatedPreviews = variantImagePreviews.filter((_, i) => i !== index);
    setVariantImagePreviews(updatedPreviews);
  };

  // 🔄 Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // 🔍 Check Serial Number Uniqueness
  const checkSerialNumberUnique = async (serialNo: string) => {
    if (!serialNo) return;
    try {
      const response = await fetch(
        `/api/products/checkSerial?serialNo=${serialNo}`
      );
      const data = await response.json();
      setSerialNumberError(
        data.exists ? "This serial number is already in use." : null
      );
    } catch (error) {
      toast.error("Error checking serial number.");
    }
  };

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const serialNo = e.target.value;
    setProductData({ ...productData, productSerialNo: serialNo });
    checkSerialNumberUnique(serialNo);
  };

  // 🚀 Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("brandId", productData.brandId);
    formData.append("categoryId", productData.categoryId);
    formData.append("subCategoryId", productData.subCategoryId);
    formData.append("name", productData.name);
    formData.append("productSerialNo", productData.productSerialNo);
    formData.append(
      "purchasePrice",
      productData.purchasePrice?.toString() || "0"
    );
    formData.append(
      "sellingPrice",
      productData.sellingPrice?.toString() || "0"
    );
    formData.append("ingredients", productData.ingredients);
    formData.append("description", productData.description);
    formData.append("hasVariants", JSON.stringify(productData.hasVariants));

    // 📦 Quantity Handling
    if (!productData.hasVariants && productData.quantity !== "") {
      formData.append("quantity", productData.quantity?.toString() || "0");
    }

    // 🖼️ Append Product Images
    productData.images.forEach((file) => {
      formData.append("images", file);
    });

    // 🎨 Append Variant Images
    if (productData.hasVariants) {
      formData.append("variants", JSON.stringify(productData.variants));
      productData.variants.forEach((variant, index) => {
        if (variant.imageFile) {
          formData.append(`variantImage-${index}`, variant.imageFile);
        }
      });
    }

    // 🛠️ Submit the form to the server
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to add product");
      toast.success("Product added successfully!");
      setProductData({
        brandId: "",
        categoryId: "",
        subCategoryId: "",
        name: "",
        productSerialNo: "",
        purchasePrice: "",
        sellingPrice: "",
        ingredients: "",
        description: "",
        hasVariants: false,
        quantity: "",
        images: [],
        variants: [],
      });
      setImagePreviews([]);
      setVariantImagePreviews([]);
      onProductAdded();
    } catch (error) {
      toast.error("Error creating product!");
    } finally {
      setLoading(false);
    }
  };

  // 🛒 Fetch Brands & Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsRes = await fetch("/api/brands");
        const categoriesRes = await fetch("/api/categories");
        setBrands(await brandsRes.json());
        setCategories(await categoriesRes.json());
      } catch (error) {
        toast.error("Failed to load brands/categories");
      }
    };
    fetchData();
  }, []);

  // 🔄 Fetch Subcategories when Category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubCategories = async () => {
        try {
          const res = await fetch(`/api/subCategories/${selectedCategory}`);
          setSubCategories(await res.json());
        } catch (error) {
          toast.error("Failed to load subcategories");
        }
      };
      fetchSubCategories();
    }
  }, [selectedCategory]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-pink-500" />
        Add New Product
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 🏷️ Product Name */}
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productData.name}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        {/* 🧾 Ingredients */}
        <textarea
          name="ingredients"
          placeholder="Ingredients (comma-separated)"
          value={productData.ingredients}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        {/* 📝 Description */}
        <textarea
          name="description"
          placeholder="Product Description"
          value={productData.description}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        {/* 🔢 Serial Number */}
        <input
          type="text"
          name="productSerialNo"
          placeholder="Product Serial No"
          value={productData.productSerialNo}
          onChange={handleSerialNumberChange}
          className={`border p-3 rounded ${
            serialNumberError ? "border-red-500" : ""
          }`}
          required
        />
        {serialNumberError && (
          <p className="text-red-500 text-sm">{serialNumberError}</p>
        )}

        {/* 🏢 Brand Selection */}
        <select
          name="brandId"
          value={productData.brandId}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        {/* 📂 Category Selection */}
        <select
          name="categoryId"
          value={productData.categoryId}
          onChange={(e) => {
            handleChange(e);
            setSelectedCategory(Number(e.target.value));
          }}
          className="border p-3 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* 📁 Subcategory Selection */}
        {subCategories.length > 0 && (
          <select
            name="subCategoryId"
            value={productData.subCategoryId}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        )}

        {/* 💰 Prices */}
        <div className="flex gap-2">
          <input
            type="number"
            name="purchasePrice"
            placeholder="Purchase Price"
            value={productData.purchasePrice}
            onChange={handleChange}
            className="border p-3 rounded w-full"
            required
          />
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price"
            value={productData.sellingPrice}
            onChange={handleChange}
            className="border p-3 rounded w-full"
            required
          />
        </div>

        {/* 🖼️ Product Images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="border p-3 rounded"
        />
        {imagePreviews.length > 0 && (
          <div className="mt-4 flex gap-4">
            {imagePreviews.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        )}

        {/* 🔀 Variants Toggle */}
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
          <span>Does this product have variants?</span>
        </label>

        {/* 📦 Quantity Field (if no variants) */}
        {!productData.hasVariants && (
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={productData.quantity}
            onChange={handleChange}
            className="border p-3 rounded"
            required
          />
        )}

        {/* 🎨 Manage Variants */}
        {productData.hasVariants && (
          <div>
            <h3 className="text-md font-bold mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              Manage Variants
            </h3>
            {productData.variants.map((variant, index) => (
              <div key={index} className="border p-4 mb-2 relative">
                <input
                  type="text"
                  placeholder="Shade"
                  value={variant.shade}
                  onChange={(e) => {
                    const updated = [...productData.variants];
                    updated[index].shade = e.target.value;
                    setProductData({ ...productData, variants: updated });
                  }}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChange={(e) => {
                    const updated = [...productData.variants];
                    updated[index].quantity =
                      e.target.value === "" ? "" : Number(e.target.value);
                    setProductData({ ...productData, variants: updated });
                  }}
                  className="border p-2 rounded w-full mb-2"
                  required
                />
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files &&
                    handleVariantImageChange(index, e.target.files[0])
                  }
                  className="border p-2 rounded w-full"
                  accept="image/*"
                />
                {variantImagePreviews[index] && (
                  <img
                    src={variantImagePreviews[index]}
                    alt={`Variant Preview ${index}`}
                    className="w-20 h-20 object-cover rounded mb-2"
                  />
                )}
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1"
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={18} /> Add Variant
            </button>
          </div>
        )}

        {/* 🚀 Submit Button */}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
