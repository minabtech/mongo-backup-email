const configList = require('./config');
const helper = require('./helper');
const schedule = require('node-schedule');

const setRule = (rule, config) => {
    let s = schedule.scheduleJob(rule, function () {
        helper.backup(config.db, config.path, config.email, config.password, config.project);
    });
    return s;
}

const runConfig = (config) => {
    config.schedules.forEach((sch) => {
        let rule = new schedule.RecurrenceRule();
        for (var r in sch) {
            rule[r] = sch[r];
        }
        setRule(rule, config)
    })
}

configList.forEach(function (config) {
    runConfig(config);
})