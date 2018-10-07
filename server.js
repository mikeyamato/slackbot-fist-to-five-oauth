// const slackEventsApi = require('@slack/events-api');
const passport = require('passport');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// const keys = require('./config/keys')
// const index = require('./routes/api');
const oauth = require('./routes/api/oauth');

// Initialize an Express application
const app = express();

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Plug the Add to Slack (OAuth) helpers into the express app
app.use(passport.initialize());

require('./config/passport')(passport);

// // *** Initialize event adapter using signing secret from environment variables ***
// const slackEvents = slackEventsApi.createEventAdapter(keys.slackSigningSecret, {
//   includeBody: true
// });

// *** Plug the event adapter into the express app as middleware ***
// ⚠️ As of v2.0.0, the Events API adapter parses raw request bodies while performing request signing verification. This means apps no longer need to use body-parser middleware to parse JSON-encoded requests. https://github.com/slackapi/node-slack-events-api
// app.use('/api/index', slackEvents.expressMiddleware(index));
app.use('/api/oauth', oauth)

// server static assets if in production
if(process.env.NODE_ENV === 'production'){
	// set static folder
	app.use(express.static('client/build'));  

	app.get('*', (req, res) => {
		res.sendFile('index.html');  // for any route that hits load `index.html`
	})
}

// Start the express application
const port = process.env.PORT || 5000;
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});