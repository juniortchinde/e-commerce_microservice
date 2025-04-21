const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware')
const {protect} = require('../middleware/auth');

const LoadBalancer = require('../utils/loadBalancer');

// Définissez les instances de chaque microservice
const authBalancer = new LoadBalancer(['http://localhost:4001']);
const productBalancer = new LoadBalancer(['http://localhost:4002']);
const chatBalancer = new LoadBalancer(['http://localhost:4003']);

module.exports = (app) => {
    // redirection vers le service Authentification
    app.use(
        '/user',
        createProxyMiddleware({
            target: authBalancer.getNextServer(),
            changeOrigin: true,
            router: ()=> authBalancer.getNextServer(),
            on: {
                proxyReq: fixRequestBody
            }

        })
    )
    // Redirection vers le service Post
    app.use(
        '/product', protect,
        createProxyMiddleware({
            target: productBalancer.getNextServer(),
            changeOrigin: true,
            router: () => productBalancer.getNextServer(),
            on: {
                proxyReq: (proxyReq, req) => {
                    // Ajouter les en-têtes personnalisés à la requête envoyée au microservice
                    if (req.headers['x-user-id']) {
                        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
                    }
                    if (
                        ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) &&
                        req.body
                    ) {
                        const body = JSON.stringify(req.body);
                        console.log(body);

                        // Nécessaire : Content-Type + Content-Length
                        proxyReq.setHeader('Content-Type', 'application/json');
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
                        proxyReq.write(body);
                    }
                }
            },
        })
    );

    // Redirection vers le service Chat
    app.use(
        '/chat', protect,
        createProxyMiddleware({
            target: chatBalancer.getNextServer(),
            changeOrigin: true,
            router: () =>  chatBalancer.getNextServer()
        })
    );
}