const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const healthzRouter = require("./routes/healthz.router");
const productRouter = require("./routes/product.router");
const scriptRouter = require("./routes/script.router");
const appRouter = require("./routes/app.router");
const fdkExtension = require("./fdk");
const app = express();
const config = require("./config");
app.use(cookieParser("ext.session"));
app.use(bodyParser.json({
    limit: '2mb'
}));
app.get('/env.js', (req, res) => {
    const commonEnvs = {
      base_url: config.extension.base_url
    }
    res.type('application/javascript');
    res.send(
      `window.env = ${JSON.stringify(
        commonEnvs,
        null,
        4
      )}`
    );
});
app.use("/", healthzRouter);
app.use(express.static(path.resolve(__dirname, "../build/")));
app.use('/bindings/product-highlights', express.static(path.join(__dirname, '../bindings/dist')))
app.use("/", fdkExtension.fdkHandler);


// platform routes
const apiRoutes = fdkExtension.apiRoutes;
apiRoutes.use('/v1.0', productRouter);
apiRoutes.use('/v1.0', scriptRouter);
app.use('/api', apiRoutes);


// application routes
const applicationProxyRoutes = fdkExtension.applicationProxyRoutes
applicationProxyRoutes.use("/proxy", appRouter);
app.use('/app', applicationProxyRoutes);


app.get('/company/:company_id', (req, res) => {
  res.sendFile(path.resolve(__dirname, "../build/index.html"))
})

app.get('*', (req, res) => {
  res.contentType('text/html');
  res.sendFile(path.resolve(__dirname, '../build/index.html'))
});


// webhook handler
app.post('/ext/product-highlight-webhook', async function(req, res) {
  try {
    console.log(`Webhook Event: ${req.body.event} received`)
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).json({"success": true});
  } catch(err) {
    console.log(`Error Processing ${req.body.event} Webhook`);
    return res.status(500).json({"success": false});
  }
})

module.exports = app;