const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find();

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.post(`/`, async (req, res) => {

    const orderItems = Promise.all(req.body.orderItems.map( async (orderItem) => {
        let  newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;

    }))

    const orderItemsIdsResolved = await orderItems;
    let totalPrice = 0;
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
module.exports = router;