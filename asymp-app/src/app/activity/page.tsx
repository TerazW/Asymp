'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Bot,
  Database,
  Code,
  Settings,
  Shield,
  Rocket,
  FileText,
  Key,
  Server,
  GitCommit,
} from 'lucide-react';
import { mockActions, mockAgents, generateNewAction } from '@/lib/mock-data';
import type { Action, ActionType, RoutingDecision } from '@/types';

const actionTypeIcons: Record<ActionType, React.ElementType> = {
  database_write: Database,
  database_read: Database,
  api_call: Server,
  file_create: FileText,
  file_modify: FileText,
  file_delete: FileText,
  config_change: Settings,
  deployment: Rocket,
  permission_change: Key,
  resource_create: Server,
  resource_delete: Server,
  code_commit: GitCommit,
  code_push: Code,
};

function ActionRow({ action, isNew }: { action: Action; isNew?: boolean }) {
  const Icon = actionTypeIcons[action.type] || Activity;

  const getRoutingStyle = (routing: RoutingDecision) => {
    switch (routing) {
      case 'auto_execute':
        return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: 'Auto' };
      case 'monitored_execute':
        return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Monitored' };
      case 'gated':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', label: 'Gated' };
      case 'blocked':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Blocked' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-green-400' };
      case 'executing':
        return { icon: Activity, color: 'text-blue-400 animate-pulse' };
      case 'failed':
        return { icon: AlertTriangle, color: 'text-red-400' };
      default:
        return { icon: Clock, color: 'text-gray-400' };
    }
  };

  const routing = getRoutingStyle(action.routing);
  const status = getStatusStyle(action.status);
  const StatusIcon = status.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`flex items-center gap-4 px-4 py-3 border-b border-[#1a1a2e] hover:bg-[#12121a] transition-colors ${isNew ? 'slide-in bg-primary-500/5' : ''}`}>
      {/* Status */}
      <div className="w-6">
        <StatusIcon className={`w-5 h-5 ${status.color}`} />
      </div>

      {/* Action Type Icon */}
      <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>

      {/* Agent */}
      <div className="w-32">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">{action.agentName}</span>
        </div>
      </div>

      {/* Action Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{action.description}</p>
        <p className="text-xs text-gray-500 truncate">{action.target}</p>
      </div>

      {/* Routing */}
      <div className="w-24">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${routing.bg} ${routing.text} ${routing.border}`}>
          {routing.label}
        </span>
      </div>

      {/* Duration */}
      <div className="w-20 text-right">
        <span className="text-sm text-gray-400">{formatDuration(action.duration)}</span>
      </div>

      {/* Time */}
      <div className="w-24 text-right">
        <span className="text-xs text-gray-500">{formatTime(action.timestamp)}</span>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [actions, setActions] = useState<Action[]>(mockActions);
  const [filter, setFilter] = useState<RoutingDecision | 'all'>('all');
  const [search, setSearch] = useState('');
  const [newActionIds, setNewActionIds] = useState<Set<string>>(new Set());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newAction = generateNewAction();
      setActions(prev => [newAction, ...prev].slice(0, 50));
      setNewActionIds(prev => new Set([...prev, newAction.id]));

      // Remove "new" highlight after animation
      setTimeout(() => {
        setNewActionIds(prev => {
          const next = new Set(prev);
          next.delete(newAction.id);
          return next;
        });
      }, 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredActions = actions.filter(action => {
    if (filter !== 'all' && action.routing !== filter) return false;
    if (search && !action.description.toLowerCase().includes(search.toLowerCase()) &&
        !action.agentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const routingCounts = {
    all: actions.length,
    auto_execute: actions.filter(a => a.routing === 'auto_execute').length,
    monitored_execute: actions.filter(a => a.routing === 'monitored_execute').length,
    gated: actions.filter(a => a.routing === 'gated').length,
    blocked: actions.filter(a => a.routing === 'blocked').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Activity Stream</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time view of all agent actions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full pulse-ring"></div>
            </div>
            <span className="text-xs font-medium text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 p-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0d0d14] border border-[#1f1f2e] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
            />
          </div>

          {/* Routing Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#0d0d14] rounded-lg">
            {[
              { key: 'all', label: 'All' },
              { key: 'auto_execute', label: 'Auto' },
              { key: 'monitored_execute', label: 'Monitored' },
              { key: 'gated', label: 'Gated' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as RoutingDecision | 'all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
                <span className="ml-1.5 text-gray-500">
                  {routingCounts[key as keyof typeof routingCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action List */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-[#0d0d14] border-b border-[#1f1f2e] text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="w-6">Status</div>
          <div className="w-8"></div>
          <div className="w-32">Agent</div>
          <div className="flex-1">Action</div>
          <div className="w-24">Routing</div>
          <div className="w-20 text-right">Duration</div>
          <div className="w-24 text-right">Time</div>
        </div>

        {/* Rows */}
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
          {filteredActions.map((action) => (
            <ActionRow
              key={action.id}
              action={action}
              isNew={newActionIds.has(action.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
