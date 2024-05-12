'use strict'

const { findById } = require("../services/apiKey.service")

const HEADERS = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorozation'
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADERS.API_KEY]?.toString()
        if (!key) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }

        // check objKey
        const objKey = await findById(key)

        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden Error"
            })
        }

        req.objKey = objKey
        return next();

    } catch (error) {

    }
}

const permissions = (permissions) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: "permissions denied"
            })
        }
        console.log("permissions::", req.objKey.permissions)
        const validPermissions = req.objKey.permissions.includes(permissions)

        if (!validPermissions) {
            return res.status(403).json({
                message: "permissions denied"
            })
        }

        return next()
    }
}


module.exports = { apiKey, permissions }