const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const fetch = require('node-fetch');

const names = require('./names.js');
const numOfPics = 20;
const timeBetweenFetches = 1000;

const imageURLs = [
    'https://thispersondoesnotexist.com/image',
    'https://thiscatdoesnotexist.com/',
    'https://thishorsedoesnotexist.com/',
    'https://thisartworkdoesnotexist.com/',
];

const lengthSort = (a, b) => {
    if (a.length > b.length) return -1;
    if (a.length < b.length) return 1;
    return 0;
};

const titleLengthSort = (a, b) => {
    if (a.title.length > b.title.length) return -1;
    if (a.title.length < b.title.length) return 1;
    return 0;
};

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

class Game {
    constructor(code, type) {
        this.code = code;
        this.type = type;
        this.imgPath = `/people/${code}${Date.now()}/`;
        this.localImgPath = `./public${this.imgPath}`;
        fs.mkdirSync(this.localImgPath); //create directory for images
        this.players = [null, null];
        this.started = false;
    }

    get connected() {
        return this.players.filter(p => p != null);
    }

    emit() {
        let args = Array.from(arguments).map(a => JSON.stringify(a)).join(',');
        this.connected.forEach(socket => eval(`socket.emit(${args})`));
    }

    opponent(socket) {
        return this.players[Number(!Boolean(socket.place))];
    }

    join(socket) {
        socket.place = this.players[1] == null ? (this.players[0] == null ? 0 : 1) : 0;
        this.players[socket.place] = socket;
        socket.game = this;

        if (!this.started) {
            if (socket.place == 0) {
                socket.emit('wait', this.code);
            } else
                this.start();
        } else
            socket.emit('start', this.gameInfo(socket.place));
    }

    leave(socket) {
        this.players[socket.place] = null;
    }

    gameInfo(place) {
        return {
            place,
            names: this.names,
            imgPath: this.imgPath,
            myImage: this.playerImages[place],
            flipped: this.flipped,
            code: this.code,
        };
    }

    async start() {
        this.emit('loading', 0, null, null);
        this.started = true;

        //generate names
        this.names = shuffleArray(names).slice(0, numOfPics);

        //get images
        for (let i = 0; i < numOfPics; i++) {
            const streamPipeline = promisify(pipeline);
            let response = await fetch(imageURLs[this.type]);
            if (!response.ok) {
                this.emit('loading', 'ERROR', null, null);
                return;
            };
            await streamPipeline(response.body, fs.createWriteStream(`${this.localImgPath}${i}.jpg`)); //save image
            this.emit('loading', i+1, `${this.imgPath}${i}.jpg`, this.names[i]);
            await new Promise(res => setTimeout(res, timeBetweenFetches));
        }

        this.playerImages = [0,0].map(e=>Math.floor(Math.random() * numOfPics)); //select a random article for each player
        this.flipped = [0,0].map(e=>Array(numOfPics).fill(false));

        //tell clients
        for (let socket of this.connected) {
            socket.emit('start', this.gameInfo(socket.place));
        }
    }
};

module.exports = Game;