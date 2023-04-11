const { setupFdk } = require("fdk-extension-javascript/express");
const { RedisStorage } = require("fdk-extension-javascript/express/storage");
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
        }
    },
    // debug: true,
    storage: new RedisStorage(appRedis,"product-highlights-ext"), // add your prefix
    access_mode: "offline",
    cluster: config.extension.fp_api_server, // this is optional by default it points to prod.
    webhook_config: {
        api_path: "/ext/product-highlight-webhook",
        notification_email: "meetkoriya@fynd.com",
        event_map: {
            "company/article/update": {
                "handler": productPriceUpdateHandler,
                "version": '1'
            }
        }
    }
});


module.exports = fdkExtension;
