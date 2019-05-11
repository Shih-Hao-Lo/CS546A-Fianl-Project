function logger(logText) {
  console.log(`[${new Date().toUTCString()}]: ${logText}`);
}

module.exports = {
  logger
}