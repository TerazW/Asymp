'use client';

import { useState } from 'react';
import {
  Users,
  User,
  Phone,
  MessageSquare,
  Server,
  Database,
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react';
import { mockOwnership } from '@/lib/mock-data';
import type { ServiceOwnership } from '@/types';

function ServiceCard({ service }: { service: ServiceOwnership }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#0d0d14] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <Server className="w-5 h-5 text-primary-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">{service.serviceName}</h3>
          <p className="text-xs text-gray-500">{service.team}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* On-call indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Phone className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-400">{service.onCall}</span>
          </div>

          <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[#1f1f2e] p-4 bg-[#0d0d14]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owners */}
            <div>
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Ownership</h4>

              <div className="space-y-2">
                {/* Primary Owner */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#12121a]">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{service.primaryOwner}</p>
                    <p className="text-xs text-gray-500">Primary Owner</p>
                  </div>
                </div>

                {/* Secondary Owners */}
                {service.secondaryOwners.map((owner) => (
                  <div key={owner} className="flex items-center gap-3 p-2 rounded-lg bg-[#12121a]">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{owner}</p>
                      <p className="text-xs text-gray-500">Secondary</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Dependencies */}
            <div className="space-y-4">
              {/* Slack Channel */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Contact</h4>
                <a
                  href="#"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12121a] hover:bg-[#1a1a2e] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white">{service.slackChannel}</span>
                  <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                </a>
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {service.dependencies.map((dep) => (
                    <span key={dep} className="flex items-center gap-1 px-2 py-1 rounded bg-[#12121a] text-xs text-gray-300">
                      <Database className="w-3 h-3 text-gray-500" />
                      {dep}
                    </span>
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

function OwnershipGraph() {
  return (
    <div className="card p-6 mb-6">
      <h3 className="text-sm font-medium text-gray-300 mb-4">Why Ownership Matters</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
            <span className="text-lg">🔥</span>
          </div>
          <h4 className="text-sm font-medium text-white mb-1">Incident Happens</h4>
          <p className="text-xs text-gray-400">
            Agent action causes a problem in production
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-3">
            <span className="text-lg">🎯</span>
          </div>
          <h4 className="text-sm font-medium text-white mb-1">Instant Attribution</h4>
          <p className="text-xs text-gray-400">
            Asymp identifies affected services and their owners
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#0d0d14] border border-[#1a1a2e]">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
            <span className="text-lg">⚡</span>
          </div>
          <h4 className="text-sm font-medium text-white mb-1">Immediate Notification</h4>
          <p className="text-xs text-gray-400">
            The right people are notified within seconds
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-primary-500/5 border border-primary-500/10">
        <p className="text-xs text-gray-400">
          <strong className="text-primary-400">TTI (Time to Intervention):</strong> The time between an incident occurring
          and a human being notified. This is our core metric. The ownership graph ensures we always know who to call.
        </p>
      </div>
    </div>
  );
}

export default function OwnershipPage() {
  const [search, setSearch] = useState('');

  const filteredServices = mockOwnership.filter(service =>
    service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    service.team.toLowerCase().includes(search.toLowerCase()) ||
    service.primaryOwner.toLowerCase().includes(search.toLowerCase())
  );

  const teams = [...new Set(mockOwnership.map(s => s.team))];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ownership</h1>
          <p className="text-sm text-gray-400 mt-1">Know who to notify when things go wrong</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{mockOwnership.length} services</span>
          <span className="text-gray-600">•</span>
          <span className="text-sm text-gray-400">{teams.length} teams</span>
        </div>
      </div>

      {/* Why Ownership Matters */}
      <OwnershipGraph />

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search services, teams, or owners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#12121a] border border-[#1f1f2e] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50"
        />
      </div>

      {/* Team Groups */}
      {teams.map((team) => {
        const teamServices = filteredServices.filter(s => s.team === team);
        if (teamServices.length === 0) return null;

        return (
          <div key={team} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-medium text-gray-300">{team}</h2>
              <span className="text-xs text-gray-500">({teamServices.length} services)</span>
            </div>
            <div className="space-y-3">
              {teamServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        );
      })}

      {filteredServices.length === 0 && (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-gray-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No Results</h3>
          <p className="text-sm text-gray-400">No services match your search</p>
        </div>
      )}
    </div>
  );
}
