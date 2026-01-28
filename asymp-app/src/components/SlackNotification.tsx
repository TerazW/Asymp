'use client';

import { Bot, ExternalLink, Clock } from 'lucide-react';

interface SlackNotificationProps {
  agentName: string;
  action: string;
  target: string;
  confidence: number;
  owner: string;
  timestamp: string;
  onAcknowledge?: () => void;
  onView?: () => void;
}

export function SlackNotification({
  agentName,
  action,
  target,
  confidence,
  owner,
  timestamp,
  onAcknowledge,
  onView,
}: SlackNotificationProps) {
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 85) return { label: 'LIKELY', color: 'text-yellow-600' };
    if (conf >= 60) return { label: 'SUSPECTED', color: 'text-orange-600' };
    return { label: 'POSSIBLE', color: 'text-gray-600' };
  };

  const confLabel = getConfidenceLabel(confidence);

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md font-sans">
      {/* Slack Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
        <div className="w-5 h-5 rounded bg-[#4A154B] flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <span className="text-sm font-medium text-gray-900">Asymp</span>
        <span className="text-xs text-gray-500">APP</span>
        <span className="text-xs text-gray-400 ml-auto">{timestamp}</span>
      </div>

      {/* Message Content */}
      <div className="p-4">
        {/* Alert Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            Gated Action
          </span>
        </div>

        {/* Main Content */}
        <div className="text-sm text-gray-900 mb-3">
          <p className="font-medium mb-1">Agent action requires attention</p>
          <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
            <div className="flex">
              <span className="text-gray-500 w-16">Agent:</span>
              <span className="font-medium">{agentName}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-16">Action:</span>
              <span>{action}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-16">Target:</span>
              <span className="font-mono text-xs">{target}</span>
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded">
          <span className="text-xs text-gray-600">Routed to:</span>
          <span className="text-sm font-medium text-gray-900">{owner}</span>
          <span className={`text-xs font-medium ${confLabel.color}`}>
            ({confLabel.label} — {confidence}%)
          </span>
        </div>

        {/* Why this person */}
        <p className="text-xs text-gray-500 mb-4">
          <span className="font-medium">Why {owner.split(' ')[0]}?</span> Primary owner of {target.split('/')[0]}, currently on-call
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onAcknowledge}
            className="flex-1 px-3 py-2 bg-[#007a5a] hover:bg-[#006a4e] text-white text-sm font-medium rounded transition-colors"
          >
            Acknowledge
          </button>
          <button
            onClick={onView}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors"
          >
            View Details
          </button>
          <button className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded transition-colors">
            Pause Agent
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>TTI timer started</span>
      </div>
    </div>
  );
}

export function SlackNotificationDark({
  agentName,
  action,
  target,
  confidence,
  owner,
  timestamp,
}: SlackNotificationProps) {
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 85) return { label: 'LIKELY', color: 'text-yellow-400' };
    if (conf >= 60) return { label: 'SUSPECTED', color: 'text-orange-400' };
    return { label: 'POSSIBLE', color: 'text-gray-400' };
  };

  const confLabel = getConfidenceLabel(confidence);

  return (
    <div className="bg-[#1a1d21] rounded-lg border border-[#2c2f33] max-w-md font-sans shadow-2xl">
      {/* Slack Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2c2f33]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Asymp</span>
            <span className="px-1 py-0.5 bg-[#2c2f33] text-[10px] text-gray-400 rounded">APP</span>
          </div>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
      </div>

      {/* Message Content */}
      <div className="p-4">
        {/* Alert Line */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-1 h-full bg-yellow-500 rounded-full self-stretch" />
          <div>
            <p className="text-sm font-medium text-white mb-1">Gated action executed</p>
            <p className="text-sm text-gray-300">{action}</p>
          </div>
        </div>

        {/* Details Block */}
        <div className="bg-[#0d0d14] rounded p-3 mb-3 text-sm">
          <div className="grid grid-cols-[80px_1fr] gap-y-1.5">
            <span className="text-gray-500">Agent</span>
            <span className="text-white font-medium">{agentName}</span>
            <span className="text-gray-500">Target</span>
            <span className="text-gray-300 font-mono text-xs">{target}</span>
          </div>
        </div>

        {/* Attribution with Confidence */}
        <div className="flex items-center gap-2 p-2.5 bg-primary-500/10 border border-primary-500/20 rounded mb-3">
          <span className="text-xs text-gray-400">Routed to</span>
          <span className="text-sm font-medium text-white">{owner}</span>
          <span className={`text-xs font-semibold ${confLabel.color}`}>
            {confLabel.label} — {confidence}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors">
            Acknowledge
          </button>
          <button className="flex-1 px-3 py-2 bg-[#2c2f33] hover:bg-[#3c3f43] text-white text-sm font-medium rounded transition-colors">
            View
          </button>
          <button className="px-3 py-2 bg-[#2c2f33] hover:bg-[#3c3f43] text-white text-sm font-medium rounded transition-colors">
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}
