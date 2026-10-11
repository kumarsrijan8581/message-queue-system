import { Job } from "./models/Job";
import { InMemoryQueue } from "./queue/InMemoryQueue";
import { DeadLetterQueue } from "./queue/DeadLetterQueue";
import { EmailHandler } from "./handlers/EmailHandler";
import { InvoiceHandler } from "./handlers/InvoiceHandler";
import { Worker } from "./workers/Worker";
import { DeadLetterService } from "./services/DeadLetterService";

async function main(): Promise<void> {
  const queue = new InMemoryQueue<Job>();
  const deadLetterQueue = new DeadLetterQueue();

  const handlers = [
    new EmailHandler(),
    new InvoiceHandler(),
  ];

  const worker1 = new Worker(
    queue,
    deadLetterQueue,
    "Worker-1",
    handlers
  );

  const worker2 = new Worker(
    queue,
    deadLetterQueue,
    "Worker-2",
    handlers
  );

  const jobs: Job[] = [
    {
      id: "job-1",
      type: "GENERATE_INVOICE",
      payload: { orderId: "ORD-500" },
      status: "PENDING",
      attempts: 0,
      maxRetries: 2,
    },
    {
      id: "job-2",
      type: "SEND_EMAIL",
      payload: { email: "user@example.com" },
      status: "PENDING",
      attempts: 0,
      maxRetries: 2,
    },
    {
      id: "job-3",
      type: "SEND_EMAIL",
      payload: { email: "fail@example.com" },
      status: "PENDING",
      attempts: 0,
      maxRetries: 2,
    },
    {
      id: "job-4",
      type: "GENERATE_INVOICE",
      payload: { orderId: "ORD-501" },
      status: "PENDING",
      attempts: 0,
      maxRetries: 2,
    },
  ];

  for (const job of jobs) {
    queue.enqueue(job);
  }

  await Promise.all([
    worker1.runUntilEmpty(),
    worker2.runUntilEmpty(),
  ]);


  const deadLetterService = new DeadLetterService(
    queue,
    deadLetterQueue
  );

  console.log("\nInspecting failed job:");

  const failedJob = deadLetterService.inspect("job-3");

  if (failedJob) {
    console.log({
      id: failedJob.id,
      type: failedJob.type,
      status: failedJob.status,
      attempts: failedJob.attempts,
      maxRetries: failedJob.maxRetries,
      payload: failedJob.payload,
    });

    // Demo only: simulate fixing the invalid recipient.
    failedJob.payload = {
      email: "recovered@example.com",
    };

    const resubmitted = deadLetterService.retry("job-3");

    if (resubmitted) {
      await Promise.all([
        worker1.runUntilEmpty(),
        worker2.runUntilEmpty(),
      ]);
    }
  }

  console.log("\nFinal job statuses:");

  for (const job of jobs) {
    console.log(
      `${job.id}: ${job.status}, attempts: ${job.attempts}`
    );
  }

  console.log("\nJobs remaining in DLQ:");

  for (const job of deadLetterQueue.getAll()) {
    console.log(`${job.id}: ${job.status}`);
  }

  console.log(`Total jobs in DLQ: ${deadLetterQueue.size()}`);


  console.log("\nFinal job statuses:");

  for (const job of jobs) {
    console.log(
      `${job.id}: ${job.status}, attempts: ${job.attempts}`
    );
  }

  console.log("\nDead Letter Queue:");

  for (const job of deadLetterQueue.getAll()) {
    console.log(
      `${job.id}: ${job.status}, attempts: ${job.attempts}, type: ${job.type}`
    );
  }

  console.log(`Total jobs in DLQ: ${deadLetterQueue.size()}`);
}

main().catch(console.error);
