const fs = require('fs');
const E = require('events');

const actions = {
    1: 'Set',
    2: 'Get',
    3: 'Delete'
};
class Store {
    constructor(filename = './Main.xyz') {
        this.file = filename;
        if(!fs.existsSync(this.file)) fs.writeFileSync(this.file, JSON.stringify({}));
        this.storage = this.parse(fs.readFileSync(this.file));
        this.queue = [];
        this.listener = new E();
        setInterval(() => {
            if(this.queue.length) this.cycle()
        }, 5);
    }
    read(name = this.file) {
        this.opened = this.parse(fs.readFileSync(this.file));
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
        if(!this.storage[key]) { 
            this.queue.push({ action: 2, key }); 
            var x;
            this.listener.on(key, val => x = val);
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
    cycle() {
        const { action, key, value } = this.queue.shift();
        switch(actions[action]) {
            case 'Set': {
                try { fs.writeFileSync(this.file, JSON.stringify(this.storage)); }
                catch(e) { console.log(e); }
                break;
            }
            case 'Get': {
                this.listener.emit(key, this.read()[key]);
            }
            case 'Delete': {
                try { fs.writeFileSync(this.file, JSON.stringify(this.storage)); }
                catch(e) { console.log(e); }
                break;
            }
        }
    }
}

module.exports = { Store };