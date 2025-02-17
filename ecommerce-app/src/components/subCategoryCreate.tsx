"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Category {
  id: number;
  name: string;
}

export default function SubCategoryCreate({ onSubCategoryAdded }: { onSubCategoryAdded: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError("Failed to load categories.");
      }
    };

    fetchCategories();
  }, []);

  // Handle Image Selection & Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name || !categoryId) {
      setError("Please select a category and enter a subcategory name.");
      setLoading(false);
      return;
    }

    const categoryIdNumber = typeof categoryId === "string" ? parseInt(categoryId) : categoryId;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", categoryIdNumber.toString());
    if (image) formData.append("image", image);

    try {
      const response = await fetch("/api/subCategories", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subcategory.");
      }

      toast.success("✅ SubCategory added successfully!");
      setName("");
      setCategoryId("");
      setImage(null);
      setPreview(null);
      onSubCategoryAdded();
    } catch (error) {
      toast.error(`❌ ${error}`);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Add a New Sub-Category</h2>
      <form onSubmit={handleAddSubCategory} className="flex flex-col gap-3">
        {/* SubCategory Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subcategory name"
          className="border border-pink-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Category Dropdown */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-pink-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        >
          <option value="">Select a Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border border-pink-300 p-2 rounded-lg w-full"
        />

        {/* Image Preview */}
        {preview && (
          <img
            src={preview}
            alt="SubCategory Preview"
            className="w-32 h-32 object-cover rounded-lg border mt-2"
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Sub-Category"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}
