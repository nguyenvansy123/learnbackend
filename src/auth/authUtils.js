'use strict'

const JWT = require("jsonwebtoken")
const { asyncHandler } = require("../helpers/asyncHandler")
const { AuthFailureError, NotFoundError } = require("../core/error.response")
const { findByUserId } = require("../services/keyToken.service")

const HEADERS = {
    API_KEY: 'x-api-key',
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
}

const
    createTokenPair = async (payload, publicKey, privateKey) => {
        try {
            // accessToken
            const accessToken = await JWT.sign(payload, publicKey, {
                // algorithm: "RS256",
                expiresIn: "2 days"
            })

            // refeshToken
            const refreshToken = await JWT.sign(payload, privateKey, {
                // algorithm: "RS256",
                expiresIn: "7 days"
            })

            JWT.verify(accessToken, publicKey, (err, decode) => {
                if (err) {
                    console.log("error verify::", err);
                } else {
                    console.log("decode verify::", decode);
                }
            })
            return { accessToken, refreshToken }
        } catch (error) {

        }
    }

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADERS.CLIENT_ID]
    if (!userId) throw new AuthFailureError("Invalid Resquest")

    // 2
    const keyStore = await findByUserId(userId)
    if (!userId) throw new NotFoundError("Not found keyStore")

    //3
    const accessToken = req.headers[HEADERS.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError("Invalid Resquest")

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError("Invalid userId")
        req.keyStore = keyStore
        req.user = decodeUser
        return next();

    } catch (error) {
        throw error
    }

})

const authenticationV2 = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADERS.CLIENT_ID]
    if (!userId) throw new AuthFailureError("Invalid Resquest")

    // 2
    const keyStore = await findByUserId(userId)
    if (!userId) throw new NotFoundError("Not found keyStore")

    if (req.headers[HEADERS.REFRESHTOKEN]) {
        try {
            const refreshToken = req.headers[HEADERS.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) throw new AuthFailureError("Invalid userId")
            req.keyStore = keyStore
            req.user = decodeUser
            return next();
        } catch (error) {
            throw error
        }
    }
    //3
    const accessToken = req.headers[HEADERS.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError("Invalid Resquest")

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError("Invalid userId")
        req.keyStore = keyStore
        req.user = decodeUser
        return next();

    } catch (error) {
        throw error
    }

})

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT
}