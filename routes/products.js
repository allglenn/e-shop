const {Product} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
require('dotenv/config');

router.get(`/`, async (req, res) => {
    let filter ={};
    if(req.query.categories){
        filter ={
            category : req.query.categories.split(",")
        }
    }
    const productList = await Product.find(filter);

    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
        res.status(500).json({success: false})
    }
    res.send(product);
})
router.delete(`/:id`, async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);

    if (!product) {
        res.status(500).json({success: false})
    }
    res.status(204).json({message: "product deleted", success: true});
})

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product)
        return res.status(500).send('The product cannot be created');
    res.send(product);
})
router.put(`/:id`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    let productUpdated = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    )
    if (!productUpdated)
        return res.status(500).send('The product cannot be modified');
    res.send(productUpdated);
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    res.status(200).json({
        count: productCount
    });
})

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? +req.params.count : 0
    const productFeaturedList = await Product.find({isFeatured: true}).limit(count);
    if (!productFeaturedList) {
        res.status(500).json({success: false})
    }
    res.send(productFeaturedList);
})
module.exports = router;