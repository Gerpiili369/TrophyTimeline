(() => document.addEventListener('DOMContentLoaded', () => {
    const
        canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d'),
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
    canvas.onmousemove = e => drawTL(...upData, e);
    canvas.addEventListener('click', e => drawTL(...upData, e, true), false);

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
        const object = {}, games = {}, dateList = [];
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
                            games[trophyData.title] = null;
                            for (game of trophyData.list) trophyList.push(game.trophy);
                            object[new Date(year.title).getFullYear()].push({game: trophyData.title, list: trophyList});
                        }
                    }
                    for (const game in games) {
                        const min = 100, colors = [0, 0, 0];

                        while((colors[0] + colors[1] + colors[2]) < min) {
                            for (color in colors) colors[color] = Math.floor(Math.random() * 256);
                        }

                        for (color in colors) colors[color] = colors[color].toString(16);
                        const hex = colors.join('');
                        games[game] = hex.length < 6 ? hex.length < 5 ? '00' : '0' + hex : hex;
                    }
                    upData = [object, games, canvas, context, elements];
                    drawTL(...upData, );
                    resolve(data.username);
                }
            })
            .catch(err => reject(err));
    });
}

function drawTL(object, games, canvas, c, elements, e, click = false) {
    const start = msToH(new Date(new Date().getFullYear() + 1, 0));
    let x, y = Object.keys(object).length * 50, zoom, ctos, text = '';

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

    canvas.height = y;
    canvas.width = 8760 * zoom;

    c.clearRect(0, 0, canvas.width, canvas.height);

    c.textBaseline = 'alphabetic';
    c.font = '12pt Serif';

    for (year in object) {
        y -= 50;
        object[year].reverse();
        for (gs of object[year]) {
            gs.start = msToH(gs.list[0].earned);
            gs.end = msToH(gs.list[gs.list.length - 1].earned);
            gs.extra = (start - msToH(new Date(new Date(gs.list[0].earned).getFullYear() + 1, 0)));

            x = (start - gs.start - gs.extra) * zoom;
            width = (gs.start - gs.end) * zoom;

            if (width < 1 || width > 100000) width = 1 * zoom;

            if (e) {
                const rect = canvas.getBoundingClientRect(),
                    mx = e.clientX - rect.left, my = e.clientY - rect.top;

                c.beginPath();
                c.rect(x, y, width, 45);
                if (c.isPointInPath(mx, my)) {
                    box(c, x, y, games[gs.game], width, true);

                    ctos = 35;
                    c.fillText(gs.game, mx + 10, my + ctos);

                    for (trophy of gs.list) {
                        x = (start - msToH(trophy.earned) - gs.extra) * zoom;

                        box(c, x, y, games[gs.game]);

                        c.beginPath();
                        c.rect(x, y, 1, 40);
                        if (c.isPointInPath(mx, my)) {
                            ctos += 20;
                            c.fillText(trophy.title, mx + 10, my + ctos);
                        }

                        text += trophy.title + '\n';
                    }
                    if (click) status(elements, gs.game, text);
                } else box(c, x, y, games[gs.game], width);
            } else box(c, x, y, games[gs.game], width);
        }
    }

    document.body.style.cursor = ctos ? 'help' : 'auto';

    for (i = 0; i < canvas.width; i += 24 * zoom) box(c, i);
}

function box(c, x, y, color, width, empty) {
    c.save();
    if (color) {
        c.strokeStyle = '#' + color;
        c.fillStyle = '#' + color;
        if (width) {
            if (empty) c.strokeRect(x, y, width, 45);
            else c.fillRect(x, y, width, 45);
        } else c.strokeRect(x, y, 0, 40);
    } else {
        c.fillStyle = 'green';
        c.fillRect(x, 0, 1, 25);
    }
    c.restore();
}
