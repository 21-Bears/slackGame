//The server entry point
const {app} = require('./server/serverMain.js');
const port = app.port;

app.listen(port, () => console.log(`listening on port: ` + port) );
