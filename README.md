# Homebody

An AI-powered avatar for your space. Runs entirely on your own machine — bring
your own [OpenRouter](https://openrouter.ai/) API key.

## You need

- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running
- An [OpenRouter](https://openrouter.ai/) API key
- A Meta Quest 3 with the [Homebody APK](https://github.com/kevinmershon/homebody-app/releases/latest)
  sideloaded, on the same Wi-Fi network

Ships with a default avatar (Cesium Man) — no download needed to get started. It
has no bones mapped yet, though, so movement/grabbing won't work until you say
"enter rigging mode" once connected and map them (see
[AVATAR_SETUP.md](AVATAR_SETUP.md)). Want a different avatar entirely? Same doc.

## Setup

1. Clone/download this repo, open a terminal here.
2. `cp .env.example .env`, fill in `OPENROUTER_API_KEY` and `PLAYER_NAME`.
3. Start everything and put on your headset:
   ```
   docker compose up -d
   ./bin/homebody-server-mac        # macOS -- pick one for your OS, leave it running
   ./bin/homebody-server-linux      # Linux
   bin\homebody-server.exe          # Windows
   ```
   The binary broadcasts on your Wi-Fi so the headset can find the server — Docker
   can't do that by itself. Your headset finds it automatically once both are running.

## Stopping

`docker compose down` — your avatar's memory and state (`data/`, `mempalace/`)
persist between runs.

## Layout

| Folder | What's there |
|---|---|
| `resources/avatars/` | Avatar config JSON — ships with the default (Cesium Man); swap in your own via [AVATAR_SETUP.md](AVATAR_SETUP.md) |
| `resources/models/` | Only needed if your avatar's `model_url` points here instead of an external URL (the default doesn't) |
| `resources/animations/` | Idle/talking/sit poses (`.hbanim`) — included; record your own or grab more from Discord |
| `resources/effects/` | Sound files for `sense_score_fx`, if your avatar uses it |
| `resources/decision-engines/` | Auto-generated, leave alone |
| `resources/player.json` | Your own config, leave as-is unless you need it |
| `data/`, `mempalace/` | Server state and your avatar's memory |

## Troubleshooting

- **Headset never finds the server** — is `bin/homebody-server-*` running? Same
  Wi-Fi (not a guest/isolated network)?
- **Model never loads** — GLB filename must match `model_url` in your avatar's JSON.
- **Container won't start** — `docker compose logs -f`

## Community

Questions, bugs, or want to share what your avatar said? Join the
[Discord](https://discord.gg/v7mbmZbFXp).
