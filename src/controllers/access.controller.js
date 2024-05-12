"use strict"

const { CREATED, SuccessResponse } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {
    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Get token success",
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
        // }).send(res)

        // v2 fixed , no need refreshToken
        new SuccessResponse({
            message: "Get token success",
            metadata: await AccessService.handlerRefreshToken({
                refreshToken: req.refreshToken,
                user:req,user,
                keyStore:req.keyStore
            })
        }).send(res)
    }

    logout = async (req, res, next) => {
        console.log(req.keyStore);
        new SuccessResponse({
            message: "Logout success",
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        new CREATED({
            message: "Registered ok",
            metadata: await AccessService.signUp(req.body),
            option: { limit: 10 }
        }).send(res)
    }
}

module.exports = new AccessController()