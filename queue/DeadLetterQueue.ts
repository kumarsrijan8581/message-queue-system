
import { Job } from "../models/Job";

export class DeadLetterQueue {
  private jobs: Job[] = [];

  add(job: Job): void {
    this.jobs.push(job);
  }

  getAll(): Job[] {
    return [...this.jobs];
  }

  getById(jobId: string): Job | undefined {
    return this.jobs.find((job) => job.id === jobId);
  }

  removeById(jobId: string): Job | undefined {
    const index = this.jobs.findIndex((job) => job.id === jobId);

    if (index === -1) {
      return undefined;
    }

    const [job] = this.jobs.splice(index, 1);
    return job;
  }

  size(): number {
    return this.jobs.length;
  }
}
