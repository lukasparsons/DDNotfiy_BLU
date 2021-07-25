const config = require('./config.json');
const discord = require('discord.js');
const noble = require('@abandonware/noble');

const client = new discord.Client();
const withoutResponse = true;
let peripheral;
let rxCharacteristic;
let uartService;
let manuallyDisconnected = false;

client.once('ready', () => {
    console.log('Ready!');
    registerBLEHandlers();
});
const registerBLEHandlers = () => {
    noble.on('stateChange', async (state) => {
        if (state === 'poweredOn') {
            console.log('Starting Scan...');
            await noble.startScanningAsync([config.uuids.uart], false);

            noble.on('discover', (periph) => {
                console.log('Peripheral Found!');
                if (periph.advertisement.serviceUuids.includes(config.uuids.uart)) {
                    noble.stopScanning();
                    console.log(periph);
                    peripheral = periph;

                    

                    peripheral.connectAsync().then(() => {
                        setupPeriphHandler();
                    });
                    
                }
            });

        }
    });
};

const setupPeriphHandler = async () => {
        console.log('connected!');
        peripheral.connected = true;
        peripheral.once('disconnect', () => {
            if (!manuallyDisconnected) {
                console.log('disconnected...')
                if (config.autoreconnect == 'true') {
                    console.log('trying to reconnect...')
                    noble.startScanningAsync([config.uuids.uart], false);
                }
                else {
                    console.log('use command "reset" to try to reconnect.');
                }
            }
        });
        peripheral.discoverServicesAsync([config.uuids.uart]).then((services) => {
            console.log('discovered services');
            const serv = services.find(x => x.uuid == config.uuids.uart);
            if (serv !== undefined) {
                console.log('set uart service');
                uartService = serv;
                serv.discoverCharacteristicsAsync().then((chars) => {
                    console.log('discovered characteristics');
                    const rxChar = chars.find(x => x.properties.includes('write'));
                    if (rxChar !== undefined) {
                        rxCharacteristic = rxChar;
                        console.log('set rxCharacteristic');
                    }
                    else {
                        console.log('rxCharacteristic was undefined... :(');
                    }                    
                });
            }
            else {
                console.log('serv undefined...');
            }
        });
    };

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) {
        const role = message.member.roles.cache.find(r => r.name == 'Players');
        if (role !== undefined) {
            const msg = convertStringToBuffer(message.channel.name);
            rxCharacteristic.write(msg, withoutResponse);
            console.log(`Message sent in ${message.channel.name}. Wrote message to serialport.`);
        }
    }

    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    const channel = config.channels.find(c => c.name == message.channel.name);
    if (channel === undefined) {
        return;
    }
    const logMessage = `Command Sent in #${message.channel.name}. ChannelId: ${channel.id}`;
    console.log(logMessage);

    if (command === 'reset') {
        noble.reset();
    }

    if (command === 'spoof') {
        if (!args.length || args.length > 1) {
            return message.channel.send('One and only one argument is required.');
        }
        else {
            const channelname = args[0];
            const channel = config.channels.find(c => c.name == channelname);
            if (channel == undefined) {
                return message.channel.send('that channel is not spoofable.');
            }
            else {
                if (channel.name == 'test-channel') {
                    channel.setVal = 'test-channel';
                }
                sendSerialmessage(channel.setVal, message);
            }
        }
    }

    if (command === 'validate') {
        console.log('peripheral: ', peripheral);
        console.log('uartService: ', uartService);
        console.log('rxCharacteristic: ', rxCharacteristic);
        if (rxCharacteristic !== undefined && rxCharacteristic !== null) {
            message.channel.send('Peripheral Connected!');
        }
    }

    if (command === 'test-message') {
        console.log('command: test-message')
        const result = isBLEValid();
        if (result !== true) {
            message.channel.send(result);
            return;
        }
        const msg = convertStringToBuffer('Test Message');
        sendSerialmessage(msg, message);
    }

});

const sendSerialmessage = (serialMessage, discMessage) => {
    const result = isBLEValid();
    if (result !== true) {
        discMessage.channel.send(result);
        return;
    }
    const msg = convertStringToBuffer(serialMessage);
    rxCharacteristic.write(msg);
    console.log('wrote message to rxCharacteristic.');
};

const convertStringToBuffer = (input) => {
    return Buffer.from(input, 'utf-8');
};

const isBLEValid = () => {
    let errorMsg;
    if (peripheral === null || peripheral === undefined) {
        errorMsg += 'peripheral is null. ';
    }
    if (uartService === null || uartService === undefined) {
        errorMsg += 'uartService is null. ';
    }
    if (rxCharacteristic === null || rxCharacteristic === undefined) {
        errorMsg += 'rxCharacteristic is null';
    }
    if (errorMsg !== undefined) {
        return errorMsg;
    }
    else {
        return true;
    }
};


client.login(config.token);