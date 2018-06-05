st = Date.now();
(() => {
    let canvas, context, gameList = [], dateList = [];

    document.addEventListener('DOMContentLoaded', () => {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');

        fetch('http://127.0.0.1:3004/shit')
            .then(result => result.json())
            .then(list => {
                list = list.trophyList
                for (trophyData of list) {
                    if (gameList.indexOf(trophyData.title) == -1) gameList.push(trophyData.title);
                    dateList.push({
                        game: trophyData.title,
                        start: Math.ceil(trophyData.list[0].trophy.earned / 1000 / 60 / 60 ),
                        end: Math.ceil(trophyData.list[trophyData.list.length - 1].trophy.earned / 1000 / 60 / 60 )
                    });
                }
                drawTL(dateList, gameList, canvas, context);
            });
    });
}) ();

function drawTL(list, gList, canvas, c) {
    let
        start = list[0].start,
        end = list[list.length - 1].end,
        cm = parseInt('ffffff', 16) / list.length,
        gc = {},
        x, y = 0;

    canvas.width = 24 * 365
    canvas.height = 7 * 50;
    //c.fillStyle = 'green';
    //c.fillRect(0, y, 24, 5);
    for (i = 0, min = 0; i < gList.length; i++) {
        gc[gList[i]] =
        Math.floor(Math.random() * (256 - min) + min).toString(16) +
        Math.floor(Math.random() * (256 - min) + min).toString(16) +
        Math.floor(Math.random() * (256 - min) + min).toString(16);//(Math.floor(i * cm)).toString(16)
    }
    console.log(gc);
    for (date of list) {
        x = start - date.start
        if (x > (24 * 365)) {
            start = date.start
            y += 50
        }
        //console.log(gc[date.game]);
        width = date.start - date.end
        if (width < 1 || width > 10000) width = 1;
        // console.log('wid', width);
        // console.log(x,y);
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
        //console.log(i);
        c.save();
        c.fillStyle = 'green';
        c.fillRect(i, 0, 1, 25);
        c.restore();
    }
    console.log('w: ', canvas.width);
    console.log('done', Date.now() - st);
}
