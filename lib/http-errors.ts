export class BadRequestError extends Error {
  status = 400 as const;

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
