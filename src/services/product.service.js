'use strict'
const { BadRequestError } = require("../core/error.response")
const { product, clothing, electronic, furniture, } = require("../models/product.model")
const { fillAllDraftsForShop, publishProductByShop, fillAllPublishedForShop, searchProductsByUser } = require("../models/repositories/product.repo")

class ProductFactory {

    static productRegistry = {} //key-class

    static registerProductTyper(type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product ${type}`)

        return new productClass(payload).createProduct()
    }

    // put 
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({product_shop, product_id})
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({product_shop, product_id})
    }
    
    // end put

    // query
    static async fillAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await fillAllDraftsForShop(query, limit, skip)
    }

    static async fillAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await fillAllPublishedForShop(query, limit, skip)
    }

    static async searchProducts({keySearch}){
        return await searchProductsByUser({keySearch})
    }
}

class Product {
    constructor({ product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes }) {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // create new Product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }
}

// define sub-class for diffrent product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        console.log("---------1---------");
        if (!newClothing) throw new BadRequestError('create new clothing error')

        console.log("---------2---------");
        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('create new product error')

        console.log("---------3---------");
        return newProduct
    }
}

// define sub-class for diffrent product types electronics
class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('create new Electronics error')

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('create new product error')

        return newProduct
    }
}

// define sub-class for diffrent product types furniture
class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('create new Furniture error')

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('create new product error')

        return newProduct
    }
}

// register product tpypes
ProductFactory.registerProductTyper("Clothing", Clothing)
ProductFactory.registerProductTyper("Electronics", Electronics)
ProductFactory.registerProductTyper("Furniture", Furniture)

module.exports = ProductFactory