import { CSSProperties, KeyboardEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconChevronDown } from "./Icons";
import "./ModelPicker.css";

export type ConfigChoice = { value: string; name: string; description?: string };
export type ConfigRow = {
  id: string;
  category: string;
  name: string;
  value: string;
  options: ConfigChoice[];
};
export type ModelPickerProvider = {
  id: string;
  label: string;
  loggedIn: boolean | null;
  config: ConfigRow[];
  loading?: boolean;
  error?: string | null;
};

type Props = {
  agent: string;
  providers: ModelPickerProvider[];
  config: ConfigRow[];
  disabled: boolean;
  configuring?: boolean;
  error?: string | null;
  hasConversation?: boolean;
  onSelectModel: (agent: string, value: string) => void | Promise<void>;
  onSelectConfig: (category: string, value: string) => void | Promise<void>;
  onRefresh: (agent?: string) => void | Promise<void>;
  onSignIn: (agent: string) => void | Promise<unknown>;
  onOpen?: () => void;
};

function ProviderIcon({ agent }: { agent: string }) {
  const glyph = { claude: "✳", codex: "›_", gemini: "✦", cursor: "◈", grok: "𝕏" }[agent] ?? "◇";
  return <span className={`model-provider-icon model-provider-${agent}`} aria-hidden="true">{glyph}</span>;
}

function selectedName(row: ConfigRow | undefined) {
  return row?.options.find((option) => option.value === row.value)?.name ?? row?.value;
}

export default function ModelPicker({
  agent, providers, config, disabled, configuring = false, error, hasConversation = false,
  onSelectModel, onSelectConfig, onRefresh, onSignIn, onOpen,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [position, setPosition] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef(false);
  const menuId = useId();
  const activeModel = config.find((row) => row.category === "model");
  const activeDescription = activeModel?.options.find((option) => option.value === activeModel.value)?.description;
  const settings = config.filter((row) => row.category !== "model" && row.options.length > 0);
  const effort = config.find((row) => row.category === "thought_level");
  const label = selectedName(activeModel) ?? "Choose model";
  const locked = disabled || configuring || working;
  const normalizedQuery = query.trim().toLowerCase();
  const catalogs = providers.map((provider) => ({
    ...provider,
    config: provider.id === agent ? config : provider.config,
  }));
  const modelGroups = catalogs.map((provider) => {
    const row = provider.config.find((option) => option.category === "model");
    const effortName = selectedName(provider.config.find((option) => option.category === "thought_level"));
    return (row?.options ?? [])
      .filter((model) => `${provider.label} ${model.name} ${model.value} ${model.description ?? ""}`.toLowerCase().includes(normalizedQuery))
      .map((model) => ({ provider, model, effortName }));
  });
  // A large catalog must not push every other provider below the fold.
  const models = Array.from({ length: Math.max(0, ...modelGroups.map((group) => group.length)) }, (_, index) =>
    modelGroups.flatMap((group) => group[index] ? [group[index]] : []),
  ).flat();
  const statuses = catalogs.filter((provider) =>
    (provider.loading || provider.error || provider.loggedIn === false ||
      !provider.config.some((row) => row.category === "model" && row.options.length > 0)) &&
    (!normalizedQuery || provider.label.toLowerCase().includes(normalizedQuery)),
  );

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(352, window.innerWidth - 24);
      setPosition({
        width,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        bottom: window.innerHeight - rect.top + 8,
        maxHeight: Math.min(560, Math.max(100, rect.top - 20)),
      });
    }
    place();
    searchRef.current?.focus();
    const clickAway = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", clickAway);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", clickAway);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  async function act(action: () => void | Promise<unknown>, dismiss = false) {
    if (actionRef.current) return;
    actionRef.current = true;
    setWorking(true);
    setActionError(null);
    try {
      await action();
      if (dismiss) close();
    } catch (cause) {
      setActionError(String(cause));
    } finally {
      actionRef.current = false;
      setWorking(false);
    }
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if ((event.target as HTMLElement).tagName === "SELECT") return;
    const choices = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button[data-model]:not(:disabled)") ?? []);
    if (!choices.length) return;
    const index = choices.indexOf(document.activeElement as HTMLButtonElement);
    event.preventDefault();
    if (event.key === "ArrowUp" && index === 0) searchRef.current?.focus();
    else choices[event.key === "ArrowDown" ? (index + 1) % choices.length : (index < 0 ? choices.length - 1 : index - 1)]?.focus();
  }

  return (
    <div className="model-picker">
      <button
        ref={triggerRef}
        type="button"
        className="model-picker-trigger"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="dialog"
        aria-label={`Choose model. Current: ${label}${selectedName(effort) ? `, ${selectedName(effort)} effort` : ""}`}
        title={`${label}${selectedName(effort) ? ` · ${selectedName(effort)}` : ""}`}
        onClick={() => {
          if (open) close();
          else {
            setQuery("");
            setActionError(null);
            setOpen(true);
            onOpen?.();
          }
        }}
      >
        <ProviderIcon agent={agent} />
        <span className="model-picker-trigger-label">{label}</span>
        <IconChevronDown />
      </button>
      {open && createPortal(
        <div ref={menuRef} id={menuId} role="dialog" aria-label="Choose model" className="model-picker-menu" style={position} onKeyDown={navigate}>
          <div className="model-picker-search">
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models" aria-label="Search models" />
            {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>×</button>}
          </div>
          <div className="model-picker-list" aria-label="Models">
            {models.map(({ provider, model, effortName }) => {
              const selected = provider.id === agent && model.value === activeModel?.value;
              return (
                <button
                  key={`${provider.id}:${model.value}`}
                  type="button"
                  data-model
                  className={`model-picker-option${selected ? " selected" : ""}`}
                  disabled={locked || provider.loggedIn === false}
                  aria-pressed={selected}
                  aria-label={`${model.name}, ${provider.label}${selected ? ", selected" : ""}`}
                  title={[model.description, `${provider.label} · ${model.value}`].filter(Boolean).join("\n")}
                  onClick={() => act(() => onSelectModel(provider.id, model.value), true)}
                >
                  <ProviderIcon agent={provider.id} />
                  <span className="model-picker-option-content">
                    <span className="model-picker-model-name">{model.name}</span>
                    <span className="model-picker-provider-label">{provider.label}{effortName ? ` · ${effortName}` : ""}</span>
                  </span>
                  {selected && <IconCheck size={15} className="model-picker-check" />}
                </button>
              );
            })}
            {models.length === 0 && statuses.length === 0 && <p className="model-picker-empty">No models match “{query}”.</p>}
            {statuses.map((provider) => (
              <div key={provider.id} className="model-picker-provider-status">
                <ProviderIcon agent={provider.id} />
                <div>
                  <span>{provider.label}</span>
                  <p title={provider.error ?? undefined}>{provider.loading ? "Loading models…" : provider.loggedIn === false ? "Sign in to see available models" : provider.error ? "Could not load models" : "Models have not loaded yet"}</p>
                </div>
                {!provider.loading && <button type="button" disabled={locked} onClick={() => act(() => provider.loggedIn === false ? onSignIn(provider.id) : onRefresh(provider.id))}>{provider.loggedIn === false ? "Sign in" : provider.error ? "Retry" : "Load"}</button>}
              </div>
            ))}
          </div>
          {settings.length > 0 && <div className="model-picker-settings">
            {settings.map((row) => (
              <label className="model-picker-setting" key={row.category}>
                <span>{row.name}</span>
                <select value={row.value} disabled={locked} onChange={(event) => act(() => onSelectConfig(row.category, event.target.value))}>
                  {row.options.map((option) => <option key={option.value} value={option.value}>{option.name}</option>)}
                </select>
              </label>
            ))}
          </div>}
          <div className="model-picker-footer">
            {activeDescription && <p className="model-picker-description">{activeDescription}</p>}
            <p>{disabled ? "Wait for this turn to finish to change models." : hasConversation ? "Changing providers starts a new conversation. This one is kept." : "Choose a model from any connected provider."}</p>
            {(actionError || error) && <p className="model-picker-error" role="alert">{actionError || error}</p>}
            <button type="button" disabled={locked || providers.some((provider) => provider.loading)} onClick={() => act(() => onRefresh())}>Refresh models</button>
          </div>
        </div>, document.body,
      )}
    </div>
  );
}
