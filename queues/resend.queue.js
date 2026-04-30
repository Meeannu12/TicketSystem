const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

// console.log('check what is in connection', connection)
const resendQueue = new Queue("resend-queue", {
    connection,
});

module.exports = { resendQueue };