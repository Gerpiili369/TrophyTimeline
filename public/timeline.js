(() => document.addEventListener('DOMContentLoaded', () => {
    const
        canvas = {
            a: document.getElementById('canvas'),
            b: document.getElementById('block'),
            h: document.getElementById('hud')
        },
        context = {
            a: canvas.a.getContext('2d'),
            b: canvas.b.getContext('2d'),
            h: canvas.h.getContext('2d')
        },
        elements = {
            title: document.getElementById('title'),
            text: document.getElementById('text'),
            // zoom: document.getElementsByName('zoom'),
            zoom: document.getElementById('zoom'),
            username: document.getElementById('username'),
            button: document.getElementById('submit')
        }

    let ready = true;

    search(canvas, context, elements);

    elements.zoom.onchange = () => drawTL(...upData);
    // for (zoom of elements.zoom) zoom.addEventListener('click', () => drawTL(...upData));

    elements.button.addEventListener('click', () => {
        if (ready) {
            ready = false;
            status(elements,
                'Hold up!',
                'Waiting for data to arrive...',
                'wait'
            );
            search(canvas, context, elements)
                .then(res => {
                    status(elements, res, 'Trophy timeline');
                    ready = true;
                })
                .catch(err => {
                    status(elements, err.name, err.message);
                    ready = true;
                });
        } else status(elements,
            'Not ready',
            'Waiting for the previous request to finish...',
            'not-allowed'
        );
    });
})) ();

const msToH = n => Math.ceil(n / 3600000);

function status(elements, title, text = '', cursor = 'auto') {
    elements.title.innerHTML = title;
    elements.text.innerText = text;
    document.body.style.cursor = cursor;
}

function search(canvas, context, elements) {
    return new Promise((resolve, reject) => {
        const object = {}, gameList = [], dateList = [];
        let trophyList;
        fetch(elements.username.value === '' ? 'demo.json' : `http://localhost:3004/api/trophies/${elements.username.value}?groupByGame=true&groupByDate=year`)
            .then(result => result.json())
            .then(data => {
                if (data.error) reject(data.error);
                else {
                    for (year of data.trophyList) {
                        object[new Date(year.title).getFullYear()] = [];
                        for (trophyData of year.list) {
                            trophyList = [];
                            if (gameList.indexOf(trophyData.title) == -1) gameList.push(trophyData.title);
                            for (game of trophyData.list) trophyList.push(game.trophy);
                            object[new Date(year.title).getFullYear()].push({game: trophyData.title, list: trophyList});
                        }
                    }
                    upData = [object, gameList, canvas, context, elements]
                    drawTL(...upData, );
                    resolve(data.username);
                }
            })
            .catch(err => reject(err));
    });
}

function drawTL(object, gList, canvas, c, elements) {
    const start = msToH(new Date(new Date().getFullYear() + 1, 0)), gc = {}, boxes = [];
    let x, y = Object.keys(object).length * 50, zoom;

    switch(elements.zoom.value) {
    // for (i of elements.zoom) if (i.checked) switch (i.value) {
        case '0': zoom = 0.1;     break;
        case '1': zoom = 0.25;    break;
        case '2': zoom = 0.5;     break;
        case '3': zoom = 1;       break;
        case '4': zoom = 2;       break;
        case '5': zoom = 3.5;     break;
        default: console.log(elements.zoom.value);
    }

    canvas.a.height = y;
    canvas.b.height = y;
    canvas.h.height = y;

    canvas.a.width = 8760 * zoom;
    canvas.b.width = 8760 * zoom;
    canvas.h.width = 8760 * zoom;

    c.a.clearRect(0, 0, canvas.b.width, canvas.b.height);
    c.b.clearRect(0, 0, canvas.b.width, canvas.b.height);
    c.h.clearRect(0, 0, canvas.b.width, canvas.b.height);

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

            x = (start - date.start - date.extra) * zoom;
            width = (date.start - date.end) * zoom;

            if (width < 1 || width > 100000) width = 1 * zoom;

            c.a.save();
            c.a.strokeStyle = '#'+ gc[date.game];
            c.a.strokeRect(x, y, width, 45);
            c.a.restore();

            c.b.save();
            c.b.fillStyle = '#'+ gc[date.game];
            c.b.fillRect(x, y, width, 45);
            c.b.restore();

            boxes.push({x: x, y: y, w: width, h: 45, t: date.game, d: date.list});

            for (trophy of date.list) {
                x = (start - msToH(trophy.earned) - date.extra) * zoom;
                c.a.save();
                c.a.strokeStyle = '#'+ gc[date.game];
                c.a.strokeRect(x, y, 0, 40);
                c.a.restore();
                boxes.push({x: x, y: y, w: 1, h: 40, t: date.game, n: trophy.title, d: date.list});
            }
        }
    }

    for (i = 0; i < canvas.a.width; i += 24 * zoom) {
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
                document.body.style.cursor = 'help';
            } else {
                c.b.save();
                c.b.fillStyle = '#'+ gc[r.t];
                c.b.fillRect(r.x, r.y, r.w, r.h);
                c.b.restore();
            }

        }
        if (!succ) {
            document.body.style.cursor = 'auto';
            c.h.clearRect(0, 0, canvas.a.width, canvas.a.height);
        }
    }

    canvas.h.addEventListener('click', e => {
        const rect = canvas.h.getBoundingClientRect();
        let i = 0, r, text = '';

        while(r = boxes[i++]) {
            c.h.beginPath();
            c.h.rect(r.x, r.y, r.w, r.h);

            if (c.h.isPointInPath(e.clientX - rect.left, y = e.clientY - rect.top)) {
                for (trophy of r.d) text += trophy.title + '\n';
                status(elements, r.t, text);
            }
        }
    }, false);
}
