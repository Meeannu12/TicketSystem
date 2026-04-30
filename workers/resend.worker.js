const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { resendQueue } = require("../queues/resend.queue");
const { getIdsFromDB } = require("../services/resend.service");

const connection = new IORedis({
    maxRetriesPerRequest: null,
});

// 👇 SINGLE worker handling both job types
const worker = new Worker(
    "resend-queue",
    async (job) => {
        // 🧩 Parent Job

        // console.log('what is in job', job)
        if (job.name === "start-resend") {
            console.log("Starting parent job...");

            const ids = await getIdsFromDB(job.data.eventId);

            for (let i = 0; i < ids.length; i++) {
                await resendQueue.add("process-id", {
                    id: ids[i],
                    index: i,
                }, {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 3000,
                    },
                });
            }

            console.log("Child jobs created:", ids.length);
        }

        // ⚡ Child Job
        if (job.name === "process-id") {
            const { id, index } = job.data;

            try {
                // await axios.get(`https://api.example.com/data/${id}`);
                console.log(`Processed index ${index}`);
            } catch (err) {
                console.error(`Error at index ${index}`, err.message);
                throw err; // important for retry
            }
        }
    },
    {
        connection,
        concurrency: 10, // 🔥 parallel jobs
    }
);


// listeners
worker.on("completed", (job) => {
    console.log(`✅ Job completed: ${job.name}`);
});

// 🔴 failure logging
worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.name}`, err.message);
});

module.exports = worker;