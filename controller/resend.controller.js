const { resendQueue } = require("../queues/resend.queue");

const startResend = async (req, res) => {
    try {
        const { eventId } = req.body;

        if (!eventId) return res.status(400).json({ success: false, message: 'eventId is required' })



        const job = await resendQueue.add("start-resend", { eventId });

        // console.log("check in controller what is job ", job)

        return res.json({
            message: "Resend started",
            jobId: job.id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error starting report" });
    }
};


const getJobStatus = async (req, res) => {
    const { jobId } = req.params;

    // console.log('get controller jobId ', jobId)

    const job = await resendQueue.getJob(jobId);

    // console.log('check what is get from job', job)

    if (!job) return res.json({ status: "not found" });

    const state = await job.getState();

    res.json({ success: true, state });
};

module.exports = { startResend, getJobStatus };