"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function CategoryCreate({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle Image Change & Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("name", name);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      toast.success("✅ Category added successfully!");
      setName("");
      setImage(null);
      setPreview(null);
      onCategoryAdded();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`❌ ${error.message}`);
      } else {
        toast.error("❌ Something went wrong.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Add a New Category</h2>
      <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
        {/* Category Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded w-full"
        />

        {/* Image Preview */}
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Category Preview" className="w-32 h-32 object-cover rounded-lg border" />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </form>
    </div>
  );
}
