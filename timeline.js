st = Date.now();
(() => {
    let canvas, context, gameList = [], dateList = [], trophyList;

    document.addEventListener('DOMContentLoaded', () => {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        fetch('http://127.0.0.1:3004/shit')
            .then(result => result.json())
            .then(list => {
                list = list.trophyList
                for (trophyData of list) {
                    trophyList = [];
                    if (gameList.indexOf(trophyData.title) == -1) gameList.push(trophyData.title);
                    for (game of trophyData.list) trophyList.push(game.trophy.earned);
                    dateList.push({game: trophyData.title, list: trophyList});
                }
                drawTL(dateList, gameList, canvas, context);
            });
    });
}) ();

const msToH = n => Math.ceil(n / 3600000);

function drawTL(list, gList, canvas, c) {
    let
        start = msToH(new Date(new Date().getFullYear() + 1, 0).getTime()),//list[0].start,
        gc = {}, x, y = 0, extra;

    canvas.width = 24 * 365;
    canvas.height = 7 * 50;

    for (i = 0, min = 100, colors = []; i < gList.length; i++) {
        colors = [0, 0, 0];
        while((colors[0] + colors[1] + colors[2]) < min) {
            for (color in colors) colors[color] = Math.floor(Math.random() * 256);
        }

        for (color in colors) colors[color] = colors[color].toString(16);
        hex = colors.join('');
        gc[gList[i]] = hex.length < 6 ? hex.length < 5 ? '00' : '0' + hex : hex;
    }

    for (date of list) {
        let extra;
        date.start = msToH(date.list[0]);
        date.end = msToH(date.list[date.list.length - 1]);

        x = start - date.start;
        width = date.start - date.end;
        if (x + width > (24 * 365)) {
            extra = (x + width) - (24 * 365)
            c.save();
            c.fillStyle = '#'+ gc[date.game];
            c.fillRect(x,y, width - extra, 45);
            c.restore();

            if (width - extra > 5) {
        		c.save();
        		c.textBaseline = 'alphabetic';
        		c.font = '10pt Serif';
        		c.fillText(
                    date.game.indexOf(':') != -1 ?
                    date.game.substring(0, date.game.indexOf(':')) :
                    date.game,
                    x + 10, y + 35
                );
        		c.restore();
            }
            start -= 24 * 365 //date.start
            y += 50
            x = 0
            width = extra;
        }

        if (width < 1 || width > 10000) width = 1;
        
        c.save();
        c.fillStyle = '#'+ gc[date.game];
        c.fillRect(x,y, width, 45);
        c.restore();

        if (width > 5) {
    		c.save();
    		c.textBaseline = 'alphabetic';
    		c.font = '10pt Serif';
    		c.fillText(
                date.game.indexOf(':') != -1 ?
                date.game.substring(0, date.game.indexOf(':')) :
                date.game,
                x + 10, y + 35
            );
    		c.restore();
        }
    }

    for (i = 0; i < canvas.width; i += 24) {
        c.save();
        c.fillStyle = 'green';
        c.fillRect(i, 0, 1, 25);
        c.restore();
    }
    console.log('done', Date.now() - st);
}
