'use strict'

const { query } = require("express")
const { product, electronic, clothing, furniture } = require("../../models/product.model")
const { Types } = require("mongoose")

const fillAllDraftsForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const fillAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const searchProductsByUser = async ({ keySearch }) => {
    const regexearch = new RegExp(keySearch)
    const results = await product.find(
        { isPublished: true, $text: { $search: regexearch } },
        { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .lean()

    return results
}

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })

    if (!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublished = true
    const { modifiedCount } = await foundShop.update(foundShop)
    return modifiedCount
}

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })

    if (!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublished = false
    const { modifiedCount } = await foundShop.update(foundShop)
    return modifiedCount
}


const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query).
        populate('product_shop', 'name email -_id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

module.exports = {
    fillAllDraftsForShop,
    publishProductByShop,
    fillAllPublishedForShop,
    unPublishProductByShop,
    searchProductsByUser
}