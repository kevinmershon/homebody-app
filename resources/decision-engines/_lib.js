#!/usr/bin/env node
// Shared helper library every muscle-memory decision engine MUST require() -- see
// spec/2026-08-13-muscle-memory-decision-engine/spec.md's "Shared helper library" section.
// Rust enforces the require() at swap time (decision_engine::validate_and_swap) specifically so an
// LLM edit can silently drop distance/hand-raise/state primitives by rewriting them inline and
// getting it subtly wrong, or by deleting them outright while chasing an unrelated command --
// both were observed to happen for real.

const fs = require("fs");
const path = require("path");

function distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// A hand counts as "raised" when it's above this absolute world height, independent of avatar
// distance or the player's own height -- a single gesture classifier used for anything from
// "about to touch/grab" up close to a wave from across the room.
const HAND_RAISED_HEIGHT_METERS = 1.5;

function handIsRaised(input) {
  for (const hand of [input.leftHandPosition, input.rightHandPosition]) {
    if (hand && hand.y > HAND_RAISED_HEIGHT_METERS) return true;
  }
  return false;
}

// Engine-local state persisted across calls via a sibling <name>.state.json file, since each call
// is a fresh process with no in-memory continuity between ticks. Call makeStateStore(__filename)
// once per engine file; best-effort on both load and save -- losing state just means the next
// call re-derives from scratch.
function makeStateStore(engineFilename) {
  const statePath = path.join(path.dirname(engineFilename), path.basename(engineFilename, ".js") + ".state.json");
  return {
    load() {
      try {
        return JSON.parse(fs.readFileSync(statePath, "utf8"));
      } catch {
        return {};
      }
    },
    save(state) {
      try {
        fs.writeFileSync(statePath, JSON.stringify(state));
      } catch {
        // Best-effort -- see comment above.
      }
    },
  };
}

// Reads one JSON object from stdin, calls decideFn(input), writes exactly one JSON object to
// stdout. Every engine's entry point must be `main(decide)`, not its own hand-rolled stdin/stdout
// plumbing -- keeps that plumbing correct/uniform even if an edit only ever touches decide().
function main(decideFn) {
  let raw = "";
  process.stdin.on("data", (chunk) => { raw += chunk; });
  process.stdin.on("end", () => {
    let input;
    try {
      input = JSON.parse(raw);
    } catch (err) {
      process.stderr.write(`Failed to parse stdin JSON: ${err.message}\n`);
      process.exit(1);
    }
    const output = decideFn(input);
    process.stdout.write(JSON.stringify(output));
  });
}

module.exports = {
  distance, handIsRaised, HAND_RAISED_HEIGHT_METERS,
  makeStateStore, main,
};
