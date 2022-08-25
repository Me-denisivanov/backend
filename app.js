const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
const initDatabase = require('./startUp/initDatabase');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));
app.use(cors());

app.use('/api', routes);

// const PORT = config.get('port') ?? 6050;

if (process.env.NODE_ENV === 'production') {
	app.use('/', express.static(path.join(__dirname, 'client')));

	const indexPath = path.join(__dirname, 'client', 'index.html');

	app.get('*', (req, res) => {
		res.sendFile(indexPath);
	});
}

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log('OK'))
	.catch((err) => console.log(err));

async function start() {
	try {
		mongoose.connection.once('open', () => {
			initDatabase();
		});

		// console.log('MongoDB success');

		app.listen(process.env.PORT || 6050, () => {
			console.log(`Server started on port ${process.env.PORT || 6050}...`);
		});
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
}
start();
