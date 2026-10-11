import { Job } from "../models/Job";
import { Queue } from "../interfaces/Queue";
import { JobHandler } from "../interfaces/JobHandler";

export class Worker {
  private handlerMap: Map<string, JobHandler>;

  constructor(
    private queue: Queue<Job>,
    private workerId: string,
    handlers: JobHandler[]
  ) {
    this.handlerMap = new Map(
      handlers.map((handler) => [handler.type, handler])
    );
  }

  async processNextJob(): Promise<void> {
    const job = this.queue.dequeue();

    if (!job) {
      return;
    }

    const handler = this.handlerMap.get(job.type);

    if (!handler) {
      job.status = "FAILED";
      console.log(
        `${this.workerId}: No handler found for ${job.type}`
      );
      return;
    }

    job.status = "PROCESSING";
    job.attempts++;

    try {
      console.log(
        `${this.workerId}: Processing ${job.id}, attempt ${job.attempts}`
      );

      await handler.handle(job);

      job.status = "COMPLETED";

      console.log(
        `${this.workerId}: ${job.id} completed successfully`
      );
    } catch (error) {
      console.error(
        `${this.workerId}: ${job.id} failed on attempt ${job.attempts}`
      );

      if (job.attempts <= job.maxRetries) {
        job.status = "PENDING";

        console.log(
          `${this.workerId}: Retrying ${job.id}`
        );

        this.queue.enqueue(job);
      } else {
        job.status = "FAILED";

        console.log(
          `${this.workerId}: ${job.id} exhausted all retries`
        );
      }
    }
  }

  async runUntilEmpty(): Promise<void> {
    while (this.queue.size() > 0) {
      await this.processNextJob();
    }
  }
}
