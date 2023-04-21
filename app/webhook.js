const { ProductHighlightRecord, PriceDropRecord } = require('./db/mongo')

const productPriceUpdateHandler = async (eventName, { payload }, companyId, applicationId) => {

  // check if pyload has articles object or not 
  // if not exists then return
  if (!payload.articles) {
    return 
  } else {
    let articles = payload.articles
    for (let article of articles) {
      // fetch record from database
      let data = await ProductHighlightRecord.findOne(
        {company_id: companyId, product_item_code: article.item_id}
      )
      
      // check if data is there and price is also there or not
      if (data && data.product.price ) {
  
        // get old and new price
        let previousPrice = data.product.price.effective
        let newPrice = article.price.effective.max
  
        // compare both price
        if (previousPrice !== newPrice) {
  
          // if price is decreased
          if (newPrice < previousPrice || newPrice < previousPrice) {
            
            // saving price drop with TTL of 2 days
            await new PriceDropRecord({product_slug: data.product_slug}).save();
          }
  
          // update record with new price
          data.product.price.effective.max = newPrice
          data.product.price.effective.min = newPrice
          await data.save();
        }
      }
    }
  }
}


module.exports = { productPriceUpdateHandler };