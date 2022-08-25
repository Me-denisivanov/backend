const { Schema, model } = require('mongoose');

const schema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		avatarUrl: String,
		buy: {
			type: Array,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = model('User', schema);
