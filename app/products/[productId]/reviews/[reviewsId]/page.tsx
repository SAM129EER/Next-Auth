import React from "react";

type Props = {
  params: { productId: string; reviewsId: string };
};

const ReviewDetailPage = async ({ params }: Props) => {
  const { productId, reviewsId } = await  params;

  return (
    <div>
      Review {reviewsId} for product {productId}
    </div>
  );
};

export default ReviewDetailPage;
