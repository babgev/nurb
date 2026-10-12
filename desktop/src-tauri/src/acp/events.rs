use agent_client_protocol::schema::v1::{
    ContentBlock, PermissionOption, RequestPermissionRequest, SessionUpdate,
};
use agent_client_protocol::schema::MaybeUndefined;
use serde::Serialize;
use tauri::ipc::Channel;

/// What the webview receives. Mirrors ChatEvent in src/Chat.tsx.
#[derive(Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub(crate) enum ChatEvent {
    Activity {
        phase: String,
    },
    UserText {
        text: String,
    },
    SessionInfo {
        title: Option<String>,
    },
    Note {
        text: String,
    },
    AgentText {
        text: String,
    },
    AgentThought {
        text: String,
    },
    ToolCall {
        id: String,
        title: String,
        kind: String,
        status: String,
        /// The tool's raw input (the command, the file), for the card's
        /// expandable detail.
        #[serde(skip_serializing_if = "Option::is_none")]
        input: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        output: Option<String>,
    },
    ToolCallUpdate {
        id: String,
        kind: Option<String>,
        title: Option<String>,
        status: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        input: Option<String>,
        /// Replaces earlier output (ACP update fields replace, not append).
        #[serde(skip_serializing_if = "Option::is_none")]
        output: Option<String>,
    },
    Plan {
        entries: Vec<PlanItem>,
    },
    PermissionRequest {
        id: u32,
        title: String,
        options: Vec<PermissionChoice>,
    },
    PermissionResolved {
        id: u32,
    },
    SessionError {
        message: String,
    },
}

#[derive(Clone, Serialize)]
pub(crate) struct PlanItem {
    content: String,
    status: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PermissionChoice {
    option_id: String,
    name: String,
    kind: String,
}

/// The opening of the context block send_prompt appends to every prompt;
/// replayed transcripts hide it because it is framing, not user text.
const CONTEXT_PREFIX: &str = "Context: nurb project \"";

pub(super) fn forward(channel: &Channel<ChatEvent>, update: SessionUpdate, replaying: bool) {
    let event = match update {
        // Live turns render the composer text locally; only a session/load
        // replay carries user chunks worth forwarding. The app's own context
        // block is framing, not something the user typed, so it stays out of
        // the restored transcript. Claude replays each content block as its
        // own chunk; Codex merges the whole prompt into one chunk, so the
        // block must also be stripped off the end of merged text.
        SessionUpdate::UserMessageChunk(chunk) if replaying => text_of(chunk.content)
            .and_then(replayed_user_text)
            .map(|text| ChatEvent::UserText { text }),
        SessionUpdate::SessionInfoUpdate(info) => Some(ChatEvent::SessionInfo {
            title: match info.title {
                MaybeUndefined::Value(title) => Some(title),
                _ => None,
            },
        }),
        SessionUpdate::AgentMessageChunk(chunk) => {
            text_of(chunk.content).map(|text| ChatEvent::AgentText { text })
        }
        SessionUpdate::AgentThoughtChunk(chunk) => {
            text_of(chunk.content).map(|text| ChatEvent::AgentThought { text })
        }
        SessionUpdate::ToolCall(call) => Some(ChatEvent::ToolCall {
            id: wire_string(&call.tool_call_id),
            title: call.title,
            kind: wire_string(&call.kind),
            status: wire_string(&call.status),
            input: input_of(call.raw_input.as_ref()).or_else(|| locations_of(&call.locations)),
            output: output_of(&call.content, call.raw_output.as_ref()),
        }),
        SessionUpdate::ToolCallUpdate(update) => Some(ChatEvent::ToolCallUpdate {
            id: wire_string(&update.tool_call_id),
            kind: update.fields.kind.as_ref().map(wire_string),
            title: update.fields.title,
            status: update.fields.status.as_ref().map(wire_string),
            input: input_of(update.fields.raw_input.as_ref())
                .or_else(|| locations_of(update.fields.locations.as_deref().unwrap_or(&[]))),
            output: output_of(
                update.fields.content.as_deref().unwrap_or(&[]),
                update.fields.raw_output.as_ref(),
            ),
        }),
        SessionUpdate::Plan(plan) => Some(ChatEvent::Plan {
            entries: plan
                .entries
                .iter()
                .map(|entry| PlanItem {
                    content: entry.content.clone(),
                    status: wire_string(&entry.status),
                })
                .collect(),
        }),
        // usage_update, available_commands_update (an 85KB burst right after
        // the first prompt), mode/config/info updates: nothing to render yet.
        _ => None,
    };
    if let Some(event) = event {
        mirror(&event);
        let _ = channel.send(event);
    }
}

/// Dev diagnostics: the webview's console is unreachable without an
/// interactive Safari, so every chat event mirrors to stderr. Call sites that
/// send on the channel directly (permissions, notes, session errors) must
/// mirror too, or log-driven debugging goes blind exactly when it matters.
pub(crate) fn mirror(event: &ChatEvent) {
    #[cfg(debug_assertions)]
    {
        use std::io::Write;
        let _ = writeln!(
            std::io::stderr(),
            "[chat-event] {}",
            serde_json::to_string(event).unwrap_or_default()
        );
    }
    #[cfg(not(debug_assertions))]
    let _ = event;
}

fn text_of(content: ContentBlock) -> Option<String> {
    match content {
        ContentBlock::Text(text) => Some(text.text),
        _ => None,
    }
}

/// Expanded cards show raw material, but the webview does not need 85KB of
/// build output to make the point.
const DETAIL_CAP: usize = 20_000;

fn capped(mut text: String) -> Option<String> {
    if text.trim().is_empty() {
        return None;
    }
    if text.len() > DETAIL_CAP {
        let mut end = DETAIL_CAP;
        while !text.is_char_boundary(end) {
            end -= 1;
        }
        text.truncate(end);
        text.push_str("\n… (truncated)");
    }
    Some(text)
}

/// What a tool call was given, for the card's expandable detail: the command
/// for terminal calls (both adapters' shapes), else the file the well-known
/// path keys name. The full raw input can carry an entire file's content, so
/// anything else stays out.
fn locations_of(locations: &[agent_client_protocol::schema::v1::ToolCallLocation]) -> Option<String> {
    capped(locations.iter().map(|location| match location.line {
        Some(line) => format!("{}:{line}", location.path.display()),
        None => location.path.display().to_string(),
    }).collect::<Vec<_>>().join("\n"))
}

fn input_of(raw: Option<&serde_json::Value>) -> Option<String> {
    if let Some(command) = super::policy::command_of(raw) {
        return capped(command);
    }
    let raw = raw?;
    for key in ["file_path", "path", "abs_path", "notebook_path", "pattern", "url", "description", "query"] {
        if let Some(value) = raw.get(key).and_then(|v| v.as_str()) {
            return capped(value.to_string());
        }
    }
    None
}

/// What a tool call produced: its text content blocks, else the string-ish
/// parts of raw output. File edits include the reported before/after contents.
fn output_of(
    content: &[agent_client_protocol::schema::v1::ToolCallContent],
    raw: Option<&serde_json::Value>,
) -> Option<String> {
    use agent_client_protocol::schema::v1::ToolCallContent;
    let texts: Vec<String> = content
        .iter()
        .filter_map(|item| match item {
            ToolCallContent::Content(block) => text_of(block.content.clone()),
            ToolCallContent::Diff(diff) => Some(format!("File: {}\nBefore:\n{}\nAfter:\n{}", diff.path.display(), diff.old_text.as_deref().unwrap_or("(new file)"), diff.new_text)),
            _ => None,
        })
        .collect();
    if !texts.is_empty() {
        return capped(texts.join("\n"));
    }
    match raw? {
        serde_json::Value::String(text) => capped(text.clone()),
        object => {
            let parts: Vec<String> = ["output", "stdout", "stderr", "error"]
                .iter()
                .filter_map(|key| object.get(key).and_then(|v| v.as_str()))
                .map(str::to_string)
                .collect();
            capped(parts.join("\n"))
        }
    }
}

/// What a replayed user chunk shows in the transcript, with the app's context
/// framing removed wherever the adapter put it.
fn replayed_user_text(text: String) -> Option<String> {
    let kept = match text.find(CONTEXT_PREFIX) {
        Some(0) => return None,
        Some(at) => text[..at].trim_end().to_string(),
        None => text,
    };
    Some(kept).filter(|text| !text.is_empty())
}

pub(super) fn permission_title(agent_label: &str, request: &RequestPermissionRequest) -> String {
    request
        .tool_call
        .fields
        .title
        .clone()
        .unwrap_or_else(|| format!("{agent_label} wants to use a tool"))
}

pub(super) fn permission_choice(option: &PermissionOption) -> PermissionChoice {
    PermissionChoice {
        option_id: wire_string(&option.option_id),
        name: option.name.clone(),
        kind: wire_string(&option.kind),
    }
}

/// The wire (serde) spelling of a schema value: ids and enums serialize as
/// plain strings, which is exactly what the frontend speaks.
pub(super) fn wire_string<T: Serialize>(value: &T) -> String {
    match serde_json::to_value(value) {
        Ok(serde_json::Value::String(text)) => text,
        Ok(other) => other.to_string(),
        Err(_) => String::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::{input_of, output_of, replayed_user_text, locations_of};
    use agent_client_protocol::schema::v1::ToolCallContent;

    #[test]
    fn cards_get_the_command_or_file_in_and_the_text_out() {
        // Claude's terminal shape and its file shape.
        let command = serde_json::json!({ "command": "nurb check lid", "timeout": 120 });
        assert_eq!(input_of(Some(&command)).as_deref(), Some("nurb check lid"));
        let edit = serde_json::json!({ "file_path": "/p/parts/lid.py", "content": "whole file" });
        assert_eq!(input_of(Some(&edit)).as_deref(), Some("/p/parts/lid.py"));
        assert_eq!(input_of(None), None);

        // Text and file edits are both visible in expanded tool details.
        let content: Vec<ToolCallContent> = serde_json::from_value(serde_json::json!([
            { "type": "content", "content": { "type": "text", "text": "3 findings" } },
            { "type": "diff", "path": "/p/parts/lid.py", "newText": "code" }
        ]))
        .unwrap();
        let output = output_of(&content, None).unwrap();
        assert!(output.starts_with("3 findings"));
        assert!(output.contains("File: /p/parts/lid.py\nBefore:\n(new file)\nAfter:\ncode"));

        // With no blocks, the string-ish parts of raw output.
        let raw = serde_json::json!({ "stdout": "built in 2.1s", "exitCode": 0 });
        assert_eq!(output_of(&[], Some(&raw)).as_deref(), Some("built in 2.1s"));
        assert_eq!(output_of(&[], Some(&serde_json::json!({ "exitCode": 0 }))), None);
        assert_eq!(output_of(&[], None), None);
    }

    #[test]
    fn tool_locations_and_subagent_descriptions_are_visible() {
        use agent_client_protocol::schema::v1::ToolCallLocation;
        let location = ToolCallLocation::new("/project/parts/lid.py").line(12);
        assert_eq!(locations_of(&[location]).as_deref(), Some("/project/parts/lid.py:12"));
        assert_eq!(input_of(Some(&serde_json::json!({ "description": "Inspect geometry" }))).as_deref(), Some("Inspect geometry"));
    }

    #[test]
    fn detail_is_capped_not_forwarded_whole() {
        let huge = serde_json::Value::String("x".repeat(100_000));
        let out = output_of(&[], Some(&huge)).unwrap();
        assert!(out.len() < 25_000);
        assert!(out.ends_with("… (truncated)"));
    }

    #[test]
    fn replay_hides_the_context_block_in_both_adapter_shapes() {
        // Claude replays the block as its own chunk.
        assert_eq!(
            replayed_user_text("Context: nurb project \"box\". etc".into()),
            None
        );
        // Codex merges the whole prompt into one chunk.
        assert_eq!(
            replayed_user_text("make it 50mm wide Context: nurb project \"box\". etc".into())
                .as_deref(),
            Some("make it 50mm wide")
        );
        assert_eq!(
            replayed_user_text("plain user text".into()).as_deref(),
            Some("plain user text")
        );
        assert_eq!(replayed_user_text(String::new()), None);
    }
}
