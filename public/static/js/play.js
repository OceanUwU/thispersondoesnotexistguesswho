const socket = io('');

const rows = 4;
const columns = 5;

var articleShown = false;
var gameInfo = null;

switch (queryParams.intent) {
    case 'create':
        socket.emit('create', Number(queryParams.type));
        break;
        
    case 'join':
        socket.emit('join', queryParams.code);
        break;
        
    default:
        window.location.reload();
}

socket.on('wait', code => {
    $('#wait').removeClass('d-none');
    $('#roomCode').text(code);
});

$('#toLoad').text(rows * columns);
socket.on('loading', (state, image, name) => {
    $('#wait').addClass('d-none');
    $('#load').removeClass('d-none');
    $('#loading').text(state);
    
    $('#newlyGenerated')[`${image == null ? 'add' : 'remove'}Class`]('d-none');
    if (image != null)
        $('#newlyGenerated').attr('src', image);
    $('#newName')[`${name == null ? 'add' : 'remove'}Class`]('d-none');
    if (image != null)
        $('#newName').text(name);
});

socket.on('start', info => {
    gameInfo = info;

    $('#load').addClass('d-none');
    $('#game').removeClass('d-none');

    $('#code').text(gameInfo.code);

    toggleArticle();
    $('#myArticle').find('span').text(gameInfo.names[gameInfo.myImage]);

    for (let i = 0; i < rows; i++) {
        let row = $('<tr>');
        for (let j = 0; j < columns; j++) {
            let pos = columns * i + j;

            let cell = $('<td>');
            cell.attr('id', `own${pos}`);
            cell.click(() => socket.emit('flip', pos));
            let div = $('<div>');
            div.append($(`<img src="${gameInfo.imgPath}${pos}.jpg" title="<img src='${gameInfo.imgPath}${pos}.jpg'>">`));
            div.find('img').tooltip({ html: true, delay: {show: 1000} });
            div.append($(`<span>${gameInfo.names[pos]}</span>`));
            cell.append(div);
            row.append(cell);
        }
        $('#ownBoard').append(row);
    }

    for (let i = 0; i < rows; i++) {
        let row = $('<tr>');
        for (let j = 0; j < columns; j++) {
            let pos = columns * i + j;

            let cell = $('<td>');
            cell.attr('id', `opponent${pos}`);
            let div = $('<div>');
            div.append($(`<img src="${gameInfo.imgPath}${pos}.jpg" title="<img src='${gameInfo.imgPath}${pos}.jpg'>">`));
            div.find('img').tooltip({ html: true, delay: {show: 1000} });
            cell.append(div);
            row.append(cell);
        }
        $('#opponentBoard').append(row);
    }

    for (let flipped in gameInfo.flipped) {
        for (let pos in gameInfo.flipped[flipped]) {
            flip(flipped == gameInfo.place, pos, gameInfo.flipped[flipped][pos]);
        }
    }
});

socket.on('flip', (place, pos, flipped) => flip(place == gameInfo.place, pos, flipped));

socket.on('err', err => window.location.href = `/?err=${err}`);



function toggleArticle() {
    articleShown = !articleShown;
    $('#toggleArticle').find('img').attr('src', `/static/img/eye${articleShown ? '-slash' : ''}.svg`);
    $('#myArticle').css('background', articleShown ? '' : 'black')
}

function flip(mine, pos, flipped) {
    let cell = $(`#${mine ? 'own' : 'opponent'}${pos}`);
    cell.removeClass(flipped ? 'unflipped' : 'flipped');
    cell.addClass(flipped ? 'flipped' : 'unflipped');
}