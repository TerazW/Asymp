'use client';

import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Shield,
  Zap,
  Eye,
  Settings,
  Database,
  Server,
  Rocket,
  Key,
  FileText,
  Code,
} from 'lucide-react';
import { mockRoutingRules } from '@/lib/mock-data';
import type { RoutingRule, ActionType, RoutingDecision } from '@/types';

const actionTypeLabels: Record<ActionType, { label: string; icon: React.ElementType }> = {
  database_write: { label: 'Database Write', icon: Database },
  database_read: { label: 'Database Read', icon: Database },
  api_call: { label: 'API Call', icon: Server },
  file_create: { label: 'File Create', icon: FileText },
  file_modify: { label: 'File Modify', icon: FileText },
  file_delete: { label: 'File Delete', icon: FileText },
  config_change: { label: 'Config Change', icon: Settings },
  deployment: { label: 'Deployment', icon: Rocket },
  permission_change: { label: 'Permission Change', icon: Key },
  resource_create: { label: 'Resource Create', icon: Server },
  resource_delete: { label: 'Resource Delete', icon: Server },
  code_commit: { label: 'Code Commit', icon: Code },
  code_push: { label: 'Code Push', icon: Code },
};

const routingLabels: Record<RoutingDecision, { label: string; description: string; icon: React.ElementType; color: string }> = {
  auto_execute: {
    label: 'Auto Execute',
    description: 'Low risk - executes without notification',
    icon: Zap,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
  monitored_execute: {
    label: 'Monitored Execute',
    description: 'Default - executes with monitoring and notification',
    icon: Eye,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  gated: {
    label: 'Gated',
    description: 'High risk - executes but alerts owners immediately',
    icon: AlertTriangle,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  blocked: {
    label: 'Blocked',
    description: 'Extremely high risk - requires manual approval',
    icon: Shield,
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
  },
};

function RuleCard({ rule }: { rule: RoutingRule }) {
  const actionType = actionTypeLabels[rule.actionType];
  const routing = routingLabels[rule.routing];
  const ActionIcon = actionType.icon;
  const RoutingIcon = routing.icon;

  return (
    <div className={`card p-4 transition-all ${!rule.enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Action Type Icon */}
          <div className="w-10 h-10 rounded-lg bg-[#1a1a2e] flex items-center justify-center shrink-0">
            <ActionIcon className="w-5 h-5 text-gray-400" />
          </div>

          {/* Rule Info */}
          <div>
            <h3 className="text-sm font-medium text-white">{rule.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{actionType.label}</p>

            {/* Conditions */}
            {rule.conditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {rule.conditions.map((condition, index) => (
                  <span key={index} className="px-2 py-0.5 text-xs bg-[#1a1a2e] text-gray-400 rounded">
                    {condition.field} {condition.operator} "{condition.value}"
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Routing Decision */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${routing.color}`}>
            <RoutingIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{routing.label}</span>
          </div>

          {/* Toggle */}
          <button
            className={`relative w-10 h-6 rounded-full transition-colors ${
              rule.enabled ? 'bg-primary-500' : 'bg-[#1a1a2e]'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                rule.enabled ? 'left-5' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notify Badge */}
      {rule.notifyOwners && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
          <Check className="w-3 h-3" />
          Notifies affected owners
        </div>
      )}
    </div>
  );
}

function RoutingFlowDiagram() {
  return (
    <div className="card p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-300 mb-4">How Routing Works</h3>

      <div className="flex items-center justify-between gap-4">
        {/* Step 1: Action */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-sm font-medium text-white">Agent Action</p>
          <p className="text-xs text-gray-500">Action comes in</p>
        </div>

        <div className="text-gray-600">→</div>

        {/* Step 2: Rules */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
            <GitBranch className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-white">Routing Rules</p>
          <p className="text-xs text-gray-500">Match & classify</p>
        </div>

        <div className="text-gray-600">→</div>

        {/* Step 3: Execute */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-sm font-medium text-white">Execute</p>
          <p className="text-xs text-gray-500">With monitoring</p>
        </div>

        <div className="text-gray-600">→</div>

        {/* Step 4: Notify */}
        <div className="flex-1 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-2">
            <Eye className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-sm font-medium text-white">Notify</p>
          <p className="text-xs text-gray-500">Alert owners if needed</p>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
        <p className="text-xs text-gray-400">
          <strong className="text-primary-400">Key insight:</strong> We don't block actions by default.
          Instead, we execute with appropriate monitoring and notify the right people based on risk level.
          This allows agents to move fast while keeping humans in the loop.
        </p>
      </div>
    </div>
  );
}

export default function RoutingPage() {
  const [rules] = useState<RoutingRule[]>(mockRoutingRules);

  const rulesByRouting = {
    auto_execute: rules.filter(r => r.routing === 'auto_execute'),
    monitored_execute: rules.filter(r => r.routing === 'monitored_execute'),
    gated: rules.filter(r => r.routing === 'gated'),
    blocked: rules.filter(r => r.routing === 'blocked'),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Routing Rules</h1>
          <p className="text-sm text-gray-400 mt-1">Configure how actions are classified and routed</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* Flow Diagram */}
      <RoutingFlowDiagram />

      {/* Rules by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gated */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-medium text-gray-300">Gated Actions</h2>
            <span className="text-xs text-gray-500">({rulesByRouting.gated.length})</span>
          </div>
          <div className="space-y-3">
            {rulesByRouting.gated.map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Monitored */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-medium text-gray-300">Monitored Execute</h2>
            <span className="text-xs text-gray-500">({rulesByRouting.monitored_execute.length})</span>
          </div>
          <div className="space-y-3">
            {rulesByRouting.monitored_execute.map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Auto Execute */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-400" />
            <h2 className="text-sm font-medium text-gray-300">Auto Execute</h2>
            <span className="text-xs text-gray-500">({rulesByRouting.auto_execute.length})</span>
          </div>
          <div className="space-y-3">
            {rulesByRouting.auto_execute.map(rule => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Default Behavior */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-300">Default Behavior</h2>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Monitored Execute</p>
                <p className="text-xs text-gray-500">For actions without matching rules</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Actions that don't match any specific rule will be executed with monitoring.
              This ensures visibility without blocking agent productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
