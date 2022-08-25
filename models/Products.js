const { Schema, model, Mongoose } = require('mongoose');

const schema = new Schema(
	{
		type: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
		},
		price: {
			type: Number,
			required: true,
		},
		rate: {
			type: Number,
		},
		count: {
			type: Number,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('Products', schema);
