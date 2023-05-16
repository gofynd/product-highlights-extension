const express = require('express');
const { ProductHighlightRecord } = require('../db/mongo')

const router = express.Router();


// Get applications list
router.get('/applications', async function view(req, res, next) {
    try {
        const {
            platformClient
        } = req;
        const companyId = req.fdkSession.company_id;

        let applications = await platformClient.configuration.getApplications({
            pageSize: 1000,
            q: JSON.stringify({"is_active": true})
        })

        let activeApplicationSet = new Set();
        let productSchema = await ProductHighlightRecord.find({company_id: companyId, is_active: true}, {application_id: 1});
        for (let index = 0; index < productSchema.length; index++) {
            activeApplicationSet.add(productSchema[index].application_id.toString());
        }
        for (let index = 0; index < applications?.items?.length; index++) {
            applications.items[index] = {
                ...applications?.items?.[index], 
                is_active: activeApplicationSet.has(applications.items[index]._id.toString()) ? true : false 
            }
        }
        return res.status(200).json(applications);

    } catch (err) {
        next(err);
    }
});


// get product list
router.get('/:application_id/products', async function view(req, res, next) {
    try {
        const { platformClient } = req;
        const { application_id } = req.params;
        const { query } = req.query;
        let response = await platformClient.application(application_id).catalog.getAppProducts({
            pageNo: 1,
            pageSize: 10,
            q: query
        })
        return res.status(200).json(response)
    } catch(error) {
        next(error);
    }
})


// update product highlights
router.post("/:application_id/product/:item_id/highlights", async function view(req, res, next) {
    try {
        const { application_id, item_id } = req.params;
        const { product_meta, highlights, enablePriceDrop } = req.body        
        const companyId = Number(req.fdkSession.company_id);

        let productHighlightRecord = await ProductHighlightRecord.findOne({
            company_id: companyId, application_id: application_id, product_item_code: item_id
        }).exec()

        if (productHighlightRecord) {
            productHighlightRecord.product.highlights = highlights;
            productHighlightRecord.product.enablePriceDrop = enablePriceDrop;
            await productHighlightRecord.save();

        } else {
            const prepareRecord = {
                company_id: companyId,
                application_id: application_id,
                product_item_code: product_meta.product_item_code,
                product_slug: product_meta.product_slug,
                product: {
                    name: product_meta.name,
                    image: product_meta.image,
                    brand_name: product_meta.brand_name,
                    category_slug: product_meta.category_slug,
                    highlights: highlights,
                    price: product_meta.price,
                    enablePriceDrop: enablePriceDrop
                },
                is_active: false
            }
            productHighlightRecord = await new ProductHighlightRecord(prepareRecord).save();
        }
        return res.status(200).json(productHighlightRecord);

    } catch(error) {
        next(error);
    }
})



// get product highlights list
router.get("/:application_id/highlight/list", async function view(req, res, next) {
    try {
        const { application_id } = req.params;
        const companyId = Number(req.fdkSession.company_id);
    
        let data = await ProductHighlightRecord.find({application_id: application_id, company_id: companyId}).exec();
        return res.status(200).json(data);
    } catch(error) {
        next(error)
    }
})



// get product highlight by product item code or slug
router.get("/:application_id/highlight", async function view(req, res, next) {
    try {
        const { application_id } = req.params;
        let { slug, item_code } = req.query;
        const companyId = Number(req.fdkSession.company_id);
        // const companyId = 11197;
        let data;
        
        if (item_code) {
            item_code = Number(item_code)
            data = await ProductHighlightRecord.findOne({
                application_id: application_id, company_id: companyId, product_item_code: item_code
            }).exec();
        } else if (slug) {
            data = await ProductHighlightRecord.findOne({
                company_id: companyId, application_id: application_id, product_slug: slug
            })
        } else {
            return res.status(400).json({"Error": "Invalid Item code or slug in the query param"});
        }
    
        return res.status(200).json(data);
    } catch(error) {
        next(error);
    }
})


// delete product highlight by item code or slug
router.delete("/:application_id/highlight", async function view(req, res, next) {
    try {
        const { application_id } = req.params;
        const { slug } = req.query;
        const item_code = Number(req.query.item_code);
        const companyId = Number(req.fdkSession.company_id);
        let data;

        if (item_code !== "") {
            data = await ProductHighlightRecord.deleteOne({
                application_id: application_id, company_id: companyId, product_item_code: item_code
            }).exec();
        } else if (slug !== "") {
            data = await ProductHighlightRecord.deleteOne({
                company_id: companyId, application_id: application_id, product_slug: slug
            }).exec();
        } else {
            throw new Error("Invalid Item code or slug in query param");
        }

        return res.status(200).json(data);
    } catch(error) {
        next(error);
    }
})


module.exports = router;