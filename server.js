//The server entry point
const {app} = require('./server/serverMain.js');
const port = process.env.PORT || 3000;;

app.listen(port, () => console.log(`listening on port: `+ port) );
