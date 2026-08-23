# Setting Up Your Avatar

This repo doesn't include an avatar — you provide one.

## Install one

1. Get an avatar zip (see [README](README.md)).
2. Copy the `.json` into `resources/avatars/`, the `.glb` into `resources/models/`.
3. In `.env`, set `ENTITY_ID`/`AVATAR_ID` to the `.json` filename (no extension)
   and `AVATAR_NAME` to whatever you want it called.
4. `docker compose restart homebody-server`.

Decision-engine behavior scripts auto-generate — nothing to do there.

## Make your own

See [`resources/avatars/FIELDS.md`](resources/avatars/FIELDS.md) and
[`example.json`](resources/avatars/example.json) for the config format.

Want to see a fully rigged example, `bone_groups` and all? Download
[Eve](https://bucket-mxo10a.s3.us-west-2.amazonaws.com/avatars/eve.zip) and
look at her `.json`.

The hard part is `bone_groups` — mapping your model's bone names to what the
engine expects. Easiest way: connect, say **"enter rigging mode"**, and follow
the on-screen instructions to grab and assign bones directly. It writes the
mapping back into your config for you.

Got a working config for a popular rig? Share it — see the Discord link in the
main README.
