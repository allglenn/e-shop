const {Product} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const multer  = require('multer');
const md5 = require('md5');
const router = express.Router();
require('dotenv/config');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {

        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage });

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

router.post(`/`, uploadOptions.single("image"),async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    const fileName = req.file.originalname;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
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

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
        }
        const files = req.files
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            {new: true}
        )

        if (!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)


module.exports = router;