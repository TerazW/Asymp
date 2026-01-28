'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Bot,
  MessageSquare,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
} from 'lucide-react';
import { mockIncidents } from '@/lib/mock-data';
import type { Incident, TimelineEvent } from '@/types';

function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const getEventStyle = (type: string) => {
    switch (type) {
      case 'action':
        return { icon: Activity, color: 'bg-blue-500', label: 'Action' };
      case 'alert':
        return { icon: AlertTriangle, color: 'bg-red-500', label: 'Alert' };
      case 'notification':
        return { icon: MessageSquare, color: 'bg-purple-500', label: 'Notification' };
      case 'intervention':
        return { icon: User, color: 'bg-yellow-500', label: 'Intervention' };
      case 'recovery':
        return { icon: CheckCircle2, color: 'bg-green-500', label: 'Recovery' };
      case 'note':
        return { icon: MessageSquare, color: 'bg-gray-500', label: 'Note' };
      default:
        return { icon: Activity, color: 'bg-gray-500', label: type };
    }
  };

  const style = getEventStyle(event.type);
  const Icon = style.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-[#1f1f2e] last:hidden" />

      {/* Icon */}
      <div className={`relative z-10 w-8 h-8 rounded-full ${style.color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-500">{formatTime(event.timestamp)}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-[#1a1a2e] text-gray-400">{style.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {event.actorType === 'agent' ? (
            <Bot className="w-4 h-4 text-primary-400" />
          ) : event.actorType === 'human' ? (
            <User className="w-4 h-4 text-green-400" />
          ) : (
            <Shield className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-white">{event.actor}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{event.description}</p>
      </div>
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  const [expanded, setExpanded] = useState(incident.status !== 'resolved');

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
      case 'high':
        return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'medium':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
      default:
        return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'investigating':
        return { bg: 'bg-red-500/10', text: 'text-red-400' };
      case 'identified':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
      case 'monitoring':
        return { bg: 'bg-blue-500/10', text: 'text-blue-400' };
      case 'resolved':
        return { bg: 'bg-green-500/10', text: 'text-green-400' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-400' };
    }
  };

  const severity = getSeverityStyle(incident.severity);
  const status = getStatusStyle(incident.status);

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#0d0d14] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded border uppercase ${severity.bg} ${severity.text} ${severity.border}`}>
              {incident.severity}
            </span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${status.bg} ${status.text}`}>
              {incident.status}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white">{incident.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Started {formatDuration(incident.startTime)} ago</span>
            {incident.endTime && <span>Duration: {formatDuration(incident.startTime, incident.endTime)}</span>}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6">
          {incident.tti && (
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary-400">{incident.tti}s</p>
              <p className="text-xs text-gray-500">TTI</p>
            </div>
          )}
          {incident.mttr && (
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-400">{Math.floor(incident.mttr / 60)}m</p>
              <p className="text-xs text-gray-500">MTTR</p>
            </div>
          )}
        </div>

        {/* Expand/Collapse */}
        <button className="p-2 rounded-lg hover:bg-[#1a1a2e] transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[#1f1f2e]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
            {/* Left: Timeline */}
            <div className="lg:col-span-2 p-4 border-b lg:border-b-0 lg:border-r border-[#1f1f2e]">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Timeline</h4>
              <div className="space-y-0">
                {incident.timeline.map((event) => (
                  <TimelineEventRow key={event.id} event={event} />
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-4">
              {/* Root Cause */}
              {incident.rootCause && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Root Cause</h4>
                  <div className="p-3 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-white">{incident.rootCause.agentName}</span>
                    </div>
                    <p className="text-sm text-gray-400">{incident.rootCause.description}</p>
                  </div>
                </div>
              )}

              {/* Affected Services */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Affected Services</h4>
                <div className="flex flex-wrap gap-2">
                  {incident.affectedServices.map((service) => (
                    <span key={service} className="px-2 py-1 text-xs bg-[#1a1a2e] text-gray-300 rounded">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responders */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Responders</h4>
                <div className="flex flex-wrap gap-2">
                  {incident.responders.map((responder) => (
                    <div key={responder} className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded">
                      <User className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{responder}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IncidentsPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredIncidents = mockIncidents.filter(incident => {
    if (filter === 'open') return incident.status !== 'resolved';
    if (filter === 'resolved') return incident.status === 'resolved';
    return true;
  });

  const openCount = mockIncidents.filter(i => i.status !== 'resolved').length;
  const resolvedCount = mockIncidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Incidents</h1>
          <p className="text-sm text-gray-400 mt-1">Track, investigate, and learn from incidents</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">{openCount} Open</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">{resolvedCount} Resolved (24h)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'all', label: 'All Incidents' },
          { key: 'open', label: 'Open' },
          { key: 'resolved', label: 'Resolved' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as 'all' | 'open' | 'resolved')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === key
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-gray-400 hover:text-white hover:bg-[#12121a]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}

        {filteredIncidents.length === 0 && (
          <div className="card p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">All Clear</h3>
            <p className="text-sm text-gray-400">No incidents match your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
