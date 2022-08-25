const { Schema, model } = require('mongoose');

const schema = new Schema(
	{
		name: {
			type: String,
		},
		count: {
			type: Number,
		},
		imageUrl: {
			type: String,
		},
		price: Number,
		orderId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('Order', schema);
