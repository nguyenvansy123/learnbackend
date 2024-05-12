const express = require("express");
const accessController = require("../../controllers/access.controller");
const { authentication,authenticationV2 } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();


// signUp
router.post("/shop/signup", asyncHandler(accessController.signUp))
router.post("/shop/login", asyncHandler(accessController.login))

// authentication
// router.use(authentication)
router.use(authenticationV2)
////////////
router.get("/shop/logout", asyncHandler(accessController.logout))
router.post("/shop/handlerRefreshToken", asyncHandler(accessController.handlerRefreshToken))

module.exports = router