import React from "react";

const getQuotes = async () => {
  const res = await fetch("https://dummyjson.com/quotes/random", {
    // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error("Failed to fetch quotes");
  }

  return res.json();
};

const QuotesPage = async () => {
  const data = await getQuotes();
  console.log(data);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Quote of the Day</h1>
      <div className="p-4 border-l-4 border-blue-500 bg-gray-50 rounded">
        <p className="text-lg italic mb-2">"{data.quote}"</p>
        <p className="text-sm font-semibold text-gray-600">— {data.author}</p>
      </div>
    </div>
  );
};

export default QuotesPage;
