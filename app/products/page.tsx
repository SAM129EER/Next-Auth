import Link from "next/link";
import React from "react";

const getData = async () => {
  const res = await fetch("https://fakestoreapi.com/products");
  return res.json();
};

const ProductsPage = async () => {
  const products = await getData();
  console.log(products);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products page</h1>
      {products.map((item: any) => (
        <div key={item.id} className="mb-4 p-4 border rounded">
          <h1>{item.category}</h1>
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <p>{item.description}</p>
          <Link
            href={`/products/${item.id}`}
            className="text-blue-600 hover:underline"
          >
            View Details
          </Link>
          <Link
            href={`/products/${item.id}/reviews`}
            className="text-blue-600 hover:underline"
          >
            View reviews
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProductsPage;
