function getCorrectCount(orderArray, purchased) {
	const hash = {};
	orderArray.forEach((item) => {
		hash[item._id] = item;
	});
	purchased.forEach((item) => {
		hash[item._id] = item;
	});
	purchased.forEach((item) => {
		orderArray.filter((itemFil) => {
			if (hash[item._id] && item._id === itemFil._id) {
				hash[item._id].count += itemFil.count;
			}
		});
	});
	return Object.values(hash);
}

module.exports = {
	getCorrectCount,
};
