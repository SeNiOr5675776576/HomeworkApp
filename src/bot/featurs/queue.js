class MessageQueue {
    constructor (delayMs = 1100) {
        this.queue = [];
        this.processing = false;
        this.delayMs = delayMs;
    }

    push(job) {
        this.queue.push(job);
        this.run();
    }

    async run() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();

            try {
                await job();
            }
            catch (err) {
                console.error('Send error:', err.message);
            }

            await new Promise(r => setTimeout(r, this.delayMs));
        }
        this.processing = false;
    }
}

export default new MessageQueue();