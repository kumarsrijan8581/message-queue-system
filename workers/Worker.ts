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

    try {
      job.status = "PROCESSING";

      console.log(
        `${this.workerId}: Started ${job.id}, status: ${job.status}`
      );

      await handler.handle(job);

      job.status = "COMPLETED";

      console.log(
        `${this.workerId}: Finished ${job.id}, status: ${job.status}`
      );
    } catch (error) {
      job.status = "FAILED";

      console.error(
        `${this.workerId}: Job ${job.id} failed, status: ${job.status}`,
        error
      );
    }
  }

  async runUntilEmpty(): Promise<void> {
    while (this.queue.size() > 0) {
      await this.processNextJob();
    }
  }
}
