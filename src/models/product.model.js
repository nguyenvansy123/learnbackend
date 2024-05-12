'use strict'

const { lowerCase } = require('lodash');
const { Schema, model } = require('mongoose'); // Erase if already required
const slugify = require("slugify")
const DOCUMENT_NAME = "Product"
const COLLECTION_NAME = "Products"

// Declare the Schema of the Mongo model
var productSchema = new Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_thumb: {
        type: String,
        required: true,
    },
    product_description: String,
    product_slug: String,
    product_price: {
        type: Number,
        required: true,
    },
    product_quantity: {
        type: Number,
        require: true
    },
    product_type: {
        type: String,
        require: true,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        require: true
    }

},
    {
        collection: COLLECTION_NAME,
        timestamps: true
    });



productSchema.pre("save", function (next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next();
})

productSchema.index({ product_name: "text", product_description: "text" })

// define the product type = clothing

const clothingSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    }
}, {
    collection: "clothes",
    timestamps: true
})

// define the product type = electronic
const electronicSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    }
}, {
    collection: "electronics",
    timestamps: true
})

// define the product type = electronic
const furnitureSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop"
    }
}, {
    collection: "furniture",
    timestamps: true
})

//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronic", electronicSchema),
    clothing: model("Clothing", clothingSchema),
    furniture: model("Furniture", furnitureSchema),
}