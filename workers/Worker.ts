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
      console.log(
        `${this.workerId}: No handler for ${job.type}`
      );
      return;
    }

    try {
      console.log(`${this.workerId}: Started ${job.id}`);

      await handler.handle(job);

      console.log(`${this.workerId}: Finished ${job.id}`);
    } catch (error) {
      console.error(`${this.workerId}: Job ${job.id} failed`, error);
    }
  }

  async runUntilEmpty(): Promise<void> {
    while (this.queue.size() > 0) {
      await this.processNextJob();
    }
  }
}
