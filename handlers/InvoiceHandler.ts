import { Job } from "../models/Job";
import { JobHandler } from "../interfaces/JobHandler";

export class InvoiceHandler implements JobHandler {
  type = "GENERATE_INVOICE";

  async handle(job: Job): Promise<void> {
    const payload = job.payload as {
      orderId: string;
    };

    console.log(`Generating invoice for order ${payload.orderId}`);
    console.log(`Invoice job ${job.id} completed`);
  }
}
