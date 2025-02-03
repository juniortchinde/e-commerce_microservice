const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId,  required: true, ref: 'users'},
    productList: {type: [
        {
            _id: false,
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity : {type: Number, required: true},

        }], required: true},

    destination: {
        type: {
                _id: false,
                name: { type: String, required: true },
                phone: { type: String, required: true },
                address: { type: String, required: true },
            },
        required: true
    },
    amount: {type: Number, required: true},
    state: {type: String, required: true},
},
    {
        timestamps: true
    }
)


module.exports = mongoose.model('orders', orderSchema)