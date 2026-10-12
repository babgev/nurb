import { useEffect, useRef } from "react";
import type { ChatColumn } from "./chatColumns";
import "./ConversationTabs.css";

export default function ConversationTabs({ tabs, selected, busy, closed, onSelect, onClose, onNew, onReopen }: {
  tabs: ChatColumn[];
  selected: string;
  closed: ChatColumn[];
  onReopen: (id: string) => void;
  busy: Record<string, boolean>;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const tabIds = tabs.map((tab) => `${tab.id}:${tab.model ?? tab.agent}`).join(",");
  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected, tabIds]);
  return <div className="conversation-tabs-wrap">
    <div ref={stripRef} className="conversation-tabs" role="tablist" aria-label="Conversations sharing this project">
      {tabs.map((tab, index) => <div className={`conversation-tab ${tab.id === selected ? "selected" : ""}`} key={tab.id}
        onMouseDown={(event) => { if (event.button === 1) event.preventDefault(); }}
        onAuxClick={(event) => {
          if (event.button !== 1) return;
          event.preventDefault();
          onClose(tab.id);
        }}>
        <button role="tab" tabIndex={tab.id === selected ? 0 : -1} aria-selected={tab.id === selected} aria-label={`${tab.model ?? tab.agent ?? "New chat"}, conversation ${index + 1}${busy[tab.id] ? ", working" : tab.unseen ? ", unread" : ""}`} title={`${tab.model ?? tab.agent ?? "New chat"} · conversation ${index + 1}`} onClick={() => onSelect(tab.id)} onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const offset = event.key === "ArrowRight" ? 1 : -1;
          onSelect(tabs[(index + offset + tabs.length) % tabs.length].id);
          requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.chat:not(.chat-hidden) [role="tab"][aria-selected="true"]')?.focus());
        }}>
          <span className={`conversation-tab-dot ${busy[tab.id] ? "working" : tab.unseen ? "unread" : ""}`} />
          <span className="conversation-tab-name">{tab.model ?? tab.agent ?? "New chat"}</span>
          <span className="conversation-tab-number">{index + 1}</span>
        </button>
        <button className="conversation-tab-close" aria-label={`Close conversation ${index + 1}`} disabled={busy[tab.id]} title={busy[tab.id] ? "Stop the agent before closing this tab" : "Close tab; saved conversation stays in history (⌘W)"} onClick={() => onClose(tab.id)}>×</button>
      </div>)}
    </div>
    {closed.length > 0 && <label className="conversation-history" title="Reopen a closed conversation">
      <span>History</span>
      <select aria-label="Reopen closed conversation" value="" onChange={(event) => { if (event.target.value) onReopen(event.target.value); }}>
        <option value="" disabled>Closed conversations</option>
        {[...closed].reverse().map((tab, index) => <option key={tab.id} value={tab.id}>{tab.model ?? tab.agent ?? "Chat"}{tab.draft?.text ? ` · ${tab.draft.text.slice(0, 60)}` : ` · conversation ${closed.length - index}`}</option>)}
      </select>
    </label>}
    <button className="conversation-tab-add" aria-label="New conversation tab" title="New conversation using the same project files" onClick={onNew}>+</button>
  </div>;
}
