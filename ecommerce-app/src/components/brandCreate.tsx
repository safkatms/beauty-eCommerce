"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function BrandCreate({ onBrandAdded }: { onBrandAdded: () => void }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🖼️ Handle Image Selection & Preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🚀 Handle Brand Submission
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("/api/brands", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add brand");

      toast.success("✅ Brand added successfully!");
      setName("");
      setImage(null);
      setPreview(null);
      onBrandAdded();
    } catch (error) {
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
      <h2 className="text-lg font-bold mb-2">Add a New Brand</h2>
      <form onSubmit={handleAddBrand} className="flex flex-col gap-3">
        {/* 🏷️ Brand Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter brand name"
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />

        {/* 🖼️ Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded w-full"
        />

        {/* 🖼️ Preview */}
        {preview && (
          <img src={preview} alt="Brand Preview" className="w-32 h-32 object-cover rounded-lg border" />
        )}

        {/* 🚀 Submit Button */}
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Brand"}
        </button>
      </form>
    </div>
  );
}
