const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/:id`, async (req, res) => {

    const order = await Order.findById(req.params.id).populate('user', ['name', 'email', 'city'])
        .populate({
            path: "orderItems",
            populate: 'product'
        });

    if (!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
})


router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', ['name', 'email'])
        .populate({
            path: "orderItems",
            populate: 'product'
        })
        .sort({
            "dateOrdered": -1
        });

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.post(`/`, async (req, res) => {

    const orderItems = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;

    }))

    const orderItemsIdsResolved = await orderItems;
    let totalPrice = 0;
    let totalPrices = Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        let currentOrderItem = await OrderItem.findById(orderItemId).populate("product", "price");
        return currentOrderItem.product.price * currentOrderItem.quantity;
    }))

    let totalPricesResolved = await totalPrices;
    totalPrice = totalPricesResolved.reduce((a, b) => a + b, 0);


    let order = new Order(
        {
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        }
    );

    order.save().then((
        createdOrder => {
            res.status(201).json(createdOrder);
        })).catch((error) => {
        res.status(500).json({
            error: error,
            success: false
        })
    })
})


router.put(`/:id`, async (req, res) => {

    const order = await Order.findByIdAndUpdate(req.params.id, {status: req.body.status}).then(category => {
        res.status(200).json(order)
    }).catch(err => {
        res.status(200).json({success: false, err: err})

    })
})
module.exports = router;