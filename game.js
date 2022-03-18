const fetch = require('node-fetch');
const numOfArticles = 20;

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
    constructor(code) {
        this.code = code;
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
            articles: this.articles,
            article: this.playerArticles[place],
            flipped: this.flipped,
            code: this.code,
        };
    }

    async start() {
        this.emit('loading');
        this.started = true;

        //get articles
        this.articles = await fetch('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=info&grnlimit=200');
        this.articles = Object.values((await this.articles.json()).query.pages);
        this.articles.sort(titleLengthSort);
        this.articles = this.articles.slice(80); //remove the 80 articles with the longest titles
        this.articles.sort(lengthSort);
        this.articles = this.articles.slice(0, numOfArticles);
        this.articles = this.articles.map(a => ({id: a.pageid, title: a.title}));
        shuffleArray(this.articles);
        this.playerArticles = [0,0].map(e=>Math.floor(Math.random() * this.articles.length)); //select a random article for each player
        this.flipped = [0,0].map(e=>Array(this.articles.length).fill(false));

        //tell clients
        for (let socket of this.connected) {
            socket.emit('start', this.gameInfo(socket.place));
        }
    }
};

module.exports = Game;