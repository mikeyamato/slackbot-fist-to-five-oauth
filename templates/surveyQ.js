// https://api.slack.com/docs/interactive-message-field-guide

module.exports.text = [
	"*What time is it? It's Fist-to-Five survey time! Yay!* :tada:"
]

module.exports.attachments = [
	{
		"title": "How well do you understand the material?",
		"text": "As always, responses are 100% anonymous.",
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
						"text": ":fist-zero: FIST  (Help, I'm lost)",
						"value": "fist"
					},
					{
						"text": ":fist-one: ONE  (I barely understand)",
						"value": "one_finger"
					},
					{
						"text": ":fist-two: TWO  (I'm starting to understand)",
						"value": "two_fingers"
					},
					{
						"text": ":fist-three: THREE  (I get it)",
						"value": "three_fingers"
					},
					{
						"text": ":fist-four: FOUR  (I'm comfortable with the idea)",
						"value": "four_fingers"
					},
					{
						"text": ":fist-five: FIVE  (I understand this 100%)",
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
]


