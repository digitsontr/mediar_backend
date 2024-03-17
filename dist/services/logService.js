// logService.js
const Log = require("../models/log");
async function createLog(username, process) {
  try {
    const log = await Log.create({
      user: username,
      process: process
    });
  } catch (error) {
    console.error("Log mesajı kaydedilirken hata oluştu:", error);
  }
}
module.exports = {
  createLog
};