export class AdminGateError extends Error {
  readonly gate: "forbidden" | "signing-in"

  constructor(gate: "forbidden" | "signing-in") {
    super(gate)
    this.name = "AdminGateError"
    this.gate = gate
  }
}
