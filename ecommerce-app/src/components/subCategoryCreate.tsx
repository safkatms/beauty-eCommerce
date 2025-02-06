"use client";

import { useEffect, useState } from "react";


interface Category {
    id: number;
    name: string;
  }
  
  export default function SubCategoryCreate({ onSubCategoryAdded }: { onSubCategoryAdded: () => void }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  
    // Fetch categories when component mounts
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await fetch("/api/categories"); // Adjust API route as needed
          const data = await res.json();
          setCategories(data);
        } catch (err) {
          setError("Failed to load categories.");
        }
      };
  
      fetchCategories();
    }, []);
  
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
      
        // Ensure categoryId is a number
        const categoryIdNumber = typeof categoryId === "string" ? parseInt(categoryId) : categoryId;
      
        const payload = { name, categoryId: categoryIdNumber };
      
        console.log("Sending payload:", payload); // Check the payload in the console
      
        const res = await fetch("/api/subCategories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      
        const data = await res.json();
      
        if (res.ok) {
          setSuccess("SubCategory added successfully!");
          setName("");
          setCategoryId("");
          onSubCategoryAdded(); // Refresh list after adding
        } else {
          setError(data.error || "Something went wrong.");
        }
      
        setLoading(false);
      };
      
  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-4">
      <h2 className="text-lg font-bold mb-2">Add a New SubCategory</h2>
      <form onSubmit={handleAddSubCategory} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter subcategory name"
          className="border border-pink-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />
        {/* Dropdown for Selecting Category */}
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
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
}
