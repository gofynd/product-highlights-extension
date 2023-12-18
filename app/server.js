const fastify = require("fastify");
const path = require("path");
//const healthzRouter = require("./routes/healthz.router");
const productRouter = require("./routes/product.router");
const scriptRouter = require("./routes/script.router");
const appRouter = require("./routes/app.router");
const fdkExtension = require("./fdk");
const app = fastify({logger: true});
app.register(require('@fastify/cookie'), {
  secret: ['ext.session']
});
app.register(require('@fastify/static'), {
  root: path.join(__dirname, '../build'),
  prefix: '/',
})
const config = require("./config");
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

//app.use("/", healthzRouter);
//app.use('/bindings/product-highlights', express.static(path.join(__dirname, '../bindings/dist')))


// platform routes
const apiRoutes = async (fastify, options) => {
  fastify.addHook('preHandler', async (req, res) => {
      try {
          const companyId = req.headers['x-company-id'] || req.query['company_id'];
          const compCookieName = `ext_session_${companyId}`
          let cookieName = req.cookies[compCookieName] || '';
          let sessionId = req.unsignCookie(cookieName).value;
          req.fdkSession = await fdkExtension.middlewares.isAuthorized(sessionId);
          if (!req.fdkSession) {
              return res.status(401).send({ "message": "unauthorized" });
          }
      } catch (error) {
          throw error
      }
  });

  fastify.register(productRouter, { prefix: '/api/v1.0' });
  fastify.register(scriptRouter, { prefix: '/api/v1.0' });
};



// application routes
const applicationProxyRoutes = async (fastify, options) => {
  fastify.register(fdkExtension.applicationProxyRoutes);

  fastify.register(appRouter, { prefix: '/app/proxy' });
};


app.get('/company/:company_id', (req, res) => {
  res.sendFile("/index.html");
});



app.get('/another/path', (req, res) => {
  res.sendFile('index.html')
});


// webhook handler
app.post('/ext/product-highlight-webhook', async function(req, res) {
  try {
    console.log(`Webhook Event: ${req.body.event} received`)
    await fdkExtension.webhookRegistry.processWebhook(req);
    return res.status(200).send({"success": true});
  } catch(err) {
    console.log(`Error Processing ${req.body.event} Webhook`);
    return res.status(500).send({"success": false});
  }
})
app.register(fdkExtension.fdkHandler);
app.register(apiRoutes);
app.register(applicationProxyRoutes);

module.exports = app;