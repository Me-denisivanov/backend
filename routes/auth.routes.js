const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const router = express.Router({ mergeParams: true });
const tokenService = require('../services/token.service');

router.post('/signUp', [
	check('email', 'Некорректный email').isEmail(),
	check('password', 'Минимальная длина пароля 5 символов').isLength({ min: 5 }),

	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				message: 'Ошибка валидации',
			});
		}

		try {
			const { email, password, fullName, avatarUrl } = req.body;

			const exitingUser = await User.findOne({ email });

			if (exitingUser) {
				return res.status(400).json({
					message: 'Email уже существует',
				});
			}

			const hashedPassword = await bcrypt.hash(password, 12);

			const newUser = await User.create({
				...req.body,
				fullName,
				avatarUrl,
				password: hashedPassword,
			});

			const tokens = tokenService.generate({ _id: newUser._id });
			await tokenService.save(newUser._id, tokens.refreshToken);

			res.status(201).send({ ...tokens, userId: newUser._id });
		} catch (e) {
			res.status(500).json({
				message: 'На сервере произошла ошибка',
			});
		}
	},
]);

router.post('/signInWithPassword', [
	check('email', 'Email некорректный').normalizeEmail().isEmail(),
	check('password', 'Пароль не может быть пустым').exists(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Ошибка валидации',
				});
			}

			const { email, password } = req.body;

			const existingUser = await User.findOne({ email });

			if (!existingUser) {
				return res.status(400).send({
					message: 'Email не был найден',
				});
			}

			const isPasswordEqual = await bcrypt.compare(
				password,
				existingUser.password
			);

			if (!isPasswordEqual) {
				return res.status(400).send({
					message: 'Пароль неверен',
				});
			}

			const tokens = tokenService.generate({ _id: existingUser._id });
			await tokenService.save(existingUser._id, tokens.refreshToken);

			res.status(200).send({ ...tokens, userId: existingUser._id });
		} catch (e) {
			res.status(500).json({
				message: 'На сервере произошла ошибка',
			});
		}
	},
]);

function isTokenInvalid(data, dbToken) {
	return !data || !dbToken || data._id !== dbToken?.user?.toString();
}

router.post('/token', async (req, res) => {
	try {
		const { refresh_token: refreshToken } = req.body;
		const data = tokenService.validateRefresh(refreshToken);
		const dbToken = await tokenService.findToken(refreshToken);

		if (isTokenInvalid(data, dbToken)) {
			return res.status(401).json({ message: 'Неавторизованный' });
		}

		const tokens = await tokenService.generate({
			_id: data._id,
		});
		await tokenService.save(data._id, tokens.refreshToken);

		res.status(200).send({ ...tokens, userId: data._id });
	} catch (e) {
		res.status(500).json({
			message: 'На сервере произошла ошибка',
		});
	}
});

module.exports = router;
