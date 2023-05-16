const express = require('express');
const router = express.Router();
const config = require('../config');
const { ProductHighlightRecord, ProxyRecord } = require('../db/mongo')


function getTagSchema(application_id) {
  return [
    {
      "name": "Product Highlights injection script",
      "sub_type": "external",
      "type": "js",
      "position": "body-bottom",
      "url": `${config.extension.base_url}/bindings/product-highlights/product-highlights.umd.js`,
      "attributes": {
        "id": application_id
      }
    },
    {
      "name": "Product Highlights injection css",
      "sub_type": "external",
      "type": "css",
      "position": "head",
      "url": `${config.extension.base_url}/bindings/product-highlights/product-highlights.css`,
      "attributes": {
      }
    }
  ]
}


router.post("/:application_id/tag/:item_code", async function view(req, res, next) {
  try {
    const { platformClient } = req;
    const { application_id, item_code } = req.params;
    const companyId = Number(req.fdkSession.company_id);

    let response;
    let data = await ProductHighlightRecord.findOne({
      application_id: application_id, company_id: companyId, product_item_code: item_code
    }).exec()

    if (data) {
      data.is_active = true;
      await data.save();

      // add proxy
      let proxyCount = await ProxyRecord.find({company_id: companyId, application_id: application_id}).count();
      if (proxyCount < 1) {
        await platformClient.application(application_id).partner.addProxyPath({
          extensionId: config.extension.api_key, 
          body: {
            attached_path: config.proxy_attach_path, 
            proxy_url: `${config.extension.base_url}/app/proxy`
          }
        })
        let prepareProxy = {
          company_id: companyId,
          application_id: application_id,
          attached_path: config.proxy_attach_path,
          proxy_url: `${config.extension.base_url}/app/proxy`
        }
        await new ProxyRecord(prepareProxy).save();
      }
      
      response = await platformClient.application(application_id).content.addInjectableTag({
        body: {tags: getTagSchema(application_id)}
      })
    } else {
      throw new Error(`Invalid item code: ${item_code}`)
    }

    return res.status(200).json(response);
  } catch(err) {
    next(err);
  }
})


router.delete("/:application_id/tag/:item_code", async function view(req, res, next) {
  try {
    const { platformClient } = req;
    const { application_id, item_code } = req.params;
    const companyId = Number(req.fdkSession.company_id);

    let data = await ProductHighlightRecord.findOne({
      application_id: application_id, company_id: companyId, product_item_code: item_code
    }).exec()

    if (data) {
      data.is_active = false;
      await data.save();

      let activeCount = await ProductHighlightRecord.find({
        application_id: application_id, company_id: companyId, is_active: true
      }).count();

      if (activeCount < 1) {
        let proxy = await ProxyRecord.deleteOne({company_id: companyId, application_id: application_id}).exec();
        if (proxy) {
          await platformClient.application(application_id).partner.removeProxyPath({
            extensionId: config.extension.api_key, attachedPath: config.proxy_attach_path
          })
        }
        await platformClient.application(application_id).content.deleteAllInjectableTags();
      }

    } else {
      return res.status(400).json({"Error": `Invalid item code: ${item_code}`});
    }

    return res.status(204).json({"data": "success"});
  } catch(err) {
    next(err);
  }
})

module.exports = router;