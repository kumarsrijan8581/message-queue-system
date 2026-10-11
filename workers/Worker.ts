
import { Job } from "../models/Job";
import { Queue } from "../interfaces/Queue";
import { JobHandler } from "../interfaces/JobHandler";

export class Worker {
  private handlerMap: Map<string, JobHandler>;

  constructor(
    private queue: Queue<Job>,
    handlers: JobHandler[]
  ) {
    this.handlerMap = new Map(
      handlers.map((handler) => [handler.type, handler])
    );
  }

  async processNextJob(): Promise<void> {
    const job = this.queue.dequeue();

    if (!job) {
      console.log("No jobs available");
      return;
    }

    const handler = this.handlerMap.get(job.type);

    if (!handler) {
      console.log(`No handler found for job type: ${job.type}`);
      return;
    }

    try {
      console.log(`Worker processing job: ${job.id}`);

      await handler.handle(job);

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
    }
  }
}
