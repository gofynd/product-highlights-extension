const express = require('express');
const { ProductHighlightRecord, PriceDropRecord } = require('../db/mongo');
const router = express.Router();



router.get("/highlight", async function view(req, res, next) {
  try {
    const application_id = req.application._id;
    const { slug } = req.query;

    let data = await ProductHighlightRecord.findOne({
      application_id: application_id, product_slug: slug
    })

    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(404).json({message: "Not found!"});
    }
  } catch(err) {
    next(err)
  }
})


router.get("/price-drop", async function view(req, res, next) {
  try {
    const application_id = req.application._id;
    const { slug } = req.query;

    let data = await PriceDropRecord.find({product_slug: slug}).exec();
    if (data) {
      let productData = await ProductHighlightRecord.findOne({
        application_id: application_id, product_slug: slug
      })
      if (productData.is_active) {
        return res.status(200).json({showPriceDrop: productData.product.enablePriceDrop});
      } else {
        return res.status(200).json({showPriceDrop: false});
      }
    } else {
      return res.status(200).json({showPriceDrop: false});
    }

  } catch(err) {
    next(err);
  }
})



module.exports = router;