const fs = require('fs');
const E = require('events');

const read = filename => {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, (err, out) => {
			if (err) reject(err);
			resolve(out);
		});
	});
};

const write = (filename, contents) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(filename, contents, err => reject(err));
	});
};

const actions = {
	1: 'Set',
	2: 'Get',
	3: 'Delete'
};
class Store {
	constructor(filename = './Main.xyz') {
		this.file = filename;
		if (!fs.existsSync(this.file))
			fs.writeFileSync(this.file, JSON.stringify({}));
		this.storage = this.parse(fs.readFileSync(this.file));
		this.queue = [];
		this.listener = new E();
		setInterval(() => {
			if (this.queue.length) this.cycle();
		}, 5);
	}
	async read(name = this.file) {
		this.opened = this.parse(await read(this.file));
		return this.opened;
	}
	/**
	 * @param {*} File
	 * @returns {Object}
	 */
	parse(file) {
		return JSON.parse(file.toString());
	}
	debug() {
		console.log(this.storage);
	}
	/**
	 * @param {String} key
	 * @param {*} value
	 */
	set(key, value = '') {
		this.storage[key] = value;
		this.queue.push({ action: 1, key, value });
	}
	/**
	 * @param {String} key
	 */
	get(key) {
		if (!this.storage[key]) {
			this.queue.push({ action: 2, key });
			var x;
			this.listener.on(key, val => (x = val));
		}
		return this.storage[key] || x;
	}
	has(key) {
		return !!this.storage[key];
	}
	delete(key) {
		delete this.storage[key];
		this.queue.push({ action: 3, key });
	}
	add(key, value) {
		if (isNan(value)) return console.log('Trying to add a non-number');
		const initial = store.get(key);
		if (!initial) store.set(key, 0);
		if (isNan(initial))
			return console.log('Trying to add a number to a string');
		return store.set(key, initial + +value);
	}
	subtract(key, value) {
		if (isNan(value)) return console.log('Trying to add a non-number');
		const initial = store.get(key);
		if (!initial) store.set(key, 0);
		if (isNan(initial))
			return console.log('Trying to add a number to a string');
		return store.set(key, initial - +value);
	}
	async cycle() {
		const { action, key, value } = this.queue.shift();
		switch (actions[action]) {
			case 'Set': {
				try {
					await write(this.file, JSON.stringify(this.storage));
				} catch (e) {
					console.log(e);
				}
				break;
			}
			case 'Get': {
				this.listener.emit(key, (await this.read())[key]);
			}
			case 'Delete': {
				try {
					await write(this.file, JSON.stringify(this.storage));
				} catch (e) {
					console.log(e);
				}
				break;
			}
		}
	}
}

module.exports = { Store };
