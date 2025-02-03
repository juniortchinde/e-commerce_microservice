const router = require("express").Router();
const productController = require("../controllers/Product.controller");
const upload = require("../middlewares/upload");
const auth = require("../middlewares/auth");


router.post("/addProduct",auth.protect, upload.upload,upload.validateAndSave, productController.addProduct);
router.delete("/deleteProduct/:productId", productController.deleteProduct);
router.patch("/updateProduct/:productId", productController.updateProduct);
router.get("/getProduct/:productId", productController.getProduct);
router.get("/getAllProducts", productController.getAllProducts);
router.get('/getProductForUser', productController.getProductsForUser);
router.get('/searchProducts', productController.searchProducts)


module.exports = router;