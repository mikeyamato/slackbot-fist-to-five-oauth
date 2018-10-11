const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const appshopOauth = require('./routes/api/appshop_oauth');
const tonkotsuOauth = require('./routes/api/tonkotsu_oauth');
const uclaOauth = require('./routes/api/ucla_oauth');

// Initialize an Express application
const app = express();

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use('/api/appshop_oauth', appshopOauth)
app.use('/api/tonkotsu_oauth', tonkotsuOauth)
app.use('/api/ucla_oauth', uclaOauth)

// server static assets if in production
if(process.env.NODE_ENV === 'production'){

	app.get('/', (req, res) => {
		res.sendFile(path.resolve(__dirname,'client', 'index.html'));  // for any route that hits load `index.html`
	})
}

// Start the express application
const port = process.env.PORT || 5000;
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});