# Info

topic	REQUIRED	string	topic1	Target topic name
message	-	string	Some message	Message body; set to triggered if empty or not passed
title	-	string	Some title	Message title
tags	-	string array	["tag1","tag2"]	List of tags that may or not map to emojis
priority	-	int (one of: 1, 2, 3, 4, or 5)	4	Message priority with 1=min, 3=default and 5=max
actions	-	JSON array	(see action buttons)	Custom user action buttons for notifications
click	-	URL	https://example.com	Website opened when notification is clicked
attach	-	URL	https://example.com/file.jpg	URL of an attachment, see attach via URL
markdown	-	bool	true	Set to true if the message is Markdown-formatted
icon	-	string	https://example.com/icon.png	URL to use as notification icon
filename	-	string	file.jpg	File name of the attachment
delay	-	string	30min, 9am	Timestamp or duration for delayed delivery
email	-	e-mail address	phil@example.com	E-mail address for e-mail notifications
call	-	phone number or 'yes'	+1222334444 or yes	Phone number to use for voice call


Priority
Max priority	min priority	5	max/urgent	Really long vibration bursts, default notification sound with a pop-over notification.
High priority	min priority	4	high	Long vibration burst, default notification sound with a pop-over notification.
Default priority	(none)	3	default	Short default vibration and sound. Default notification behavior.
Low priority	min priority	2	low	No vibration or sound. Notification will not visibly show up until notification drawer is pulled down.
Min priority	min priority	1	min	No vibration or sound. The notification will be under the fold in "Other notifications".


Actions:

action	REQUIRED	string	-	view	Action type (must be view)
label	REQUIRED	string	-	Turn on light	Label of the action button in the notification
clear	-️	boolean	false	true	Clear notification after action button is tapped

view: Opens a website or app when the action button is tapped

app urls are also supported
http:// or https:// will open your browser (or an app if it registered for a URL)
mailto: links will open your mail app, e.g. mailto:phil@example.com
geo: links will open Google Maps, e.g. geo:0,0?q=1600+Amphitheatre+Parkway,+Mountain+View,+CA
ntfy:// links will open ntfy (see ntfy:// links), e.g. ntfy://ntfy.sh/stats
twitter:// links will open Twitter, e.g. twitter://user?screen_name=..

http: Sends HTTP POST/GET/PUT request when the action button is tapped

method	-️	GET/POST/PUT/...	POST ⚠️	GET	HTTP method to use for request, default is POST ⚠️
headers	-️	map of strings	-	see above	HTTP headers to pass in request. When publishing as JSON, headers are passed as a map. When the simple format is used, use headers.<header1>=<value>.
body	-️	string	empty	some body, somebody?	HTTP body

broadcast: Sends an Android broadcast intent when the action button is tapped (only supported on Android)

Broadcast action has these additional params
intent	-️	string	io.heckel.ntfy.USER_ACTION	com.example.AN_INTENT	Android intent name, default is io.heckel.ntfy.USER_ACTION
extras	-️	map of strings	-	see above	Android intent extras. Currently, only string extras are supported. When publishing as JSON, extras are passed as a map. When the simple format is used, use extras.<param>=<value>.

actions: [
    {
        action: "view",
        label: "Open portal",
        url: "https://home.nest.com/",
        clear: true
    },
    {
        action: "http",
        label: "Turn down",
        url: "https://api.nest.com/",
        body: "{\"temperature\": 65}",
        clear: false
    },
    {
        action: "broadcast",
        label: "Take picture",
        extras: {
            "cmd": "pic",
            "camera": "front"
        },
        clear: false
    }
]


