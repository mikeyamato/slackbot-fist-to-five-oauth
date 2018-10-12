// NOTE: this file uses 'user' tokens. More info can be found here:
// https://api.slack.com/docs/token-types

const express = require('express');
const request = require('request');
const router = express.Router();

const surveyQ = require('../../templates/surveyQ');
const surveyA = require('../../templates/surveyA');
const foodEmoji = require('../../assets/foodEmoji');

const slackTokenPath = require('../../config/keys_prod');

let fist = 0;  // used to tabulate poll responses
let oneFinger = 0;  // used to tabulate poll responses
let twoFingers = 0;  // used to tabulate poll responses
let threeFingers = 0;  // used to tabulate poll responses
let fourFingers = 0;  // used to tabulate poll responses
let fiveFingers = 0;  // used to tabulate poll responses
let timestamp = '';  // used to send message updates to the same post
let recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};  // used to store names; default = inactive
let channelId = '';  // used to run the poll in the appropriate channel
let accessToken = slackTokenPath.uclaSlackAccessToken;  // TODO: update based on workspace
let channelMembers = [];  // all channel members
let filteredMembers = [];  // all channel member less the person invoking the poll
let pollRequestor = '';  // person invoking the poll
let username = '';  // temporarily holds the username of the person invoking the poll
let singleFoodEmoji = '';  // temporarily holds a random food emoji

const getConvMembersUrl	= 'https://slack.com/api/conversations.members';
const postEphemeralUrl	= 'https://slack.com/api/chat.postEphemeral';
const postMessageUrl = 'https://slack.com/api/chat.postMessage';
const updateUrl = 'https://slack.com/api/chat.update';


// resetting variables and posting poll
router.post('/', (req, res) => {
	singleFoodEmoji = foodEmoji[Math.floor(Math.random() * foodEmoji.length)];
	// console.log('**** req.body', req.body);
	const requestType = req.body || null;
	
	// resetting variables
	if(requestType.text === 'reset'){  
    
    fist = 0;
    oneFinger = 0;
    twoFingers = 0;
    threeFingers = 0;
    fourFingers = 0;
    fiveFingers = 0;
    recordSurvey = {"fist": [],"one_finger": [],"two_fingers": [],"three_fingers": [],"four_fingers": [],"five_fingers": []};
    timestamp = '';
    channelId = '';  
    pollRequestor = '';  
    username = '';  
    channelMembers = [];
    filteredMembers = [];
    singleFoodEmoji = '';

    // grab information about the poll requestor
		channelId = requestType.channel_id;
    pollRequestor = requestType.user_id;
    username = requestType.user_name; 
    console.log('**** channel id', channelId);
    console.log('**** pollRequestor id', pollRequestor);
    console.log('**** user_name', username);

		res.status(200).send(
			{
				"text": "All reset.\n Now run `/fist-to-five` to start the poll. \n :thumbsup_all:",
			}
		)
		return null;
	}

	// posting poll
	if(requestType.command === '/fist-to-five' && requestType.text === ''){     

    res.status(200).send(
			surveyToClass()  // send poll out
		)
	} else {
		res.status(200).send(
			{
				"text": `Zoinks! \nSomething doesn't look right. \nPlease try again. \n${singleFoodEmoji}`
			}
		)
	}
})

// posting survey form on slack
router.post('/survey', (req, res) => {

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

// function to send out poll to channel
function surveyToClass() {

  new Promise((resolve, reject) => {
    // console.log('******* this should hit 1st');
    
    // grab the id of everyone within a channel the poll is to be placed
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
    
    request(getConvMembers, (error, response, body) => {
      let parsedJSON = {};
      
      // console.log('############## error', error);
      console.log('############## body', body)
      parsedJSON = JSON.parse(body);
      channelMembers = parsedJSON.members;

      // grab everyone's name but the person invoking the survey
      filteredMembers = channelMembers.filter(a => a !== pollRequestor);  // `a` is arbitrary
      
      resolve(filteredMembers);
      if (error)  {
        reject(console.log(error));
      };
    })
  })
  
  .then((filteredMembers) => {
    // console.log('******* this should hit 2nd');
    
    // grabs the questions from `surveyQ.js`
    const qTextPortion = JSON.stringify(surveyQ.text[0]);
    const qAttachmentPortion = JSON.stringify(surveyQ.attachments[0]);  // w/o `JSON.stringify`, error of `[object object]`
    
    let promises = [];  // holds all promises created during the loop
    let msgSent = false;
    
    // loop through `filteredMembers` and send out the poll
    for (let person of filteredMembers){
      promises.push(new Promise((resolve, reject) => {

        const postSurvey = {  
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

        request(postSurvey, (error, response, body) => {
          
          if (error) throw new Error(error);
          // console.log('############## error', error);
          console.log('############## body', body)
          let postSurveyRes = JSON.parse(body);
          msgSent = postSurveyRes.ok;

          resolve();
          if (error)  {
            reject(console.log(error));
          };
        })
      }))
    }
    return Promise.all(promises)  // executes the promise once the loop is completed
    .then(() => {
      // console.log('******* this should hit 3rd');

      // send poll requestor a confirmation msg that the survey went out
      // NOTE: to update `thumb_url` reference  https://api.slack.com/docs/message-attachments#thumb_url
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
                "title": "Bombs away! :bomb: The Fist-to-Five poll has been delivered to the channel.",
                "text": "Hey _${username}_, be sure to stick around as results will be posted to the channel shortly.",
                "thumb_url": "https://i.imgur.com/BVgT3aS.png"
              }
            ]
          }`
        }

        request(confirmMsg, (error, response, body) => {
          
          if (error) throw new Error(error);
          // console.log('############## error', error);
          console.log('############## body', body)
          
          return;
        })
      } else {  // if msgSent = false 
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

        request(confirmMsg, (error, response, body) => {
          
          if (error) throw new Error(error);
          // console.log('############## error', error);
          console.log('############## body', body)
          
          return;
        })
      }
    })


  })
}

// function to send out poll results to channel
function postSurvey(){

  // NOTE: use of custom emojis. if not installed, they will not display properly. 
  // refer to '../../assets/'.
	const resultsAttachmentsPortion = `[{
    "pretext": "*Fist-to-Five Survey Results...*", 
    "color": "#704a6c",
    "fields": [
      {
        "value":":fist-zero: Fist: ${fist}"
      },
      {
        "value":":fist-one: One: ${oneFinger}"
      },
      {
        "value":":fist-two: Two: ${twoFingers}"
      },
      {
        "value":":fist-three: Three: ${threeFingers}"
      },
      {
        "value":":fist-four: Four: ${fourFingers}"
      },
      {
        "value":":fist-five: Five: ${fiveFingers}"
      }
    ]
  }]`;

  /***** update POST of poll results *****/
	if(timestamp){
    const postSurveyResultsUpdate = { 
      method: 'POST',
      url: updateUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: `{  
        "as_user": "false",
        "username": "Not a Bot",
        "icon_emoji": "${singleFoodEmoji}",
        "channel": "${channelId}",
        "ts": "${timestamp}",
        "attachments": ${resultsAttachmentsPortion}
      }`
    }

    request(postSurveyResultsUpdate, (error, response, body) => {
      
      if (error) throw new Error(error);
      console.log('############## updated results body', body)

      return;
    });
  } 
  /***** initial POST of poll results *****/
  else {
    const postSurveyResults = {  
      method: 'POST',
      url: postMessageUrl,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: `{  
        "as_user": "false",
        "username": "Not a Bot",
        "icon_emoji": "${singleFoodEmoji}",
        "channel": "${channelId}",
        "attachments": ${resultsAttachmentsPortion}
      }`
    }

    request(postSurveyResults, (error, response, body) => {
      
      if (error) throw new Error(error);
      console.log('############## results body', body) 
      let surveyResultsRes = JSON.parse(body)
      // `timestamp` allows the same message be updated and not create new posts
      // everytime there is an update.
      timestamp = surveyResultsRes.ts; 

      return;
    })
	}
}

module.exports = router;

// https://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
// https://github.com/vuejs/vuex/issues/455
// https://api.slack.com/docs/messages/builder
