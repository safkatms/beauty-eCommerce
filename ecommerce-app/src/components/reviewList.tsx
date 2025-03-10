"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Review {
  id?: number; // Some reviews might not have an ID
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name: string } | null; // Registered users
  guestName?: string; // Guest users
}

export default function ReviewList({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/details/${productId}`);
        const data = await response.json();
        setReviews(data.reviews || []); // Ensure reviews is always an array
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) return <p className="text-center text-gray-500">Loading reviews...</p>;
  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

      {reviews.map((review, index) => {
        // ✅ Ensure a unique key (Fallback to index if `id` is missing)
        const reviewKey = review.id ? `review-${review.id}` : `guest-review-${index}`;

        return (
          <div key={reviewKey} className="border-b pb-4 mb-4">
            {/* ✅ User Info (Supports Registered Users & Guests) */}
            <p className="font-medium">
              {review.user?.name || review.guestName || "Anonymous"}
            </p>
            <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>

            {/* ⭐ Star Rating (Using Loop) */}
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, starIndex) => (
                <Star
                  key={`${reviewKey}-star-${starIndex}`} // Unique star key
                  size={16}
                  className={starIndex < review.rating ? "text-yellow-500" : "text-gray-300"}
                />
              ))}
            </div>

            {/* 📝 Review Comment */}
            {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
          </div>
        );
      })}
    </div>
  );
}
