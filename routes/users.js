const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
router.get(`/`, async (req, res) => {
    const userList = await User.find().select("-passwordHash");

    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})


router.get(`/:id`, async (req, res) => {
    let user = await User.findById(req.params.id).select("-passwordHash").then(user => {
        res.status(200).send(user);
    }).catch(err => {
        res.status(404).json({success: false, err: err})
    });
})

router.post(`/`, async (req, res) => {
    let user = new User(
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        }
    );

    user.save().then((
        createdUser => {
            res.status(201).json(createdUser);
        })).catch((error) => {
        res.status(500).json({
            error: error,
            success: false
        })
    })
})

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({"email": req.body.email});

    if (!user) {
        res.status(404).json({success: false, message: "no user find for this email"})
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id
            }, process.env.JWT_SECRET,
            {expiresIn: "365d"}
        )
        res.status(200).json({email: user.email, token: token})
    } else {
        res.status(500).json({success: false, message: "user can not be authentificated"})
    }
    res.send(user);
})


module.exports = router;