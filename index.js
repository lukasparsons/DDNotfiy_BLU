const config = require('./config.json');
const discord = require('discord.js');
const noble = require('noble-winrt');

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
<<<<<<< HEAD
            console.log('Starting Scan...');
            noble.startScanning([config.uuids.uart], false, (error) => {
                if (error) {
                    console.log(error);
                }
            });

            noble.on('discover', (periph) => {
                console.log('Peripheral Found!');
                if (periph.advertisement.serviceUuids.includes(config.uuids.uart)) {
                    console.log(periph);
                    peripheral = periph;
                    peripheral.connect();
                    noble.stopScanning();
                    setupPeriphHandler();
                }
            });

=======
            console.log('scanning...');
            await noble.startScanningAsync([config.uuids.peripheral], false);
>>>>>>> d526412d7f2c9829b32cc08a09a8cdea43fcd270
        }
    });
};

<<<<<<< HEAD
const setupPeriphHandler = () => {
    peripheral.once('connect', () => {
        console.log('connected!');
        peripheral.connected = true;
        peripheral.discoverServices([config.uuids.uart]);
        peripheral.once('servicesDiscover', (pServices) => {
            console.log('discovered services');
            const serv = pServices.find(x => x.uuid == config.uuids.uart);
            if (serv !== undefined) {
                console.log('set uart service');
                uartService = serv;
                handleCharacteristics();
                uartService.discoverCharacteristics([config.uuids.uart]);
            }
            else {
                console.log('serv undefined...');
            }
        });
    });

    peripheral.once('disconnect', () => {
        if (!manuallyDisconnected) {
            console.log('disconnected...');
        }
    });
};

const handleCharacteristics = () => {
    uartService.once('characteristicsDiscover', (chars) => {
        console.log('discovered characteristics');
        const rxChar = chars.find(x => x.properties.includes('write'));
        if (rxChar !== undefined) {
            rxCharacteristic = rxChar;
            console.log('set rxCharacteristic');
            const msg = convertStringToBuffer('test-channel');
            rxChar.write(msg, withoutResponse);
        }
        else {
            console.log('rxCharacteristic was undefined... :(');
        }
=======
    noble.on('discover', async (periph) => {
        console.log('discovered!');
        await noble.stopScanningAsync();
        console.log('connecting...');
        await periph.connectAsync();
        await periph.discoverSomeServicesAndCharacteristicsAsync([], []).then((sandc => {
            peripheral = periph;
            services = sandc.services;
            characteristics = sandc.characteristics;
            uartService = sandc.services.find(s => s.name == 'uart');
            rxCharacteristic = uartService.characteristics.find(c => c.name == 'Rx');
            console.log('services: ', services);
            console.log('characteristics: ', characteristics);

            console.log('uartService: ', uartService);
            console.log('rxCharacteristic: ', rxCharacteristic);
        }));
>>>>>>> d526412d7f2c9829b32cc08a09a8cdea43fcd270
    });
};

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) {
        const role = message.member.roles.cache.find(r => r.name == 'Players');
        if (role !== undefined || message.channel.name == 'test-channel') {
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

    if (command === 'disconnect') {
        peripheral.disconnect();
    }

    if (command === 'tryreconnect') {
        if (peripheral !== undefined && peripheral !== null) {
            peripheral.disconnect();
        }
        async () => {
            // handle registered in the registerBLEHandlers should still work here?
            await noble.startScanning([config.uuids.uart], false);
        };
    }

    if (command === 'spoof') {
        if (!args.length || args.length > 1) {
            return message.channel.send('One and only one argument is required.');
        }
        else {
            const channelname = args[0];
            const setValue = config.channels.find(c => c.name == channelname).setVal;
            sendSerialmessage(setValue, message);
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