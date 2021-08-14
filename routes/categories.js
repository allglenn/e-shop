const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})
router.get(`/:id`, async (req, res) => {
    let category = await Category.findById(req.params.id).then(category => {
        res.status(200).send(category);
    }).catch(err => {
        res.status(404).json({success: false, err: err})
    });
})

router.post(`/`, async (req, res) => {
    let category = new Category(
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
            image: req.body.image
        }
    );

    category.save().then((
        createdCategory => {
            res.status(201).json(createdCategory);
        })).catch((error) => {
        res.status(500).json({
            error: error,
            success: false
        })
    })
})

router.put(`/:id`, async (req, res) => {

    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        image: req.body.image
    }).then(category => {
        res.status(200).json(category)
    }).catch(err => {
        res.status(200).json({success: false, err: err})

    })
})

router.delete(`/:id`, async (req, res) => {
    Category.findOneAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json(
                {
                    success: true,
                    message: "category..."
                }
            );
        } else {
            return res.status(204).json({
                    success: false,
                    message: "category..."
                }
            );
        }
    })
})

module.exports = router;