import { Job } from "./models/Job";
import { InMemoryQueue } from "./queue/InMemoryQueue";
import { EmailHandler } from "./handlers/EmailHandler";
import { InvoiceHandler } from "./handlers/InvoiceHandler";
import { Worker } from "./workers/Worker";

async function main(): Promise<void> {
  const queue = new InMemoryQueue<Job>();

  const handlers = [
    new EmailHandler(),
    new InvoiceHandler(),
  ];

  const worker1 = new Worker(queue, "Worker-1", handlers);
  const worker2 = new Worker(queue, "Worker-2", handlers);

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
    {
      id: "job-4",
      type: "GENERATE_INVOICE",
      payload: { orderId: "ORD-501" },
    },
  ];

  for (const job of jobs) {
    queue.enqueue(job);
  }

  await Promise.all([
    worker1.runUntilEmpty(),
    worker2.runUntilEmpty(),
  ]);

  console.log("All jobs processed");
}

main().catch(console.error);
