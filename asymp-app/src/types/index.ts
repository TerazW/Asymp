export type ActionType =
  | 'database_write'
  | 'database_read'
  | 'api_call'
  | 'file_create'
  | 'file_modify'
  | 'file_delete'
  | 'config_change'
  | 'deployment'
  | 'permission_change'
  | 'resource_create'
  | 'resource_delete'
  | 'code_commit'
  | 'code_push';

export type RoutingDecision =
  | 'auto_execute'      // Low risk, automatic
  | 'monitored_execute' // Default, execute with monitoring
  | 'gated'             // High risk, requires attention
  | 'blocked';          // Extremely high risk

export type ActionStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface Agent {
  id: string;
  name: string;
  type: 'code_assistant' | 'devops' | 'data_pipeline' | 'security' | 'support';
  status: 'active' | 'paused' | 'error';
  actionsToday: number;
  lastAction: Date;
  owner: string;
}

export interface Action {
  id: string;
  agentId: string;
  agentName: string;
  type: ActionType;
  description: string;
  target: string;
  routing: RoutingDecision;
  status: ActionStatus;
  timestamp: Date;
  duration?: number; // ms
  affectedServices: string[];
  metadata?: Record<string, unknown>;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startTime: Date;
  endTime?: Date;
  affectedServices: string[];
  rootCause?: {
    actionId: string;
    agentId: string;
    agentName: string;
    description: string;
  };
  timeline: TimelineEvent[];
  responders: string[];
  tti?: number; // Time to intervention in seconds
  mttr?: number; // Mean time to recovery in seconds
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'action' | 'alert' | 'notification' | 'intervention' | 'recovery' | 'note';
  actor: string; // Agent name or human name
  actorType: 'agent' | 'human' | 'system';
  description: string;
  metadata?: Record<string, unknown>;
}

export interface RoutingRule {
  id: string;
  name: string;
  actionType: ActionType;
  conditions: RuleCondition[];
  routing: RoutingDecision;
  notifyOwners: boolean;
  enabled: boolean;
}

export interface RuleCondition {
  field: 'target' | 'agent' | 'time' | 'frequency';
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: string;
}

export interface ServiceOwnership {
  id: string;
  serviceName: string;
  team: string;
  primaryOwner: string;
  secondaryOwners: string[];
  onCall: string;
  slackChannel: string;
  dependencies: string[];
}

export interface Metrics {
  totalActions24h: number;
  actionsByRouting: Record<RoutingDecision, number>;
  avgTTI: number; // seconds
  incidentsOpen: number;
  incidentsResolved24h: number;
  activeAgents: number;
  topAgents: { name: string; actions: number }[];
}
