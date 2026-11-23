# Kimi Coding models

Kimi Coding publishes its model catalog at `https://api.kimi.com/coding/v1/models`, but
DeepSeek Harness answers a catalog route from the static model catalog bundled with
`@deepseek-ai/dsh-llm-pi-ai`. A model published after that bundle was built therefore stays
invisible in model selectors until the profile declares it.

This plugin keeps the `kimi-coding` route aligned with the live catalog through either a
Settings page or the `kimi_coding_models` agent tool. Both call the same Host operation.
It also reads the current subscription quota through the `kimi_coding_usage` tool or the
Settings page's **Refresh quota** action.

## Subscription quota

The quota panel reads `https://api.kimi.com/coding/v1/usages` with the same credential
reference and normalizes two windows:

- the **5-hour rolling window**, with its used percentage, remaining amount, and reset time;
- the **7-day quota**, with the same facts.

The endpoint is not a stable public API contract, so malformed or changed responses produce an
error rather than invented values. Only normalized quota fields leave the Host. Upstream user
IDs, subscription IDs, wallet details, and other account metadata are discarded. Reading quota
is read-only and does not change the model route.

## Chat-window quota

While the current conversation uses the `kimi-coding` provider, a compact quota pill appears at
the right side of the chat input. It shows the used percentage for the 5-hour and 7-day windows.
Selecting it opens the same normalized details as the Settings page, including remaining amounts,
reset times, and a manual refresh action.

The pill reads once when it appears and then once per minute while the page is visible. Hidden
pages skip background reads. Requests are bounded to 30 seconds and cancelled on component
cleanup, so a stalled request cannot lock later refreshes. A failed refresh retains the previous
result with an explicit stale notice. Switching away from `kimi-coding` hides the pill. **Show quota in the chat window** in
Settings controls this integration. **Chat quota style** offers a bordered badge, plain text, or
compact dual progress bars, with a live preview before saving.

## Settings page

Open **Settings → Kimi Coding**.

- **Check for updates** reads the live catalog and compares it with the models this profile
  serves. Opening the page alone performs no network request.
- **Sync models now** is enabled after a check. It writes the complete live list into the
  profile's `llm-pi-ai` row through the configuration editor. The route reloads, and the new
  models become selectable. The page always discloses that synchronization replaces the route
  list; when models will be removed, it requires a second explicit confirmation. That confirmation
  is bound to the checked endpoint, catalog, configured route, and served-model snapshot. If any
  of them changes, synchronization returns the latest plan without writing and requires a fresh review.
- The result lists every published model, marks missing or newly added models, and names every
  configured or currently served model that the write would remove. The result also displays its
  catalog endpoint and check time. Catalog requests are bounded to 30 seconds and are cancelled
  when the panel unmounts or its synchronization settings change.

The settings area edits the plugin's persisted profile configuration:

| Field | Default | Meaning |
|---|---|---|
| Catalog endpoint | `https://api.kimi.com/coding/v1/models` | Live listing to read |
| Route base URL | `https://api.kimi.com/coding/v1` | Written only when the route declares none |
| Quota endpoint | `https://api.kimi.com/coding/v1/usages` | Subscription quota listing to read |
| Credential reference | `KIMI_CODING_API_KEY` | Credential name, never the secret key itself |
| Default output tokens | `32768` | Output cap when a new model's listing discloses none |
| Sync when DSH starts | off | One background sync on the next plugin activation |
| Show quota in the chat window | on | Compact model-aware quota pill with one-minute refresh |
| Chat quota style | `badge` | Bordered badge, plain text, or dual progress bars |

Changes are staged until **Save settings**. Validation rejects non-HTTP(S) endpoints, malformed
credential names, and non-positive output caps. Saves carry the draft's starting revision: a
concurrent change produces a conflict notice and preserves the draft; only a second explicit
save may overwrite it. **Discard changes** drops the staged edits. Saving a new catalog endpoint,
route base URL, credential reference, or output-token default invalidates an earlier model check.
Saving a new quota endpoint or credential reference clears the old quota result so it cannot be
mistaken for usage read from the new context.

## Agent tool

Check without writing:

```text
kimi_coding_models({})
```

Apply the live catalog:

```text
kimi_coding_models({ apply: true })
```

Read subscription quota:

```text
kimi_coding_usage({})
```

Existing route entries keep their configured fields. Their display names are normalized to a
single `Kimi` prefix (for example, `K3.1 Pro` becomes `Kimi K3.1 Pro`), including on models
written by an earlier plugin version. A model already described by the installed catalog without
a configured name stays a bare `{ id }` entry, retaining catalog-owned capacities and compatibility. A
newly discovered model receives a complete entry from the listing, including context window,
input modalities, reasoning efforts, and Kimi's OpenAI Chat Completions compatibility fields.

## Limitations

- Synchronization replaces the route's model list with the complete live list, so a model Kimi
  stops publishing is removed on the next sync.
- The live listing discloses no output cap, so a newly discovered model starts at the configured
  default output tokens (32768). Kimi documents a `max_completion_tokens` default of 131072 for the
  K3 and K3.1 families, so raise that setting before syncing one of those models if you want the
  documented cap.
- Startup synchronization is not an interval scheduler; it runs once per plugin activation.
- A home patch or command-line overlay can override the route. In that case the configuration
  editor refuses the write and the page reports the failure instead of claiming success.
- A newly discovered model uses the compatibility switches known by this plugin. A future model
  needing different switches can be adjusted in its profile entry after synchronization.
