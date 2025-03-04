"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function BannerUpload({ onBannerAdded }: { onBannerAdded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
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

  // 🚀 Handle Banner Submission
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      toast.error("❌ Please select a banner image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (link) formData.append("link", link);
    formData.append("position", position.toString());
    formData.append("isActive", isActive.toString());

    try {
      const response = await fetch("/api/banner", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload banner");

      toast.success("Banner uploaded successfully!");
      setTitle("");
      setDescription("");
      setLink("");
      setPosition(0);
      setIsActive(true);
      setImage(null);
      setPreview(null);
      onBannerAdded();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`${error.message}`);
      } else {
        toast.error("Something went wrong.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Upload a Banner</h2>
      <form onSubmit={handleAddBanner} className="flex flex-col gap-3">
        {/* 📌 Banner Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter banner title"
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        {/* 📝 Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter banner description"
          className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
        ></textarea>

        {/* 🔗 Optional Link */}
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter banner link (optional)"
          className="border p-2 rounded w-full"
        />

        {/* 🔢 Position */}
        <input
          type="number"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          placeholder="Enter banner position (default: 0)"
          className="border p-2 rounded w-full"
        />

        {/* ✅ Active Toggle */}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} />
          Active Banner
        </label>

        {/* 🖼️ Image Upload */}
        <input type="file" accept="image/*" onChange={handleImageChange} className="border p-2 rounded w-full" />

        {/* 🖼️ Preview */}
        {preview && (
          <img src={preview} alt="Banner Preview" className="w-48 h-32 object-cover rounded-lg border mx-auto" />
        )}

        {/* 🚀 Submit Button */}
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Banner"}
        </button>
      </form>
    </div>
  );
}
