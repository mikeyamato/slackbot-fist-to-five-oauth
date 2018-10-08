// https://api.slack.com/docs/interactive-message-field-guide

module.exports.text = [
	"What time is it? It's Fist-to-Five survey time! Yay! :tada:"
]

module.exports.attachments = [
	{
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
	}
// "response_type": "in_channel"  // goes to everyone. comment out if it should only go to the person evoking it
]


