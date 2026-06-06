import React from 'react'

const  productidpage = async ({params} : {params : Promise<{productId : string | number} >} ) => {
    const {productId} = await params;
  return (
    <div>
      <h1>product id is {productId}</h1>
    </div>
  )
}

export default productidpage
