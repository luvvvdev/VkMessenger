import BackgroundService from 'react-native-background-actions'
import {LongPollService} from "./index";

const backgroundLongPolling = async (taskData) => {
    if (global.lp) return
    const lp = new LongPollService()
    global.lp = lp

    try {
        // await global.lp.connect()
        await global.lp.lookupUpdates()
    } catch (e) {
        console.error(e)
        stopLongPoll()
    }
}

const options = {
    taskName: 'VK Messenger',
    taskTitle: 'Updates',
    taskDesc: '.',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    // linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
        delay: 1000,
    },
};

const startLongPoll = () => BackgroundService.start(backgroundLongPolling, options)
const stopLongPoll = () => BackgroundService.stop()

export {startLongPoll, stopLongPoll}
