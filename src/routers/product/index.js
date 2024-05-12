const express = require("express");
const productController = require("../../controllers/product.controller");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();


router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct))

// authentication
router.use(authenticationV2)
////////////

router.post("", asyncHandler(productController.createProduct))
router.post("/publish/:id", asyncHandler(productController.publishProductByShop))
router.post("/unPublish/:id", asyncHandler(productController.unPublishProductByShop))

// query
router.get("/draft/all", asyncHandler(productController.getAllDraftsForShop))
router.get("/published/all", asyncHandler(productController.getAllPublishedForShop))


module.exports = router