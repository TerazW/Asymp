'use client';

import {
  Settings,
  Bell,
  Link,
  Shield,
  Users,
  Key,
  Webhook,
  Slack,
  GitBranch,
  Database,
  Cloud,
  Check,
} from 'lucide-react';

const integrations = [
  { name: 'Slack', icon: Slack, connected: true, description: 'Real-time notifications' },
  { name: 'GitHub', icon: GitBranch, connected: true, description: 'Code change tracking' },
  { name: 'PagerDuty', icon: Bell, connected: true, description: 'On-call escalation' },
  { name: 'Datadog', icon: Database, connected: false, description: 'Metrics correlation' },
  { name: 'AWS', icon: Cloud, connected: true, description: 'Infrastructure events' },
  { name: 'Webhook', icon: Webhook, connected: false, description: 'Custom integrations' },
];

export default function SettingsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure integrations and preferences</p>
      </div>

      {/* Integrations */}
      <div className="card mb-6">
        <div className="p-4 border-b border-[#1f1f2e]">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-medium text-white">Integrations</h2>
          </div>
          <p className="text-sm text-gray-400 mt-1">Connect your tools for seamless coordination</p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.name}
                  className={`p-4 rounded-lg border transition-colors ${
                    integration.connected
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-[#0d0d14] border-[#1a1a2e] hover:border-[#2a2a3e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        integration.connected ? 'bg-green-500/10' : 'bg-[#1a1a2e]'
                      }`}>
                        <Icon className={`w-5 h-5 ${integration.connected ? 'text-green-400' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">{integration.name}</h3>
                        <p className="text-xs text-gray-500">{integration.description}</p>
                      </div>
                    </div>
                    {integration.connected && (
                      <div className="flex items-center gap-1 text-green-400">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  {!integration.connected && (
                    <button className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded hover:bg-primary-500/20 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card mb-6">
        <div className="p-4 border-b border-[#1f1f2e]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-medium text-white">Notifications</h2>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {[
            { label: 'Gated actions', description: 'Notify when a gated action is executed', enabled: true },
            { label: 'Incidents', description: 'Notify when a new incident is detected', enabled: true },
            { label: 'Daily digest', description: 'Summary of daily agent activity', enabled: false },
            { label: 'Pattern alerts', description: 'Alert when recurring patterns are detected', enabled: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14]">
              <div>
                <p className="text-sm font-medium text-white">{setting.label}</p>
                <p className="text-xs text-gray-500">{setting.description}</p>
              </div>
              <button
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-primary-500' : 'bg-[#1a1a2e]'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    setting.enabled ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="p-4 border-b border-[#1f1f2e]">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-medium text-white">API Keys</h2>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d0d14]">
            <div className="flex items-center gap-3">
              <div className="font-mono text-sm text-gray-400">
                asymp_live_****************************
              </div>
              <span className="px-2 py-0.5 text-xs font-medium text-green-400 bg-green-500/10 rounded">
                Active
              </span>
            </div>
            <button className="text-xs text-gray-400 hover:text-white transition-colors">
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
