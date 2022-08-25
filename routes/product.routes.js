const express = require('express');
const multer = require('multer');

const authMidl = require('../middleware/auth.middleware');

const Products = require('../models/Products');
const Order = require('../models/Order');

const router = express.Router({ mergeParams: true });

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, 'uploads/create');
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

//Добавление картинки
router.post('/upload', upload.single('image'), (req, res) => {
	res.json({
		url: `/uploads/create/${req.file.originalname}`,
	});
});
// /PRODUCT
router.get('/', async (req, res) => {
	const { searchValue, caregoryValue, sortedValue } = req.query;

	try {
		if (searchValue) {
			const list = await Products.find({
				name: { $regex: new RegExp(searchValue, 'i') },
			});
			return res.status(200).send(list);
		}

		if (caregoryValue) {
			const list = await Products.find({
				type: { $regex: caregoryValue },
			});
			return res.status(200).send(list);
		}

		if (sortedValue === 'price') {
			const list = await Products.find().sort({ price: 1 });
			return res.status(200).send(list);
		}
		if (sortedValue === 'name') {
			const list = await Products.find().sort({ name: 1 });
			return res.status(200).send(list);
		}
		if (sortedValue === 'rate') {
			const list = await Products.find().sort({ rate: -1 });
			return res.status(200).send(list);
		}

		const list = await Products.find({});
		return res.status(200).send(list);
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка',
		});
	}
});

//product/:id
router.get('/:id', authMidl, async (req, res) => {
	try {
		const productId = req.params.id;
		Products.findById(productId, (err, doc) => {
			if (err) {
				console.log(err);
			}

			if (!doc) {
				return res.status(404).json({
					message: 'Товар не найден!',
				});
			}

			res.json(doc);
		});
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка',
		});
	}
});

router.delete('/:id', (req, res) => {
	const productId = req.params.id;

	Products.findByIdAndDelete(
		{
			_id: productId,
		},
		(err, doc) => {
			if (err) {
				console.log(err);
				return res.status(500).json({
					message: 'Не удалось удалить товар',
				});
			}
			if (!doc) {
				return res.status(500).json({
					message: 'Товар не найден',
				});
			}

			return res.json({
				success: true,
			});
		}
	);
});

router.post('/create', authMidl, async (req, res) => {
	try {
		const doc = new Products({
			user: req.user._id,
			// userId: req.user._id,
			imageUrl: req.body.imageUrl,
			type: req.body.type,
			name: req.body.name,
			price: req.body.price,
		});

		const postItem = await doc.save();
		res.json(postItem);
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Не удалось создать товар',
		});
	}
});

module.exports = router;
