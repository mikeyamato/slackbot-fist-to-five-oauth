// const SlackStrategy = require('@aoberoi/passport-slack').default.Strategy;
const SlackStrategy = require('passport-slack').Strategy;
// const mongoose = require('mongoose');
// const User = mongoose.model('users');
const keys = require('./keys');



const opts = {}  // options
opts.clientID = keys.slackClientId;
opts.clientSecret = keys.slackClientSecret;
opts.skipUserProfile = true; // default = false
opts.callbackURL = 'https://slackbot-fist-to-five.herokuapp.com/api/oauth/auth/slack/callback';  // slack terminology = redirect_uri
opts.scope = ['chat:write', 'identity.basic', 'incoming-webhook']
// console.log(opts)

module.exports = passport => {
	
	passport.use(new SlackStrategy(
		opts
	,
	(accessToken, refreshToken, profile, done) => {
		// optionally persist user data into a database
		// unsure if this is needed yet
		done(null, profile);
		console.log(profile)
	}
	));
	
	
	passport.serializeUser((user, done) => {
		done(null, user);
		// console.log(user)
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	// // Initialize Add to Slack (OAuth) helpers
	// passport.use(
	// 	new SlackStrategy(opts, (accessToken, scopes, team, extra, profiles, done) => {
	// 		botAuthorizations[team.id] = extra.bot.accessToken;
	// 		done(null, {});
	// 	})
	// );
};