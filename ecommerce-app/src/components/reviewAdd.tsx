"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";

interface AddReviewProps {
  productId: number;
  userId?: number | null; // Nullable for guest users
  onReviewAdded: () => void;
}

export default function AddReview({ productId, userId, onReviewAdded }: AddReviewProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState(""); // Allow guests to provide a name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Handle Star Click
  const handleStarClick = (index: number) => setRating(index + 1);

  // 📤 Submit Review
  const submitReview = async () => {
    if (!rating) return setError("Please select a rating.");
    if (comment.trim().length < 3) return setError("Comment should be at least 3 characters.");
    if (!userId && guestName.trim().length < 2) return setError("Please enter your name as a guest.");

    setLoading(true);
    try {
      const response = await fetch("/api/products/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId, guestName, rating, comment }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      setRating(0);
      setComment("");
      setGuestName(""); // Clear guest name field
      setError(null);
      onReviewAdded(); // Refresh reviews
    } catch (err) {
      setError("Error submitting review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-6">
      <h3 className="text-lg font-semibold">Write a Review</h3>

      {/* Guest Name Input (Only Show for Guest Users) */}
      {!userId && (
        <input
          type="text"
          className="w-full mt-2 p-2 border rounded-lg"
          placeholder="Enter your name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
      )}

      {/* ⭐ Star Rating */}
      <div className="flex gap-1 mt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={24}
            className={index < rating ? "text-yellow-500 cursor-pointer" : "text-gray-300 cursor-pointer"}
            onClick={() => handleStarClick(index)}
          />
        ))}
      </div>

      {/* ✍️ Review Text */}
      <textarea
        className="w-full mt-3 p-3 border rounded-lg focus:outline-none"
        rows={3}
        placeholder="Write your review..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* ⚠️ Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* 📤 Submit Button */}
      <button
        onClick={submitReview}
        disabled={loading}
        className="w-full mt-3 py-2 flex items-center justify-center gap-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
      >
        <Send size={18} />
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
