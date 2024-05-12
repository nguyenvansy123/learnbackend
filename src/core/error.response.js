'use strict'

const reasonPhrases = require("../utils/reasonPhrases")
const statusCodes = require("../utils/statusCodes")

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409
}

const ReasonStatusCode = {
    FORBIDDEN: "Bad request error",
    CONFLICT: 'Conflict error',
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statuscode = StatusCode.FORBIDDEN) {
        super(message, statuscode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statuscode = StatusCode.FORBIDDEN) {
        super(message, statuscode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = reasonPhrases.UNAUTHORIZED, statuscode = statusCodes.UNAUTHORIZED) {
        super(message, statuscode)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = reasonPhrases.NOT_FOUND, statuscode = statusCodes.NOT_FOUND) {
        super(message, statuscode)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = reasonPhrases.FORBIDDEN, statuscode = statusCodes.FORBIDDEN) {
        super(message, statuscode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
}