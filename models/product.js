const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    richDescription: {
        type: String,
        default: ""
    },
    image: {
        type: String
    }
    , images: [
        {
            type: String
        }
    ],
    brand: {
        type: String
    },
    price: {
        type: Number,
        min: 0,
        max: 100
    }, countInStock: {
        type: Number,
    },
    rating: {
        type: Number,
    },
    isFeatured: {
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
});

productSchema.virtual("id").get(() => {
    return this._id.toHexString();
});

productSchema.set("toJson", {
    virtual: true
});
exports.Product = mongoose.model('Product', productSchema);
