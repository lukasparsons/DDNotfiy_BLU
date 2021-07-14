# DDNotify_BLU
This is a bluetooth variant of DDNotify that will send messages via bluetooth to a connect uart device when a message is received in a configured channel

This bot will connect to a peripheral device who's uuid information is set up in a config.json file.
Upon connection, the bot will send a UART serial text message with the value of "set{x}" to the peripheral.

This was originally developed so that I could use it to light up LEDs on a Adafruit CircuitPlayground Express Bluefruit whenever I receive a message from one of my players in their private channel during a D&D game. I would often miss messages because I was DMing, so I wanted to put something behind my screen that would give me a visual notification of when I received a message.

To view the code I wrote for CircuitPython on the CircuitPlayground Bluefruit, view this repository: https://github.com/lukasparsons/DDNotify_CircuitPython_BLU

The application is driven by a config.json file that needs to be included in the project root folder. Below is an example of that config.json's structure.
```
{
	"prefix":">", // Your bot's command prefix.
	"token": "YOUR_BOT_TOKEN",
	"channels": [
		{ "name" :"CHANNEL_1_NAME", "setVal" : "set1" },
		{ "name" :"CHANNEL_2_NAME", "setVal" : "set2" },
	],
	"uuids": {
		"peripheral" : "YOUR_PERIPHERAL_UUID",
		"service": "PERIPHERAL'S_UART_SERVICE_UUID",
		"characteristic": "SERVICE'S_RXCHARACTERISTIC_UUID"
	}
}
```
