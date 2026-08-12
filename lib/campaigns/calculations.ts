export type DeliverableProgress = { completed: number; total: number };

export function calculateDeliverableProgress(statuses: string[]): DeliverableProgress {
  return { completed: statuses.filter((status) => status === "completed").length, total: statuses.length };
}

export type CompensationAmount = { id: string; agreedAmountCents: number | null };
export type PaymentAmount = { compensationId: string | null; amountCents: number; status: string };

export function calculateOutstandingByCompensation(compensations: CompensationAmount[], payments: PaymentAmount[]) {
  const received = new Map<string, number>();
  for (const payment of payments) {
    if (payment.compensationId && payment.status === "received") received.set(payment.compensationId, (received.get(payment.compensationId) ?? 0) + payment.amountCents);
  }
  return compensations.reduce((total, compensation) => total + Math.max(0, (compensation.agreedAmountCents ?? 0) - (received.get(compensation.id) ?? 0)), 0);
}

export function isOverdue(dueAt: Date | null, complete: boolean, now = new Date()) {
  return Boolean(dueAt && !complete && dueAt.getTime() < now.getTime());
}
