const moment = require('moment-timezone');

function getShift() {
    const timeStr = moment().tz('Europe/Berlin').format('HH:mm');

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function isBetween(currentTime, startTime, endTime) {
        if (startTime < endTime) {
            return currentTime >= startTime && currentTime < endTime;
        }
        return currentTime >= startTime || currentTime < endTime;
    }
    const currentTime = parseTime(timeStr);
    const s1StartTime = parseTime('06:00');
    const s1EndTime = parseTime('14:00');

    const s2StartTime = parseTime('14:00');
    const s2EndTime = parseTime('22:00');

    const s3StartTime = parseTime('22:00');
    const s3EndTime = parseTime('06:00');



    if (isBetween(currentTime, s1StartTime, s1EndTime)) {
        return 1;
    } else if (isBetween(currentTime, s2StartTime, s2EndTime)) {
        return 2;
    } else if (isBetween(currentTime, s3StartTime, s3EndTime)) {
        return 3;
    } else {
        return 0;
    }
}
module.exports = { getShift };