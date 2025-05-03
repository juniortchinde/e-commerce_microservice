const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,  required: true, ref: 'users'},

    productList: {
        type: [Object],
        required: true
    },

    destination: {
        type: {
            _id: false,
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },
    },

    amount: {type: Number, required: true},
    state: {
        type:String,
        enum: ['waiting_payment', 'paid', 'shipping', 'delivered', 'payment_failed1'],
        default: 'waiting_payment',
        required: true},
},
    {
        timestamps: true
    }
)


module.exports = mongoose.model('orders', orderSchema)