const router = require("express").Router();
const productController = require("../controllers/Product.controller");

router.post("/addProduct", productController.addProduct);
router.delete("/deleteProduct/:productId", productController.deleteProduct);
router.patch("/updateProduct/:productId", productController.updateProduct);
router.get("/getProduct/:productId", productController.getProduct);
router.get("/getAllProducts", productController.getAllProducts);
router.get('/getProductForUser', productController.getProductsForUser);
router.get('/searchProducts', productController.searchProducts)

module.exports = router;