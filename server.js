const path = require('path'), exp = require('express'), app = exp();
app.use('/', exp.static(path.join(__dirname, 'public')));
require('http').Server(app).listen(80, '127.0.0.1', () => console.log(`listening...`));
