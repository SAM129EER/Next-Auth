"use client";
import React from "react";
import Link from "next/link";

const ReviewPage = () => {
  
  const reviews = [
    {
      reviewId: 1,
      title: "Great product",
      content:
        "I really enjoyed using this product. It exceeded my expectations!",
    },
    {
      reviewId: 2,
      title: "Not bad",
      content:
        "The product is decent, but there are some areas for improvement.",
    },
    {
      reviewId: 3,
      title: "Disappointing",
      content:
        "I was expecting more from this product. It did not meet my needs.",
    },
    {
      reviewId: 4,
      title: "Excellent value",
      content:
        "This product offers great value for the price. Highly recommended!",
    },
    {
      reviewId: 5,
      title: "Average experience",
      content: "The product is okay, but it didn't stand out in any way.",
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product Reviews</h1>
      {reviews.map((rev) => (
        <div key={rev.reviewId} className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold">{rev.title}</h2>
          <p>{rev.content}</p>
          <p>
            <Link href={`/products/1/reviews/${rev.reviewId}`}>Read More</Link>
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewPage;
