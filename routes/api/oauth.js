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
let timestamp = '';
let recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};  // used to store names; default = inactive
let channelId = '';  // this will be used for the running the survey in the appropriate channel
let accessToken = '';  // not to be cleared out
let refreshToken = '';  // not to be cleared out
// let channelMembers = [];
let pollRequestor = '';
let username = '';

const oauthAccessUrl	= 'https://slack.com/api/oauth.access';
const getConvMembersUrl	= 'https://slack.com/api/conversations.members';
const postEphemeralUrl	= 'https://slack.com/api/chat.postEphemeral';
const postMessageUrl = 'https://slack.com/api/chat.postMessage';
const updateUrl = 'https://slack.com/api/chat.update';

router.get('/slack/authorization', (req, res) => {
  // console.log('****** hit')
  // console.log('******',req.query)
  // console.log('******',req.query.code)

	/***** TODO: update with different token *****/
    const slackClientId = '?client_id=' + slackTokenPath.slackClientId; 
    const slackClientSecret = '&client_secret=' + slackTokenPath.slackClientSecret;    
	/*****************************************************/
	const slackCode = '&code=' + req.query.code;  
  
  const postOauthAccess = {
    url: oauthAccessUrl+slackClientId+slackClientSecret+slackCode,
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
    // console.log('############### response.body:', response.body)
    // console.log('############### accessTokenJSON:', accessTokenJSON)
    // console.log('############### access token:', accessTokenJSON.access_token)
    // console.log('############### refresh token:', accessTokenJSON.refresh_token)
    // console.log('############### expires in (seconds):', accessTokenJSON.expires_in)
    accessToken = accessTokenJSON.access_token;
    refreshToken = accessTokenJSON.refresh_token;
    countdown(tokenExpireTime)
    
    res.status(200).redirect('/api/oauth/success');

    return;
  });

})

router.get('/success', (req, res) => {
  res.status(200).json({
    msg: "authentication success!"
  })
})

// countdown to refresh access token 
function countdown(seconds){
  let milliseconds = seconds * 1000;
  setTimeout(refreshAccessToken, milliseconds);
  // console.log('***** milliseconds should be 3600000:', milliseconds);
};

function refreshAccessToken(){
	/***** TODO: update with different token *****/
    const slackClientId = '?client_id=' + slackTokenPath.slackClientId; 
    const slackClientSecret = '&client_secret=' + slackTokenPath.slackClientSecret;    
	/*****************************************************/
  const slackGrantType = '&grant_type=refresh_token';

  const postOauthRefreshAccess = {
    url: oauthAccessUrl+slackClientId+slackClientSecret+slackGrantType+refreshToken,
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
    // console.log('############### response.body:', response.body)
    // console.log('############### accessTokenJSON:', accessTokenJSON)
    // console.log('############### access token:', accessTokenJSON.access_token)
    // console.log('############### refresh token:', accessTokenJSON.refresh_token)
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
	// console.log('**** req.body', req.body);
	// console.log('**** requestType', requestType);
	
	// reset variables
	if(requestType.text === 'reset'){  
		channelId = requestType.channel_id;
    console.log('**** channel id', channelId);
    pollRequestor = requestType.user_id;
    console.log('**** pollRequestor id', pollRequestor);
    let jsonObj = JSON.parse(requestType)
    username = jsonObj.user_name; 
    console.log('**** user_name', user_name);

		fist = 0;
		oneFinger = 0;
		twoFingers = 0;
		threeFingers = 0;
		fourFingers = 0;
		fiveFingers = 0;
    recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};
    // channelMembers = [];
    timestamp = '';

		// console.log('**** resetting variables ****');
		// console.log('**** fist', fist);
		// console.log('**** oneFinger', oneFinger);
		// console.log('**** twoFingers', twoFingers);
		// console.log('**** threeFingers', threeFingers);
		// console.log('**** fourFingers', fourFingers);
		// console.log('**** fiveFingers', fiveFingers);
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

		// send survey out
		res.status(200).send(
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
  
  // let msgSent = false;
  // TODO: async await on this. first grab people, then send out survey.
  
  new Promise((resolve, reject) => {
    console.log('******* this should hit 1st');
    
    const getConvMembers = {
      method: 'GET',
      url: getConvMembersUrl,
      qs: { 
        channel: `${channelId}`, 
        pretty: '1' 
      },
      headers: { 
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    }
    
    request(getConvMembers, function (error, response, body) {
      let parsedJSON = {};
      
      // if (error) throw new Error(error);
      console.log('############## error', error);
      // console.log('############## postSurvey', getConvMembers)
      // console.log('############## response', response)
      // console.log('############## body', body)
      // console.log('############## body parse', JSON.parse(body))
      parsedJSON = JSON.parse(body);
      // console.log('############## parsedJSON.member', parsedJSON.members)
      let channelMembers = parsedJSON.members;
      // console.log('############## channel members', channelMembers)
      
      // grab everyone's name but the person invoking the survey
      let filteredMembers = channelMembers.filter(a => a !== pollRequestor);  // `a` is arbitrary
      // channelMembers.splice(memberIndex,1)
      // console.log('############## updated channelMembers', channelMembers)
      
      // return;
      resolve(filteredMembers);
      if (error)  {
        reject(console.log(error));
      };
    })
  })
  
  .then((filteredMembers) => {
    console.log('******* this should hit 2nd');
    console.log('############## 2nd filteredMembers',filteredMembers);
    
    const qTextPortion = JSON.stringify(surveyQ.text[0]);
    const qAttachmentPortion = JSON.stringify(surveyQ.attachments[0]);  // w/o `JSON.stringify`, error of `[object object]`
    
    let promises = [];
    let msgSent = false;
    
    // loop through users
    for (let person of filteredMembers){
      promises.push(new Promise((resolve, reject) => {

        // TODO: use promise.all
        const postSurvey = {  // TODO: update `user`
          method: 'POST',
          url: postEphemeralUrl,
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: `{  
            "channel": "${channelId}",
            "user": "${person}",
            "text": ${qTextPortion},
            "attachments": [${qAttachmentPortion}]
          }`
        }

        request(postSurvey, function (error, response, body) {
          
          if (error) throw new Error(error);
          console.log('############## error', error);
          // console.log('############## postSurvey', postSurvey)
          // console.log('############## response', response)
          // console.log('############## body', body)
          let postSurveyRes = JSON.parse(body);
          msgSent = postSurveyRes.ok;
          console.log('############## msgSent', msgSent)

          resolve();
          if (error)  {
            reject(console.log(error));
          };
        })
      }))
    }
    return Promise.all(promises)
    .then(() => {
      console.log('******* this should hit 3rd');
      console.log('############## 3rd msgSent',msgSent);

      // send requestor a confirmation msg that the survey went out
      if (msgSent){
        const confirmMsg = {  
          method: 'POST',
          url: postEphemeralUrl,
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: `{  
            "channel": "${channelId}",
            "user": "${pollRequestor}",
            "attachments": [
              {
                "fallback": "Message just confirming that polls have been sent to the class.",
                "color": "#36a64f",
                "title": "Bombs away! Fist-to-Five poll has been delivered to the channel.",
                "text": "Hey ${username} don't go anywhere as you'll start seeing results posted here.",
                "thumb_url": "https://i.imgur.com/isO0sQQ.jpg"
              }
            ]
          }`
        }

        request(confirmMsg, function (error, response, body) {
          
          if (error) throw new Error(error);
          console.log('############## error', error);
          console.log('############## confirmMsg', confirmMsg)
          // console.log('############## response', response)
          console.log('############## body', body)
          
          return;
        })
      } else {  // NOTE: if msgSent = false 
        const confirmMsg = {  
          method: 'POST',
          url: postEphemeralUrl,
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: `{  
            "channel": "${channelId}",
            "user": "${pollRequestor}",
            "attachments": [
              {
                "fallback": "Uh-oh something went wrong with your request. Try resetting.",
                "color": "#ff0000",
                "text": "Zoinks! \nSomething doesn't look right. \nTry resetting again. \n${singleFoodEmoji}"
              }
            ]
          }`
        }

        request(confirmMsg, function (error, response, body) {
          
          if (error) throw new Error(error);
          console.log('############## error', error);
          console.log('############## confirmMsg', confirmMsg)
          // console.log('############## response', response)
          console.log('############## body', body)
          
          return;
        })
      }
    })


  })

  // .then((msgSent) => {
  //   console.log('******* this should hit 3rd');
  //   console.log('############## 3rd msgSent',msgSent);

  //   // send requestor a confirmation msg that the survey went out
  //   if (msgSent){
  //     const confirmMsg = {  
  //       method: 'POST',
  //       url: postEphemeralUrl,
  //       headers: {
  //         Authorization: 'Bearer ' + accessToken,
  //         'Content-Type': 'application/json; charset=utf-8'
  //       },
  //       body: `{  
  //         "channel": "${channelId}",
  //         "user": "${pollRequestor}",
  //         "text": "Bombs away!",
  //       }`
  //     }

  //     request(confirmMsg, function (error, response, body) {
        
  //       if (error) throw new Error(error);
  //       console.log('############## error', error);
  //       console.log('############## confirmMsg', confirmMsg)
  //       // console.log('############## response', response)
  //       console.log('############## body', body)
        
  //       return;
  //     })
  //   }
  // })
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

	const resultsTextPortion = '*Fist-to-Five Survey*';
	const resultsTextPortionUpdate = '*Fist-to-Five Survey Updated*';
	const resultsAttachmentsPortion = `[{"pretext": "Results...", "text": "fist: ${fist} \n one: ${oneFinger} \n two: ${twoFingers} \n three: ${threeFingers} \n four: ${fourFingers} \n five: ${fiveFingers}"}]`;

	if(timestamp){
    /***** update response *****/
    const postSurveyResultsUpdate = {  // TODO: update `user`
      method: 'POST',
      url: updateUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: `{  
        "channel": "${channelId}",
        "ts": "${timestamp}",
        "text": "${resultsTextPortionUpdate}",
        "attachments": ${resultsAttachmentsPortion}
      }`
    }

    request(postSurveyResultsUpdate, function (error, response, body) {
      
      if (error) throw new Error(error);
      console.log('############## error', error);
      // console.log('############## postSurveyResultsUpdate', postSurveyResultsUpdate)
      // console.log('############## response', response)
      // console.log('############## body', body)
      // let surveyResultsRes = JSON.parse(body)
      // console.log('############## body.message_ts', surveyResultsRes.message_ts)
      // timestamp = surveyResultsRes.message_ts;
      // console.log('############## timestamp', timestamp)

      return;
    });
	} else {
    /***** initial POST *****/
    const postSurveyResults = {  
      method: 'POST',
      url: postMessageUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: `{  
        "channel": "${channelId}",
        "text": "${resultsTextPortion}",
        "attachments": ${resultsAttachmentsPortion}
      }`
    }

    request(postSurveyResults, function (error, response, body) {
      
      if (error) throw new Error(error);
      console.log('############## error', error);
      // console.log('############## postSurveyResults', postSurveyResults)
      // console.log('############## response', response)
      // console.log('############## body', body)
      let surveyResultsRes = JSON.parse(body)
      // console.log('############## body.message_ts', surveyResultsRes.message_ts)
      timestamp = surveyResultsRes.ts;
      // console.log('############## timestamp', timestamp)

      return;
    })
	}
}
/****************************************/

module.exports = router;

// https://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
// https://github.com/vuejs/vuex/issues/455
