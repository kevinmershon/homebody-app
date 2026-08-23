# Avatar Config Fields

Use `example.json` as a template. See [AVATAR_SETUP.md](../../AVATAR_SETUP.md) for the workflow.

## Top level

| Field | What it does |
|---|---|
| `id` | Matches the filename (`example.json` → `"id": "example"`). |
| `name` | Display name. |
| `model_url` | `http://{server_ip}:9393/models/<filename>.glb` — `{server_ip}` auto-fills at connect time. |
| `scale` | Uniform scale. `1.0` = as-exported. |
| `spawn_position` | `{x, y, z}` in meters, relative to the player's room origin. |
| `self_collision` | Can the avatar's own body parts collide? |
| `arm_rest_lateral` | Degrees the resting arms angle from the body. |
| `sense_zones` | Touch-sensitivity zones. Leave `{}` here, set via `.local.json` (below). |

## `voice`

| Field | What it does |
|---|---|
| `voice_model` | xAI/Grok voice name — see [voice list](https://docs.x.ai/developers/model-capabilities/audio/voice#voices). |
| `voice_conversion.enabled` | Voice changer on by default? |
| `personality` | Free text describing who they are and how they talk. Goes straight into the LLM's system prompt. |
| `greeting` | Said on spawn. `{player_name}` is substituted. |
| `idle_phrases` | Said when idle. |
| `on_player_approach` | Said when the player walks up. |

## `shaders.occlusion`

Materials treated as "unlit" for passthrough occlusion — `skip_transparent_materials`
and `skip_name_substrings` (matched against material/mesh names) exclude things
like eyes/hair that render oddly with it applied.

## `face_animation`

Blend-shape facial animation for rigs without jaw/eyelid/pupil bones. Set
`enabled: false` (overall or per `blink`/`gaze`) if unused.

- `mesh_name` — mouth-amplitude/expression shapes.
- `blink.mesh_names` + `close_shape`/`close_scale` — one or more meshes blinking in sync.
- `gaze.left`/`gaze.right` — per-eye `mesh_name` + four directional shape names, tuned by `max_degrees`/`turn_speed`/`return_speed`/`weight_scale`.

## `bone_groups`

Maps fixed group names (`head`, `left_hand`, `chest`, etc.) to *your* model's
actual bone names. `primary` is the driven bone, `coupled` are bones that move
with it, `passive` (a few groups only) follow without being directly driven.

This is the hard part — see AVATAR_SETUP.md's rigging-mode instructions rather
than hand-filling this. A full rig also needs finger groups
(`left_thumb_root`/`_mid`/`_tip`, etc., both hands) in the same shape.

## `touch_only` / `animation_only` / `posing_only`

Which bone groups are touch-but-not-grabbable / animation-driven-only /
posable-in-learning-mode-only.

## `hand_groups`

Which groups count as hands (usually `["left_hand", "right_hand"]`).

## `face_pose_grab`

Maps groups to a pose-grab kind (`eye`/`jaw`) for learning mode.

## `jiggle`

Secondary jiggle physics. Each entry has a `root` and either `leaves` or
`targets` (`{parent, root}` pairs, e.g. hair strands). Leave `{}` if unused.

## `sense_score_fx`

Sound cues triggered as the avatar's touch/attention "sense score" crosses
thresholds. Array of `{min, max, files}` bands — when the score lands in a
band's range, a random file from `files` plays. Files are served from
`resources/effects/`. Omit this field to get a generic three-tier chime default.

## Local overlays

`<avatar_id>.local.json` (gitignored) deep-merges over the base file at load
time — for real `sense_zones`, or `voice.personality_append` (appended, not
replacing, `voice.personality`). `resources/player.local.json` does the same
for `resources/player.json`.
