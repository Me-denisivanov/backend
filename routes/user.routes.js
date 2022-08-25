const express = require('express');
const multer = require('multer');

const User = require('../models/User');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth.middleware');
const { getCorrectCount } = require('../helpers/getCorrectCount');

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads/user');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

router.patch('/:userId', auth, async (req, res) => {
	try {
		const { userId } = req.params;

		if (userId === req.user._id) {
			const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
				new: true,
			});

			res.send(updatedUser);
		} else {
			res.status(401).json({ message: 'Неавторизованный' });
		}
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка',
		});
	}
});

router.post('/upload', auth, upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/user/${req.file.originalname}`,
	});
});

router.get('/', auth, async (req, res) => {
	try {
		const list = await User.findOne({ _id: req.user['_id'] });
		res.send(list);
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка',
		});
	}
});

router.post('/buy', auth, async (req, res) => {
	try {
		const orderArray = req.body;

		const { buy } = await User.findById(req.user['_id']);

		User.findOneAndUpdate(
			{
				_id: req.user['_id'],
			},
			{
				$set: {
					buy: getCorrectCount(orderArray, buy),
				},
			},
			{
				returnDocument: 'after',
			},
			(err, doc) => {
				if (err) {
					console.log(err);
					return res.status(500).json({
						message: 'Не удалось купить товары',
					});
				}
				if (!doc) {
					return res.status(500).json({
						message: 'Не удалось купить товары',
					});
				}
				res.json(doc.buy);
			}
		);

		// orderArray.map((item) => {
		// 	const doc = new Order({
		// 		imageUrl: item.imageUrl,
		// 		count: item.count,
		// 		name: item.name,
		// 		price: item.price,
		// 	});
		// 	doc.save();
		// });
		// return res.json();
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Не удалось купить товар',
		});
	}
});

module.exports = router;
