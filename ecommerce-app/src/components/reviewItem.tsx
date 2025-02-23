import { Star } from "lucide-react";

interface Review {
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string } | null; // Registered user (Nullable)
  guestName?: string | null; // Guest user (Nullable)
}

export default function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center justify-between">
        {/* Show Guest Name or User Name */}
        <p className="font-semibold">
          {review.user?.name || review.guestName || "Anonymous"}
        </p>
        <span className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Star Rating */}
      <div className="flex items-center mt-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            className={index < review.rating ? "text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>

      {/* Comment */}
      <p className="text-gray-700 mt-2">{review.comment}</p>
    </div>
  );
}
