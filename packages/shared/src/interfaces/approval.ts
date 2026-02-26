/**
 * Approval gate abstraction for tool execution.
 * Before a tool is executed, the approval gate is consulted.
 * Consumers can implement auto-approve, user-prompt, or policy-based approval.
 */

export type ApprovalResult =
  | { approved: true }
  | { approved: false; reason: string }

export interface ApprovalRequest {
  /** Tool name being invoked */
  tool: string
  /** Tool parameters */
  params: Record<string, unknown>
  /** Optional human-readable description */
  description?: string
}

export interface IApprovalGate {
  /** Request approval before executing a tool */
  requestApproval(request: ApprovalRequest): Promise<ApprovalResult>
}

/**
 * An approval gate that always approves. Use for non-interactive scenarios.
 */
export class AutoApprovalGate implements IApprovalGate {
  async requestApproval(_request: ApprovalRequest): Promise<ApprovalResult> {
    return { approved: true }
  }
}
