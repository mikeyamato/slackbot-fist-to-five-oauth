const SlackStrategy = require('@aoberoi/passport-slack').default.Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const mongoose = require('mongoose');
// const User = mongoose.model('users');
const keys = require('./keys');



const opts = {}  // options
opts.clientID = keys.tokenSlackClientId;
opts.clientSecret = keys.tokenSlackClientSecret;
opts.skipUserProfile = true;

module.exports = passport => {
	// passport.serializeUser((user, done) => {
	// 	done(null, user);
	// });
	// passport.deserializeUser((id, done) => {
	// 	User.findById(id, (err, user) => {
	// 		done(err, user);
	// 	});
	// });

	// Initialize Add to Slack (OAuth) helpers
	passport.use(
		new SlackStrategy(opts, (accessToken, scopes, team, extra, profiles, done) => {
			botAuthorizations[team.id] = extra.bot.accessToken;
			done(null, {});
		})
	);
};
