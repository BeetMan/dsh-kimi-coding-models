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

## Settings page

Open **Settings → Kimi Coding**.

- **Check for updates** reads the live catalog and compares it with the models this profile
  serves. Opening the page alone performs no network request.
- **Sync models now** is enabled after a check. It writes the complete live list into the
  profile's `llm-pi-ai` row through the configuration editor. The route reloads, and the new
  models become selectable. The page always discloses that synchronization replaces the route
  list; when models will be removed, it requires a second explicit confirmation.
- The result lists every published model, marks missing or newly added models, names models
  no longer published, and shows the check time and actionable failures.

The settings area edits the plugin's persisted profile configuration:

| Field | Default | Meaning |
|---|---|---|
| Catalog endpoint | `https://api.kimi.com/coding/v1/models` | Live listing to read |
| Route base URL | `https://api.kimi.com/coding/v1` | Written only when the route declares none |
| Quota endpoint | `https://api.kimi.com/coding/v1/usages` | Subscription quota listing to read |
| Credential reference | `KIMI_CODING_API_KEY` | Credential name, never the secret key itself |
| Default output tokens | `32768` | Output cap when a new model's listing discloses none |
| Sync when DSH starts | off | One background sync on the next plugin activation |

Changes are staged until **Save settings**. Validation rejects non-HTTP(S) endpoints, malformed
credential names, and non-positive output caps. Saves carry the draft's starting revision: a
concurrent change produces a conflict notice and preserves the draft; only a second explicit
save may overwrite it. **Discard changes** drops the staged edits.

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

Existing route entries are preserved verbatim. A model already described by the installed
catalog stays a bare `{ id }` entry, retaining catalog-owned capacities and compatibility. A
newly discovered model receives a complete entry from the listing, including context window,
input modalities, reasoning efforts, and Kimi's OpenAI Chat Completions compatibility fields.

## Limitations

- Synchronization replaces the route's model list with the complete live list, so a model Kimi
  stops publishing is removed on the next sync.
- Startup synchronization is not an interval scheduler; it runs once per plugin activation.
- A home patch or command-line overlay can override the route. In that case the configuration
  editor refuses the write and the page reports the failure instead of claiming success.
- A newly discovered model uses the compatibility switches known by this plugin. A future model
  needing different switches can be adjusted in its profile entry after synchronization.
