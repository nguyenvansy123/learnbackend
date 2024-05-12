'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "00001",
    EDITOR: "00002",
    ADMIN: "00000"
}

class AccessService {


    static handlerRefreshToken = async (refreshToken) => {
        // kiểm tra xem token này đã được sử dụng chưa 
        const fondToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        console.log("------1---------");
        // nếu có
        if (fondToken) {
            // decode xem là ai
            const { userId, email } = await verifyJWT(refreshToken, fondToken.privateKey)
            console.log({ userId, email });
            // xóa tất cả token trong key store
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError("Something wrong happend !! Pls relogin")
        }
        console.log("------2---------");
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('shop not registeted 1')
        console.log("------3---------", holderToken.privateKey);

        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log("[2]----", { userId, email });
        // check user
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('shop not registeted 2')

        // tao token moi
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user: { userId, email },
            tokens
        }
    }

    static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.inCludes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError("Something wrong happend !! Pls relogin")
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('shop not registeted')

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('shop not registeted')

        // tao token moi
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })
        return {
            user,
            tokens
        }
    }

    static logout = async (keyStore) => {

        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey });
        return delKey
    }

    static login = async ({ email, password, resfreshToken = null }) => {
        const foundShop = await findByEmail({ email })

        if (!foundShop) {
            throw new BadRequestError('shop not registered')
        }

        const match = bcrypt.compare(password, foundShop.password)
        if (!match) { throw new AuthFailureError('Authentication error') }

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const { _id: userId } = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId
        })

        return {
            metadata: {
                shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
                tokens
            }
        }
    }

    static signUp = async ({ name, email, password }) => {
        // try {
        // check email exists??
        const holdelShop = await shopModel.findOne({ email }).lean()

        if (holdelShop) {
            throw new BadRequestError("Error shop already registered!")
        }
        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({ name, email, password: passwordHash, roles: [RoleShop.SHOP] })

        if (newShop) {
            // created privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: "pkcs1",
            //         format: "pem"
            //     },
            //     privateKeyEncoding: {
            //         type: "pkcs1",
            //         format: "pem"
            //     }
            // })
            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");


            console.log({ privateKey, publicKey }, "----47-----");

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })
            console.log({ privateKey, publicKey }, "----53-----");

            if (!keyStore) {
                throw new BadRequestError("publicKeyString error")
                // return {
                //     code: "xxxx",
                //     message: "publicKeyString error"
                // }
            }

            //create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log("Create token success::", tokens);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
            // const tokens = await
        }
        return {
            code: 200,
            metadata: null
        }

    }


}


module.exports = AccessService