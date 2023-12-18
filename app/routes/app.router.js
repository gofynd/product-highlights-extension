const { ProductHighlightRecord, PriceDropRecord } = require('../db/mongo');
module.exports = function (fastify, opts, done) {
  fastify.get("/highlight", async function view(req, res) {
    try {
      const application_id = req.application._id;
      const { slug } = req.query;
  
      let data = await ProductHighlightRecord.findOne({
        application_id: application_id, product_slug: slug
      })
  
      if (data) {
        return res.status(200).send(data);
      } else {
        return res.status(404).send({message: "Not found!"});
      }
    } catch(err) {
      throw err;
    }
  })


  fastify.get("/price-drop", async function view(req, res) {
    try {
      const application_id = req.application._id;
      const { slug } = req.query;
  
      let data = await PriceDropRecord.find({product_slug: slug}).exec();
      if (data) {
        let productData = await ProductHighlightRecord.findOne({
          application_id: application_id, product_slug: slug
        })
        if (productData.is_active) {
          return res.status(200).send({showPriceDrop: productData.product.enablePriceDrop});
        } else {
          return res.status(200).send({showPriceDrop: false});
        }
      } else {
        return res.status(200).send({showPriceDrop: false});
      }
  
    } catch(err) {
      throw err;
    }
  });
  
  done();
}