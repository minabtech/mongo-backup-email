const configList = require("./config");
const helper = require("./helper");
const schedule = require("node-schedule");
const parser = require("cron-parser");

const setRule = (rule, config) => {
  const s = schedule.scheduleJob(rule, () => {
    helper.backup(
      config.db,
      config.path,
      config.email,
      config.password,
      config.project
    );
  });
  return s;
};

const runConfig = config => {
  config.schedules.forEach(sch => {
    let rule = null;
    if (typeof sch === "string") {
      try {
        parser.parseExpression(sch);
      } catch (err) {
        throw new Error("Not a valid cron expression");
      }
      rule = sch;
    } else if (typeof sch === "object") {
      rule = new schedule.RecurrenceRule();
      for (const r in sch) {
        if (Object.prototype.hasOwnProperty.call(sch, r)) {
          rule[r] = sch[r];
        }
      }
    } else {
      throw new Error("Not a valid schedule");
    }
    setRule(rule, config);
  });
};

configList.forEach(config => {
  runConfig(config);
});
