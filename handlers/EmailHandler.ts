import { Job } from "../models/Job";
import { JobHandler } from "../interfaces/JobHandler";

export class EmailHandler implements JobHandler {
  type = "SEND_EMAIL";

  async handle(job: Job): Promise<void> {
    const payload = job.payload as { email: string };
  
    await new Promise((resolve) => setTimeout(resolve, 1000));
  
    console.log(`Sending email to ${payload.email}`);
    console.log(`Email job ${job.id} completed`);
  }
}
