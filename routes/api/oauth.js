

// const passport = require('passport');
const express = require('express');
const request = require('request');
const router = express.Router();

const surveyQ = require('../../templates/surveyQ');
const surveyA = require('../../templates/surveyA');
const foodEmoji = require('../../assets/foodEmoji');

const slackTokenPath = require('../../config/keys_prod');

let fist = 0;
let oneFinger = 0;
let twoFingers = 0;
let threeFingers = 0;
let fourFingers = 0;
let fiveFingers = 0;
let timestamp = [];
let recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};
let channelId = '';  // this will be used for the running the survey in the appropriate channel
let accessToken = '';  // not to be cleared out
let refreshToken = '';  // not to be cleared out

// TODO: add GET request to grab member names https://api.slack.com/methods/conversations.members


// // passport
// router.get('/auth/slack', passport.authenticate('slack'));

// router.get('/auth/slack/callback',
//   passport.authenticate('slack', { session: false }),
//   (req, res) => 
//     console.log(res)
//   ,
//   (err, req, res, next) => {
//     res.status(500).send(console.log(`${err}`));
//   }
// );


router.get('/slack/authorization', (req, res) => {
  // console.log('****** hit')
  // console.log('******',req.query)
  // console.log('******',req.query.code)

  const oauthAccess	= 'https://slack.com/api/oauth.access';
	/***** TODO: update with different token *****/
    const slackClientId = '?client_id=' + slackTokenPath.slackClientId; 
    const slackClientSecret = '&client_secret=' + slackTokenPath.slackClientSecret;    
	/*****************************************************/
	const slackCode = '&code=' + req.query.code;  
  
  const postOauthAccess = {
    url: oauthAccess+slackClientId+slackClientSecret+slackCode,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }
  request(postOauthAccess, function (error, response) {
    const accessTokenJSON = JSON.parse(response.body)
    const tokenExpireTime = accessTokenJSON.expires_in
    // console.log('############### postOauthAccess', postOauthAccess);
    console.log('############### error:', error);
    console.log('############### response.body:', response.body)
    console.log('############### accessTokenJSON:', accessTokenJSON)
    console.log('############### access token:', accessTokenJSON.access_token)
    console.log('############### refresh token:', accessTokenJSON.refresh_token)
    console.log('############### expires in (seconds):', accessTokenJSON.expires_in)
    accessToken = accessTokenJSON.access_token;
    refreshToken = accessTokenJSON.refresh_token;
    countdown(tokenExpireTime)
    
    res.status(200).redirect('/success');

    return;
  });

})

router.get('/success', (req, res) => {
  res.json({
    msg: "authentication success!"
  })
})

// countdown to refresh access token 
function countdown(seconds){
  let milliseconds = seconds * 1000;
  setTimeout(refreshAccessToken, milliseconds);
  console.log('***** milliseconds should be 3600000:', milliseconds);
};

function refreshAccessToken(){
  const oauthAccess	= 'https://slack.com/api/oauth.access';
	/***** TODO: update with different token *****/
    const slackClientId = '?client_id=' + slackTokenPath.slackClientId; 
    const slackClientSecret = '&client_secret=' + slackTokenPath.slackClientSecret;    
	/*****************************************************/
  const slackGrantType = '&grant_type=refresh_token';

  const postOauthRefreshAccess = {
    url: oauthAccess+slackClientId+slackClientSecret+slackGrantType+refreshToken,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }

  request(postOauthRefreshAccess, function (error, response) {
    const accessTokenJSON = JSON.parse(response.body)
    const tokenExpireTime = accessTokenJSON.expires_in
    // console.log('############### postOauthRefreshAccess', postOauthRefreshAccess);
    console.log('############### error:', error);
    console.log('############### response.body:', response.body)
    console.log('############### accessTokenJSON:', accessTokenJSON)
    console.log('############### access token:', accessTokenJSON.access_token)
    console.log('############### refresh token:', accessTokenJSON.refresh_token)
    accessToken = accessTokenJSON.access_token;
    refreshToken = accessTokenJSON.refresh_token;
    console.log('############### refresh token:', accessTokenJSON.expires_in)
    countdown(tokenExpireTime)
    
    return;
  });
};



// post request
// posting survey form on slack
router.post('/', (req, res) => {
	const singleFoodEmoji = foodEmoji[Math.floor(Math.random() * foodEmoji.length)];
	const requestType = req.body || null;
	
	// console.log('**** 1', req)
	// console.log('**** 2', req.body);
	// console.log('**** 3', requestType);
	
	
	// reset variables
	if(requestType.text === 'reset'){  
		channelId = requestType.channel_id;
		console.log('**** channelId', channelId);

		fist = 0;
		oneFinger = 0;
		twoFingers = 0;
		threeFingers = 0;
		fourFingers = 0;
		fiveFingers = 0;
		timestamp = [];
    recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};

		// console.log('**** resetting variables ****');
		// console.log('**** fist', fist);
		// console.log('**** oneFinger', oneFinger);
		// console.log('**** twoFingers', twoFingers);
		// console.log('**** threeFingers', threeFingers);
		// console.log('**** fourFingers', fourFingers);
		// console.log('**** fiveFingers', fiveFingers);
		// console.log('**** timestamp', timestamp);
		// console.log('**** recordSurvey', recordSurvey);
		// console.log('**** channelId', channelId);
		// console.log('*****************************');

		res.status(200).send(
			{
				"text": "All reset.\n Now run `/fist-to-five` to start the poll. \n :thumbsup_all:",
			}
		)
		return null;
	}


	// hit this with initial slack command
	if(requestType.command === '/fist-oauth' && requestType.text === ''){     // TODO: update path to correct one

    console.log(surveyQ)

		// send survey out
		res.status(200).send(
      // surveyQ
			surveyToClass()
		)
	} else {
		res.status(200).send(
			{
				"text": `Zoinks! \nSomething doesn't look right. \nPlease try again. \n${singleFoodEmoji}`
			}
		)
	}
})
				
/************************************************/

function surveyToClass() {

	const postMessage	= 'https://slack.com/api/chat.postMessage';

	/***** choose one or update with different token *****/
	const slackTokenPortion = '?token=' + slackTokenPath.slackTokenBotTonkotsu;   
	// const slackTokenPortion = '?token=' + slackTokenPath.slackTokenBotUclaBootcamp;  
	/*****************************************************/
	
	const channelPortion = `&channel=${channelId}`;  
	const textPortion = '&text=What time is it? It\'s Fist-to-Five survey time! Yay! :tada:';
	const attachmentPortion = '&attachments='+encodeURIComponent(`[{
		"title": "How well do you understand this material? \n \n As always, responses are 100% anonymous.\n",
		"callback_id": "fist_results",
		"attachment_type": "default",
		"color": "#FF9DBB",
		"actions": [
			{
				"name": "fist_select",
				"text": "Select one...",
				"type": "select",
				"options": [
					{
						"text": "Fist  (Help, I'm lost)",
						"value": "fist"
					},
					{
						"text": "1  (I barely understand)",
						"value": "one_finger"
					},
					{
						"text": "2  (I'm starting to understand)",
						"value": "two_fingers"
					},
					{
						"text": "3  (I somewhat get it)",
						"value": "three_fingers"
					},
					{
						"text": "4  (I'm comfortable with the idea)",
						"value": "four_fingers"
					},
					{
						"text": "5  (I understand this 100%)",
						"value": "five_fingers"
					},
				],
				"confirm": {
					"title": "Are you sure?",
					"text": "Just confirming your selection. :nerd_face:",
					"ok_text": "Yes, I'm sure",
					"dismiss_text": "No, I'm not sure"
				}
			}
		]
	}]`);
	const prettyPortion = '&pretty=1';  // no documentation availble about what this does

	const postSurvey = {
		url: postMessage+channelPortion,
		method: 'POST',
    Authorization: 'Bearer ' + accessToken,
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      "text": "What time is it? It's Fist-to-Five survey time! Yay! :tada:",
      "attachments": [
        {
          "callback_id": "fist_results",
          "title": "How well do you understand this material? \n \n As always, responses are 100% anonymous.\n",
          "attachment_type": "default",
          "color": "FF9DBB",
          "actions": [
            {
              "name": "fist_select",
              "text": "Select one...",
              "type": "select",
              "options": [
                {
                    "text": "Fist  (Help, I'm lost)",
                    "value": "fist"
                },
                {
                    "text": "1  (I barely understand)",
                    "value": "one_finger"
                },
                {
                    "text": "2  (I'm starting to understand)",
                    "value": "two_fingers"
                },
                {
                    "text": "3  (I somewhat get it)",
                    "value": "three_fingers"
                },
                {
                    "text": "4  (I'm comfortable with the idea)",
                    "value": "four_fingers"
                },
                {
                    "text": "5  (I understand this 100%)",
                    "value": "five_fingers"
                }
              ],
              "confirm": {
                "text": "Just confirming your selection. :nerd_face:",
                "title": "Are you sure?",
                "ok_text": "Yes, I'm sure",
                "dismiss_text": "No, I'm not sure"
              }
            }
          ]
        }
      ]
    })
	}

	request(postSurvey, function (error, response) {
		
		console.log('##############initial# error', error);
    console.log('############## postSurvey', postSurvey)
    console.log('############## response', response)
		
		return;
	});
}



/************************************************/
							


// posting survey form on slack
router.post('/survey', (req, res) => {
	const singleFoodEmoji = foodEmoji[Math.floor(Math.random() * foodEmoji.length)];
	const survey = JSON.parse(req.body.payload);
	const handGesture = survey.actions[0].selected_options[0].value;

	// hit this after selecting answer
	switch (handGesture) {
		case 'fist':

			/***** uncomment if you do want to know who *****/
			// recordSurvey["fist"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			)
			fist += 1;
			postSurvey();
			break;
		case 'one_finger':
		
			/***** uncomment if you do want to know who *****/
			// recordSurvey["one_finger"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			);
			oneFinger += 1;
			postSurvey()
			break;
		case 'two_fingers':
			
			/***** uncomment if you do want to know who *****/
			// recordSurvey["two_fingers"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			);
			twoFingers += 1;
			postSurvey()
			break;
		case 'three_fingers':
			
			/***** uncomment if you do want to know who *****/
			// recordSurvey["three_fingers"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			);
			threeFingers += 1;
			postSurvey()
			break;
		case 'four_fingers':
			
			/***** uncomment if you do want to know who *****/
			// recordSurvey["four_fingers"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			);
			fourFingers += 1;
			postSurvey()
			break;
		case 'five_fingers':

			/***** uncomment if you do want to know who *****/
			// recordSurvey["five_fingers"].push(survey.user.name);
			// console.log('*** recordSurvey ***', recordSurvey);
			/************************************************/

			res.status(200).send(
				surveyA
			);
			fiveFingers += 1;
			postSurvey()
			break;
    default:
			res.status(200).send(
				{
					"text": `Zoinks! \nSomething doesn't look right. \nPlease try again. \n${singleFoodEmoji}`
				}
			)
	} 
})

/****************************************/
/***** POST survey results to Slack *****/
/****************************************/
function postSurvey(){
	const postMessage	= 'https://slack.com/api/chat.postMessage';
	const updateMessage = 'https://slack.com/api/chat.update';

	/***** choose one or update with different token *****/
		const slackTokenPortion = '?token=' + slackTokenPath.slackTokenBotTonkotsu;   
		// const slackTokenPortion = '?token=' + slackTokenPath.slackTokenBotUclaBootcamp;  
	/*****************************************************/
	
	const channelPortion = `&channel=${channelId}`;  
	const textPortion = '&text=*Fist-to-Five Survey*';
	const textPortionUpdate = '&text=*Fist-to-Five Survey Updated*';
	const attachmentsPortion = '&attachments='+encodeURIComponent(`[{"pretext": "Results...", "text": "fist: ${fist} \n one: ${oneFinger} \n two: ${twoFingers} \n three: ${threeFingers} \n four: ${fourFingers} \n five: ${fiveFingers}"}]`);
	const tsPortion = '&ts=' + timestamp[0];
	const prettyPortion = '&pretty=1';  // no documentation availble about what this does

	if(timestamp.length){
		/***** update POST *****/
		const postUpdatedSurveyResults = {
			url: updateMessage+slackTokenPortion+channelPortion+textPortionUpdate+attachmentsPortion+tsPortion+prettyPortion,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			}
		}
		request(postUpdatedSurveyResults, function (error, response) {
			// console.log('############### response', response);
			// console.log('##############update# response.body', response.body);
			console.log('##############update# postUpdatedSurveyResults', postUpdatedSurveyResults);
			console.log('##############update# error', error);
			
			return;
		});
	} else {
		/***** initial POST *****/
		const postSurveyResults = {
			url: postMessage+slackTokenPortion+channelPortion+textPortion+attachmentsPortion+prettyPortion,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			}
		}
		request(postSurveyResults, function (error, response) {
			const postSurveyResultsJSON = JSON.parse(response.body);
			// console.log('############### response', response);
			// console.log('##############initial# response.body', response.body);
			// console.log('##############initial# response.body.ts', postSurveyResultsJSON.ts);
			// console.log('##############initial# response.body.ts', response.body.messages.ts);
			console.log('##############initial# postSurveyResults', postSurveyResults);
			console.log('##############initial# error', error);
			
			timestamp.push(postSurveyResultsJSON.ts)
			// console.log('##############initial# timestamp', timestamp);
			
			return;
		});
	}
}
/****************************************/

module.exports = router;

// https://api.slack.com/custom-integrations/legacy-tokens

// https://api.slack.com/methods/chat.postEphemeral
// https://api.slack.com/methods/chat.postMessage

// https://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express

