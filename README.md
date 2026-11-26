# Kimi Coding models for DeepSeek Harness

A DeepSeek Harness bundle that keeps the `kimi-coding` route aligned with Kimi Coding's live model catalog and reads the current subscription quota.

## Features

- **Settings → Kimi Coding** page with manual **Check for updates** and **Sync models now** actions.
- Optional **interval synchronization**: one background sync per configured interval (1–10080 minutes; `0` disables it) while DSH runs, alongside the existing startup sync.
- Live model comparison, newly added and removed model reporting, actionable errors, and consistent `Kimi`-prefixed selector names.
- **Per-model limits**: set the context window (maximum input) and output cap for each model in the route; leave a field empty to inherit the `pi-ai` 1.6.0 default. Synchronization preserves explicit limits, and a per-model pin keeps user-added models even when the catalog drops them.
- Snapshot-bound removal confirmation, complete configured/served removal reporting, and bounded cancellable catalog requests.
- **5-hour rolling** and **7-day** subscription quota display with used percentage, reset time, a live countdown, a sampled mini trend, and a pace-based exhaustion estimate.
- A compact **chat-window quota pill** while the conversation uses `kimi-coding`, with a detail popover, manual refresh, and one-minute automatic refresh while visible.
- Six persisted pill styles — **badge**, **plain text**, **dual progress bars**, **progress ring**, **single progress bar**, and **status dot** (colored by usage) — plus an independent border toggle, with live previews in Settings.
- Agent tools: `kimi_coding_models`, `kimi_coding_usage`, and `kimi_coding_model_settings`.
- Persisted settings for model and quota endpoints, route base URL, credential reference, default output tokens, startup synchronization, and chat-quota visibility.
- English and Chinese UI.

The UI and tools call the same Host operations. Model changes are saved through DSH's configuration editor; quota reads never modify configuration.

## Requirements

- DeepSeek Harness `>= 0.2.2-rc.5`
- A profile using `@deepseek-ai/dsh-llm-pi-ai` with a `kimi-coding` route
- A Kimi Coding subscription credential referenced by `KIMI_CODING_API_KEY` (or your configured reference)

## Installation

**From GitHub** (available now; the package has no build step):

```sh
dsh plugin --profile <profile> add github:BeetMan/dsh-kimi-coding-models
```

**From npm** (after this plugin is published):

```sh
dsh plugin --profile <profile> add dsh-kimi-coding-models
```

`--profile` is required: replace `<profile>` with the profile you run (`desktop` for the
desktop app, `web` for `dsh web`). The command installs and enables the bundle in one step;
restart DeepSeek Harness (or `dsh web`) afterwards.

**Without the command line:** open **Settings → Plugins → Add plugin**, enter the package name
or the GitHub source above as the install source, then choose **Install** and **Enable now**.

**During development**, install this directory through **Plugins → Add plugin** in DeepSeek Harness, or with the plugin manager's local-directory bundle installation.

## Usage

Open **Settings → Kimi Coding**:

1. Select **Check for updates** to compare the live catalog without writing.
2. Select **Sync models now** to write every published model into the route configuration. If the sync removes models no longer published, review the warning and confirm it explicitly.
3. Select **Refresh quota** to read the current rolling and weekly quota.

From an agent session:

```text
kimi_coding_models({})
kimi_coding_models({ apply: true })
kimi_coding_usage({})
kimi_coding_model_settings({})
```

See [the detailed behavior and limitations](docs/DETAIL.md) before changing advanced settings.

## Privacy

Only normalized model and quota fields cross the plugin's Host/Client boundary. API keys are resolved through DSH credentials and are never returned to the browser or included in tool output. Account identifiers and wallet metadata from the upstream quota response are discarded.

## Disclaimer

This is an independent, community-made plugin and is **not affiliated with or endorsed by Moonshot AI (月之暗面)**. "Kimi" and related names are trademarks of their respective owners. The plugin only calls the Kimi Coding API endpoints you configure, using your own subscription credential.

## License

[MIT](LICENSE)
