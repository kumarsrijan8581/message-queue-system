import { Job } from "../models/Job";

export interface JobHandler {
  type: string;
  handle(job: Job): Promise<void>;
}
