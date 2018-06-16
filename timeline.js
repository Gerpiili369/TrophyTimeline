st = Date.now();
(() => {
    const object = {}, gameList = [], dateList = [];
    let canvas, context, trophyList;

    document.addEventListener('DOMContentLoaded', () => {
        canvas = {
            a: document.getElementById('canvas'),
            b: document.getElementById('block'),
            h: document.getElementById('hud')
        }
        context = {
            a: canvas.a.getContext('2d'),
            b: canvas.b.getContext('2d'),
            h: canvas.h.getContext('2d')
        }

        fetch('http://127.0.0.1:3004/shit')
            .then(result => result.json())
            .then(list => {
                for (year of list.trophyList) {
                    object[new Date(year.title).getFullYear()] = [];
                    for (trophyData of year.list) {
                        trophyList = [];
                        if (gameList.indexOf(trophyData.title) == -1) gameList.push(trophyData.title);
                        for (game of trophyData.list) trophyList.push(game.trophy);
                        object[new Date(year.title).getFullYear()].push({game: trophyData.title, list: trophyList});
                    }
                }
                drawTL(object, gameList, canvas, context);
            })
            .catch(err => console.log(err));
    });
}) ();

const msToH = n => Math.ceil(n / 3600000);

function drawTL(object, gList, canvas, c) {
    const start = msToH(new Date(new Date().getFullYear() + 1, 0)), gc = {}, boxes = [];
    let x, y = Object.keys(object).length * 50;

    canvas.a.height = y;
    canvas.b.height = y;
    canvas.h.height = y;

    for (i = 0, min = 100, colors = []; i < gList.length; i++) {
        colors = [0, 0, 0];
        while((colors[0] + colors[1] + colors[2]) < min) {
            for (color in colors) colors[color] = Math.floor(Math.random() * 256);
        }

        for (color in colors) colors[color] = colors[color].toString(16);
        hex = colors.join('');
        gc[gList[i]] = hex.length < 6 ? hex.length < 5 ? '00' : '0' + hex : hex;
    }
    for (year in object) {
        y -= 50;
        for (date of object[year]) {
            date.start = msToH(date.list[0].earned);
            date.end = msToH(date.list[date.list.length - 1].earned);
            date.extra = (start - msToH(new Date(new Date(date.list[0].earned).getFullYear() + 1, 0)));

            x = start - date.start - date.extra;
            width = date.start - date.end;

            if (width < 1 || width > 10000) width = 1;

            c.a.save();
            c.a.strokeStyle = '#'+ gc[date.game];
            c.a.strokeRect(x, y, width, 45);
            c.a.restore();

            boxes.push({x: x, y: y, w: width, h: 45, t: date.game});

            for (trophy of date.list) {
                x = start - msToH(trophy.earned) - date.extra;
                c.a.save();
                c.a.strokeStyle = '#'+ gc[date.game];
                c.a.strokeRect(x, y, 0, 40);
                c.a.restore();
                boxes.push({x: x, y: y, w: 1, h: 40, t: date.game, n: trophy.title});
            }
        }
    }

    for (i = 0; i < canvas.width; i += 24) {
        c.a.save();
        c.a.fillStyle = 'green';
        c.a.fillRect(i, 0, 1, 25);
        c.a.restore();
    }

    canvas.h.onmousemove = e => {
        c.b.clearRect(0, 0, canvas.b.width, canvas.b.height);
        const
            rect = canvas.h.getBoundingClientRect(),
            x = e.clientX - rect.left, y = e.clientY - rect.top;
        let i = 0, r, succ = false;

        while(r = boxes[i++]) {
            c.h.beginPath();
            c.h.rect(r.x, r.y, r.w, r.h);

            if (c.h.isPointInPath(x, y)) {
                succ = true;
                c.h.clearRect(0, 0, canvas.a.width, canvas.a.height)
                c.h.save();
        		c.h.textBaseline = 'alphabetic';
        		c.h.font = '12pt Serif';
        		c.h.fillText(r.t, x + 10, y + 35);
                r.n ? c.h.fillText(r.n, x + 10, y + 55) : '';
                c.h.restore();
            } else {
                c.b.save();
                c.b.fillStyle = '#'+ gc[r.t];
                c.b.fillRect(r.x, r.y, r.w, r.h);
                c.b.restore();
            }

        }
        if (!succ) c.h.clearRect(0, 0, canvas.a.width, canvas.a.height);
    }

    console.log('done', Date.now() - st);
}
