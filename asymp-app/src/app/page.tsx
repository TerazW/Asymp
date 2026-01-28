'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import { mockMetrics, mockActions, mockAgents, mockIncidents, generateNewAction } from '@/lib/mock-data';
import { SlackNotificationDark } from '@/components/SlackNotification';
import type { Action } from '@/types';

function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendUp,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const colorClasses = {
    primary: 'bg-primary-500/10 text-primary-400',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-400',
    danger: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-sm text-gray-400">{title}</p>
        {subValue && <p className="mt-0.5 text-xs text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
}

function RoutingDistribution() {
  const total = Object.values(mockMetrics.actionsByRouting).reduce((a, b) => a + b, 0);

  const items = [
    { label: 'Auto Execute', value: mockMetrics.actionsByRouting.auto_execute, color: 'bg-green-500' },
    { label: 'Monitored', value: mockMetrics.actionsByRouting.monitored_execute, color: 'bg-blue-500' },
    { label: 'Gated', value: mockMetrics.actionsByRouting.gated, color: 'bg-yellow-500' },
    { label: 'Blocked', value: mockMetrics.actionsByRouting.blocked, color: 'bg-red-500' },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Routing Distribution (24h)</h3>
      <div className="h-3 flex rounded-full overflow-hidden bg-[#1a1a2e]">
        {items.map((item) => (
          <div
            key={item.label}
            className={`${item.color} transition-all`}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-xs text-gray-400">{item.label}</span>
            <span className="text-xs font-medium text-white ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveAgents() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Active Agents</h3>
        <span className="text-xs text-gray-500">{mockMetrics.activeAgents} online</span>
      </div>
      <div className="space-y-3">
        {mockMetrics.topAgents.map((agent, index) => (
          <div key={agent.name} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              index === 0 ? 'bg-primary-500/20 text-primary-400' :
              index === 1 ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{agent.name}</p>
              <p className="text-xs text-gray-500">{agent.actions} actions today</p>
            </div>
            <div className="w-24 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(agent.actions / mockMetrics.topAgents[0].actions) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ actions }: { actions: Action[] }) {
  const getRoutingColor = (routing: string) => {
    switch (routing) {
      case 'auto_execute': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'monitored_execute': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'gated': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'blocked': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'executing': return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Recent Activity</h3>
        <div className="flex items-center gap-1.5 text-xs text-green-400">
          <div className="relative">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full pulse-ring"></div>
          </div>
          Live
        </div>
      </div>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
        {actions.slice(0, 8).map((action, index) => (
          <div
            key={action.id}
            className={`flex items-start gap-3 p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e] ${index === 0 ? 'slide-in' : ''}`}
          >
            {getStatusIcon(action.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{action.agentName}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getRoutingColor(action.routing)}`}>
                  {action.routing.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{action.description}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{action.target}</p>
            </div>
            <span className="text-[10px] text-gray-500 whitespace-nowrap">{formatTime(action.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenIncidents() {
  const openIncidents = mockIncidents.filter(i => i.status !== 'resolved');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Open Incidents</h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          openIncidents.length > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
        }`}>
          {openIncidents.length} active
        </span>
      </div>
      {openIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-500/50 mb-2" />
          <p className="text-sm text-gray-400">All clear!</p>
          <p className="text-xs text-gray-500">No open incidents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {openIncidents.map((incident) => (
            <div key={incident.id} className="p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border uppercase ${getSeverityColor(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{incident.status}</span>
                  </div>
                  <p className="text-sm font-medium text-white mt-1">{incident.title}</p>
                </div>
                {incident.tti && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary-400">{incident.tti}s</p>
                    <p className="text-[10px] text-gray-500">TTI</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-500">Responders:</span>
                {incident.responders.map((r) => (
                  <span key={r} className="px-1.5 py-0.5 text-[10px] bg-primary-500/10 text-primary-300 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [actions, setActions] = useState<Action[]>(mockActions);
  const [showNotification, setShowNotification] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newAction = generateNewAction();
      setActions(prev => [newAction, ...prev].slice(0, 20));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Monitor agent activity and system health in real-time</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Actions (24h)"
          value={mockMetrics.totalActions24h.toLocaleString()}
          icon={Activity}
          trend="+12%"
          trendUp={true}
          color="primary"
        />
        <MetricCard
          title="Avg. Time to Intervention"
          value={`${mockMetrics.avgTTI}s`}
          subValue="Target: <60s"
          icon={Clock}
          trend="-8%"
          trendUp={true}
          color="success"
        />
        <MetricCard
          title="Open Incidents"
          value={mockMetrics.incidentsOpen}
          icon={AlertTriangle}
          color={mockMetrics.incidentsOpen > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          title="Active Agents"
          value={mockMetrics.activeAgents}
          subValue={`${mockAgents.length} total`}
          icon={Bot}
          color="primary"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <RecentActivity actions={actions} />
          <RoutingDistribution />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <OpenIncidents />
          <ActiveAgents />
        </div>
      </div>

      {/* Slack Notification Preview - Fixed position for demo */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="relative">
            <button
              onClick={() => setShowNotification(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white text-sm z-10"
            >
              x
            </button>
            <SlackNotificationDark
              agentName="DeployBot"
              action="Deploy v2.4.1 to staging"
              target="staging-cluster/payments-service"
              confidence={85}
              owner="Sarah Chen"
              timestamp="Just now"
            />
          </div>
        </div>
      )}
    </div>
  );
}
