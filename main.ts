
import { Job } from "./models/Job";
import { InMemoryQueue } from "./queue/InMemoryQueue";
import { EmailHandler } from "./handlers/EmailHandler";
import { InvoiceHandler } from "./handlers/InvoiceHandler";
import { Worker } from "./workers/Worker";

async function main(): Promise<void> {
  const queue = new InMemoryQueue<Job>();

  const emailHandler = new EmailHandler();
  const invoiceHandler = new InvoiceHandler();

  const worker = new Worker(queue, [
    emailHandler,
    invoiceHandler,
  ]);

  const jobs: Job[] = [
    {
      id: "job-1",
      type: "GENERATE_INVOICE",
      payload: { orderId: "ORD-500" },
    },
    {
      id: "job-2",
      type: "SEND_EMAIL",
      payload: { email: "user@example.com" },
    },
    {
      id: "job-3",
      type: "SEND_EMAIL",
      payload: { email: "mate@example.com" },
    },
  ];

  for (const job of jobs) {
    queue.enqueue(job);
  }

  while (queue.size() > 0) {
    await worker.processNextJob();
  }

  console.log("All queued jobs have been processed");
}

main().catch(console.error);
