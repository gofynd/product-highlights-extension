const { setupFdk } = require("fdk-extension-javascript/fastify");
const { RedisStorage } = require("fdk-extension-javascript/storage");
const config =  require("../config");
const { appRedis } = require("./../common/redis.init");
const { productPriceUpdateHandler } = require('../webhook')

let fdkExtension = setupFdk({
    api_key: config.extension.api_key,
    api_secret: config.extension.api_secret,
    base_url: config.extension.base_url,
    callbacks: {
        auth: async (req) => {
            // Write your code here to return initial launch url after auth process complete
            return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        
        uninstall: async (req) => {
            // Write your code here to cleanup data related to extension
            // If task is time taking then process it async on other process.
            const { company_id } = req.body;
            const { ProductHighlightRecord, ProxyRecord } = require('../db/mongo')
            await ProductHighlightRecord.bulkWrite([{
                updateMany: {
                    "filter": {
                        "company_id": company_id
                    },
                    "update": {
                        $set: {
                            "is_active": false
                        }
                    }
                }
            }]);
            await ProxyRecord.deleteMany({ company_id: company_id });
        }
    },
    // debug: true,
    storage: new RedisStorage(appRedis,"product-highlights-ext"), // add your prefix
    access_mode: "offline",
    cluster: config.extension.fp_api_server, // this is optional by default it points to prod.
    webhook_config: {
        api_path: "/ext/product-highlight-webhook",
        notification_email: "dev@fynd.com",
        event_map: {
            "company/article/update": {
                "handler": productPriceUpdateHandler,
                "version": '1'
            }
        }
    }
});


module.exports = fdkExtension;
