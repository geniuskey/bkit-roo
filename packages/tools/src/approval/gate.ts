/**
 * Approval gate framework for tool execution.
 * Wraps the IApprovalGate interface with auto-approve logic.
 */

import type { IApprovalGate, ApprovalRequest, ApprovalResult } from "@bkit-roo/shared"

/**
 * Tool approval policy configuration.
 */
export interface ApprovalPolicy {
  /** Auto-approve all read operations */
  autoApproveReads?: boolean
  /** Auto-approve all edit operations */
  autoApproveEdits?: boolean
  /** Auto-approve all command executions */
  autoApproveCommands?: boolean
  /** Auto-approve MCP tool calls to specific servers */
  autoApproveMcpServers?: string[]
  /** Maximum number of auto-approvals before requiring manual approval */
  maxAutoApprovals?: number
}

/**
 * Approval gate that applies a policy before delegating to the underlying gate.
 */
export class PolicyApprovalGate implements IApprovalGate {
  private autoApprovalCount = 0

  constructor(
    private readonly innerGate: IApprovalGate,
    private readonly policy: ApprovalPolicy,
  ) {}

  async requestApproval(request: ApprovalRequest): Promise<ApprovalResult> {
    // Check auto-approval limit
    if (this.policy.maxAutoApprovals !== undefined && this.autoApprovalCount >= this.policy.maxAutoApprovals) {
      return this.innerGate.requestApproval(request)
    }

    // Check policy-based auto-approve
    if (this.shouldAutoApprove(request)) {
      this.autoApprovalCount++
      return { approved: true }
    }

    return this.innerGate.requestApproval(request)
  }

  private shouldAutoApprove(request: ApprovalRequest): boolean {
    const tool = request.tool

    // Read tools
    if (this.policy.autoApproveReads) {
      if (["read_file", "search_files", "list_files", "list_code_definition_names"].includes(tool)) {
        return true
      }
    }

    // Edit tools
    if (this.policy.autoApproveEdits) {
      if (["write_to_file", "apply_diff", "insert_content", "search_and_replace"].includes(tool)) {
        return true
      }
    }

    // Command tools
    if (this.policy.autoApproveCommands) {
      if (tool === "execute_command") {
        return true
      }
    }

    // MCP tools
    if (this.policy.autoApproveMcpServers && tool === "use_mcp_tool") {
      const serverName = request.params.server_name as string | undefined
      if (serverName && this.policy.autoApproveMcpServers.includes(serverName)) {
        return true
      }
    }

    // Meta-tools are always auto-approved
    if (["ask_followup_question", "attempt_completion", "switch_mode", "new_task"].includes(tool)) {
      return true
    }

    return false
  }

  /** Reset the auto-approval counter */
  resetCounter(): void {
    this.autoApprovalCount = 0
  }
}
