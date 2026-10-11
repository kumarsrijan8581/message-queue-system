import { Job } from "../models/Job";
import { JobHandler } from "../interfaces/JobHandler";

export class EmailHandler implements JobHandler {
  type = "SEND_EMAIL";

  async handle(job: Job): Promise<void> {
    const payload = job.payload as {
      email: string;
    };

    console.log(`Sending email to ${payload.email}`);
    console.log(`Email job ${job.id} completed`);
  }
}
