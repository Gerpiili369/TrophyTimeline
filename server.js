const exp = require('express'), app = exp();
app.use('/', exp.static(__dirname));
require('http').Server(app).listen(80, '127.0.0.1', () => console.log(`listening...`));
