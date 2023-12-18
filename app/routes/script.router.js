const config = require('../config');
const { ProductHighlightRecord, ProxyRecord } = require('../db/mongo')
const fdkExtension = require("../fdk");


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

module.exports = function (fastify, opts, done) {
  fastify.post("/:application_id/tag/:item_code", async function view(req, res) {
    try {
      const platformClient = await fdkExtension.getPlatformClient(req.fdkSession.company_id, req.fdkSession);
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
  
      return res.status(200).send(response);
    } catch(err) {
      throw err;
    }
  })
  
  
  fastify.delete("/:application_id/tag/:item_code", async function view(req, res) {
    try {
      const platformClient = await fdkExtension.getPlatformClient(req.fdkSession.company_id, req.fdkSession);
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
        return res.status(400).send({"Error": `Invalid item code: ${item_code}`});
      }
  
      return res.status(204).send({"data": "success"});
    } catch(err) {
      throw err;
    }
  });
  
  done();
}