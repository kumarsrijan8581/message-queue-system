import { Job } from "../models/Job";
import { Queue } from "../interfaces/Queue";
import { DeadLetterQueue } from "../queue/DeadLetterQueue";

export class DeadLetterService {
  constructor(
    private mainQueue: Queue<Job>,
    private deadLetterQueue: DeadLetterQueue
  ) {}

  inspect(jobId: string): Job | undefined {
    return this.deadLetterQueue.getById(jobId);
  }

  retry(jobId: string): boolean {
    const job = this.deadLetterQueue.removeById(jobId);

    if (!job) {
      console.log(`Job ${jobId} was not found in the DLQ`);
      return false;
    }

    job.attempts = 0;
    job.status = "PENDING";

    this.mainQueue.enqueue(job);

    console.log(`Job ${jobId} has been resubmitted to the main queue`);

    return true;
  }
}
