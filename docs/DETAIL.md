# Kimi Coding models

Kimi Coding publishes its model catalog at `https://api.kimi.com/coding/v1/models`, but
DeepSeek Harness answers a catalog route from the static model catalog bundled with
`@deepseek-ai/dsh-llm-pi-ai`. A model published after that bundle was built therefore stays
invisible in model selectors until the profile declares it.

This plugin keeps the `kimi-coding` route aligned with the live catalog through either a
Settings page or the `kimi_coding_models` agent tool. Both call the same Host operation.
It also reads the current subscription quota through the `kimi_coding_usage` tool, or shows
it on the Settings page — the panel renders the cached reading as soon as it opens and
refreshes on demand through **Refresh quota**.

## Subscription quota

The quota panel reads `https://api.kimi.com/coding/v1/usages` with the same credential
reference and normalizes two windows:

- the **5-hour rolling window**, with its used percentage, reset time, a live countdown to that reset, a
  sampled mini trend, and a pace-based estimate of when the window fills;
- the **7-day quota**, with the same facts.

Every successful read appends a sample to a local history file
(`~/.dsh/kimi-coding-quota-history/<context>.json`, seven-day retention, one per minute at most).
Each context gets its own file, isolated per profile, the full quota endpoint (including its query),
and credential reference — the context id is a hash of those identifiers, so no API key or URL
credential is persisted in plaintext; a context with no history starts empty, and separate Host
processes never share one writable file. The returned curve overlays the freshest reading even
between disk samples, so a forced refresh never shows a stale endpoint. The trend view shows the newest samples as a
sparkline and projects the hours left until each window reaches 100% from the pace of the last two hours
of the current quota cycle. A projection never exceeds the window's own reset time: when the pace would
outrun the reset, no countdown is shown for that window. The projection needs at least six recent samples
and a clearly rising slope, and appears in the panels, the chat popover, and the `kimi_coding_usage`
report. Quota reads share a 60-second cache and a single in-flight request per context; pass
`force: true` to `kimi_coding_usage` (or use the panels' refresh actions) to bypass both. Cancelling one
caller never aborts the shared request the other callers are waiting on.

The endpoint is not a stable public API contract, so malformed or changed responses produce an
error rather than invented values. Only normalized quota fields leave the Host. Upstream user
IDs, subscription IDs, wallet details, and other account metadata are discarded. Reading quota
is read-only and does not change the model route.

## Regional endpoints

The defaults target the China Kimi Code platform (`api.kimi.com`). The **Platform** preset in
Settings fills all three fields for the chosen platform at once; endpoints remain individually
editable for custom proxies. On the overseas platform, point all three settings at the
`api.kimi.ai` host instead:

| Setting | China (default) | Overseas |
|---|---|---|
| Catalog endpoint | `https://api.kimi.com/coding/v1/models` | `https://api.kimi.ai/coding/v1/models` |
| Quota endpoint | `https://api.kimi.com/coding/v1/usages` | `https://api.kimi.ai/coding/v1/usages` |
| Route base URL | `https://api.kimi.com/coding/v1` | `https://api.kimi.ai/coding/v1` |

The route base URL is written only when the route declares none. If the profile's `kimi-coding`
route already carries a `baseURL` (as the shipped example does), change that row in the profile
patch to the overseas host as well; subscription credentials from the two consoles are not
interchangeable, so the credential reference must hold an overseas-platform key.

## Chat-window quota

While the current conversation uses the `kimi-coding` provider, a compact quota pill appears at
the right side of the chat input. It shows the used percentage for the 5-hour and 7-day windows.
Selecting it opens the same normalized details as the Settings page, including reset times, a live
countdown to each reset, and a manual refresh action.

The pill reads once when it appears and then once per minute while the page is visible. Hidden
pages skip background reads. Requests are bounded to 30 seconds and cancelled on component
cleanup, so a stalled request cannot lock later refreshes. A failed refresh retains the previous
result with an explicit stale notice. Switching away from `kimi-coding` hides the pill. **Show quota in the chat window** in
Settings controls this integration. **Chat quota style** offers a bordered badge, plain text,
compact dual progress bars, a progress ring, a single progress bar, or a status dot that turns
warning-colored from 70% and error-colored from 90% rolling usage; the ring, bar, and dot styles
show the rolling window and keep the weekly figure in the popover and tooltip. **Chat quota
border** switches the bordered pill on or off (plain text always stays borderless), with a live
preview before saving.

## Settings page

Open **Settings → Kimi Coding**.

- **Check for updates** reads the live catalog and compares it with the models this profile
  serves. Opening the page performs no model-catalog request. The quota card below prefers the
  cached reading and contacts the quota endpoint only when the cache is missing or expired.
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

### Pinned models

Each row in **Model limits** carries a pin toggle. A pinned model survives synchronization even when the
live catalog no longer lists it: a configured entry keeps its fields, a served-only model drops to a bare
entry, and neither appears in the removal report. The sync result names the pinned survivors, and the
removal confirmation does not cover them. Pinning records the model id in the plugin configuration.

### Per-model limits

**Model limits** lists the models in the profile's `kimi-coding` route — no network request is
needed. Each row edits that entry's explicit **context window (maximum input)** and **maximum
output tokens**, and writes the route through the configuration editor as soon as **Save model
limits** is selected. An empty field removes that explicit value, so the entry inherits the
installed catalog's value again — which can predate the bundled `pi-ai` 1.6.0 snapshot the
placeholder shows. **Reload** rereads
the route after a synchronization or an external edit. Synchronization keeps every existing
entry's configured capacities, so limits set here survive later syncs. Newly discovered models
still start from the listing, the `pi-ai` 1.6.0 snapshot, or the global **Default output tokens**
fallback.

The settings area edits the plugin's persisted profile configuration:

| Field | Default | Meaning |
|---|---|---|
| Platform | `china` | Preset whose endpoints fill the three fields below when selected: China (`api.kimi.com`) or overseas (`api.kimi.ai`) |
| Catalog endpoint | `https://api.kimi.com/coding/v1/models` | Live listing to read |
| Route base URL | `https://api.kimi.com/coding/v1` | Written only when the route declares none |
| Quota endpoint | `https://api.kimi.com/coding/v1/usages` | Subscription quota listing to read |
| Credential reference | `KIMI_CODING_API_KEY` | Credential name, never the secret key itself |
| Default output tokens | `131072` | Fallback output cap for a new model whose family is unknown and whose listing discloses none |
| Sync when DSH starts | off | One background sync on the next plugin activation |
| Interval sync (minutes) | `0` | One background sync at most once per interval while DSH runs; `0` disables it, otherwise 1–10080 |
| Show quota in the chat window | on | Compact model-aware quota pill with one-minute refresh |
| Chat quota style | `badge` | Badge, plain text, dual progress bars, progress ring, single progress bar, or status dot |
| Chat quota border | on | Draws the bordered pill around the indicator; plain text stays borderless |

For a newly configured model, its limits are taken from the live listing first, then from the
`pi-ai` 1.6.0 Kimi Coding snapshot bundled with this plugin, and finally from the default output
token field for an unknown family.

### Interval synchronization

`Interval sync (minutes)` runs the same Host operation as the startup sync, with the same route
replacement semantics, while the DSH Host keeps running. The scheduler wakes once a minute and
syncs only when the configured interval has elapsed, so saved intervals take effect without a
plugin reload. The first tick after enabling an interval runs one sync immediately; after that,
attempts are spaced by the interval. At most one sync — interval, startup, Settings, or agent
tool — runs at a time, and the scheduler skips a tick when another one is in flight. Interval
synchronization is a background write: unlike the Settings page it has no removal confirmation,
so a model Kimi stops publishing is dropped silently on the next interval sync. A listing with an invalid model ID stops the sync. An empty listing that would remove models
requires review and confirmation in Settings, including when the request originated from an agent or startup sync. A successful
write is logged; failures are logged and retried on the next interval.

Changes are staged until **Save settings**. Remote endpoints require HTTPS. Local HTTP proxies can use localhost, a 127.x.x.x address, or [::1].
Catalog reports and request errors show only the endpoint origin and path. Validation rejects malformed
credential names, non-positive output caps, and an interval outside 0–10080. Saves carry the
draft's starting revision: a concurrent change produces a conflict notice and preserves the
draft; only a second explicit save may overwrite it. **Discard changes** drops the staged edits.
Saving a new catalog endpoint, route base URL, credential reference, or output-token default
invalidates an earlier model check. Saving a new quota endpoint or credential reference clears
the old quota result so it cannot be mistaken for usage read from the new context.

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

List the configured models and their explicit limits:

```text
kimi_coding_model_settings({})
```

Set or clear one model's limits (a null field restores catalog inheritance):

```text
kimi_coding_model_settings({ models: [{ id: "k3.1-pro", contextWindow: 1048576, maxTokens: 1048576 }] })
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
- The live listing discloses no output cap. For the models known to this plugin version, a newly
  discovered entry therefore starts from the limits published by `@earendil-works/pi-ai` 1.6.0:
  `k3` and `k3.1-pro*` use a `1048576` context and output ceiling, `k3-256k` uses `262144`, and
  `kimi-for-coding*` uses a `32768` output cap. Kimi's documented `max_completion_tokens` default
  is `131072` with a `1048576` maximum; the default token field below remains the fallback for an
  unknown family.
- A model configured as a bare `{ id }` entry inherits the installed catalog's context window
  and output cap until **Model limits** writes explicit values. The per-model editor lists only
  models already present in the route; synchronize the live catalog first to add a missing model.
- Interval synchronization runs only while the DSH Host is running, with up to one minute of
  scheduling precision; a stopped Host performs no background sync.
- A home patch or command-line overlay can override the route. In that case the configuration
  editor refuses the write and the page reports the failure instead of claiming success.
- A newly discovered model uses the compatibility switches known by this plugin. A future model
  needing different switches can be adjusted in its profile entry after synchronization.
