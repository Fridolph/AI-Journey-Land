export interface DemoRunner {
  readonly demoId: string
  run(body: unknown): Promise<string>
  stream(body: unknown): AsyncGenerator<string>
}
