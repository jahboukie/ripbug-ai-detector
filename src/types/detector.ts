import { Issue, FunctionInfo } from './analysis';

export interface Detector {
  detect(files: string[], functions?: FunctionInfo[]): Promise<Issue[]>;
}
