const express = require("express");
const { apiKey, permissions } = require("../auth/checkAuth");
const router = express.Router();

// check apikey
router.use(apiKey)
// check permissions
router.use(permissions('0000'))


router.use('/v1/api/product', require("./product"))
router.use('/v1/api', require("./access"))


module.exports = router