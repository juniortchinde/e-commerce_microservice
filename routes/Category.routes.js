const router = require('express').Router()
const categoryController = require("../controllers/Category.controller");

router.post("/addCategory", categoryController.addCategory)
router.get("/getAllCategories", categoryController.getAllCategories)

module.exports = router;