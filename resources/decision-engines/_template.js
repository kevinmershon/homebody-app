#!/usr/bin/env node
// Base template for a per-avatar muscle-memory decision engine.
// See spec/2026-08-13-muscle-memory-decision-engine/spec.md for the full input/output contract.
//
// Reads one JSON object from stdin, writes exactly one JSON object to stdout, then exits (via
// _lib.js's main(), required below -- every engine MUST require ./_lib.js and call its main()).
// Input shape (fields present depend on `trigger`):
//   {
//     trigger: "turn" | "tick",
//     lastCommand: string,              // only when trigger === "turn"
//     playerPosition: {x,y,z}, playerOrientation: {x,y,z,w},
//     avatarPosition: {x,y,z}, avatarOrientation: {x,y,z,w},
//     leftHandPosition: {x,y,z} | null, rightHandPosition: {x,y,z} | null,
//     boneGroups: string[],
//     lastAnimationPlayed: string | null,
//     isAnimationPlaying: boolean,
//     availableAnimations: string[],
//     recentHistory: object[],
//   }
//
// Output shape:
//   { decision: "handled" | "defer_to_llm" | "no_action", toolCalls?: [{name, arguments}, ...] }
//
// A "handled" decision's toolCalls is a LIST of {name, arguments} calls, each the exact same
// shape an LLM tool call takes and dispatched in order -- one decision can do more than one thing
// at once (e.g. move a limb AND speak). Muscle memory can call any real tool (move, speak, seat,
// room_object, light, appearance, memory, etc.) except update_muscle_memory itself. "defer_to_llm"
// is only valid when trigger === "turn" -- returning it on a "tick" call is a contract violation,
// treated the same as a thrown exception (automatic rollback on the Rust side). This template
// never does that.

const { distance, handIsRaisedNearAvatar, makeStateStore, main } = require("./_lib.js");
const stateStore = makeStateStore(__filename);

// Proximity-reaction thresholds (meters). Tuned loosely; the LLM can rewrite these as it learns
// what actually feels right for a given avatar/player.
const APPROACH_THRESHOLD = 1.5;
const LEAVE_THRESHOLD = 2.5;

function decide(input) {
  const state = stateStore.load();

  if (input.trigger === "tick") {
    // Return-to-rest-pose: if a named pose we started has just finished, release it the same
    // way the verbal "relax" tool action does (move's relax action).
    if (state.awaitingRelaxOnAnimationEnd && !input.isAnimationPlaying) {
      state.awaitingRelaxOnAnimationEnd = false;
      stateStore.save(state);
      return { decision: "handled", toolCalls: [{ name: "move", arguments: { action: "relax" } }] };
    }

    if (input.playerPosition && input.avatarPosition) {
      const dist = distance(input.playerPosition, input.avatarPosition);
      const wasNear = state.wasNear === true;
      const handRaised = handIsRaisedNearAvatar(input);

      // Close AND hand raised toward the avatar: a plausible "about to be grabbed/touched" cue.
      // Step back once per crossing, not on every tick while the hand stays up.
      if (dist <= APPROACH_THRESHOLD && handRaised && !state.steppedBackForRaisedHand) {
        state.steppedBackForRaisedHand = true;
        stateStore.save(state);
        return { decision: "handled", toolCalls: [{ name: "move", arguments: { action: "step", direction: "backward", distance: 0.3 } }] };
      }
      if (!handRaised && state.steppedBackForRaisedHand) {
        state.steppedBackForRaisedHand = false;
        stateStore.save(state);
      }

      // Plain proximity reaction (no hand involved): react once per crossing.
      if (!wasNear && dist <= APPROACH_THRESHOLD) {
        state.wasNear = true;
        stateStore.save(state);
        return { decision: "handled", toolCalls: [{ name: "speak", arguments: { text: "Oh, hey!" } }] };
      }
      if (wasNear && dist >= LEAVE_THRESHOLD) {
        state.wasNear = false;
        stateStore.save(state);
        return { decision: "handled", toolCalls: [{ name: "speak", arguments: { text: "See you in a bit." } }] };
      }
    }

    stateStore.save(state);
    return { decision: "no_action" };
  }

  // trigger === "turn": no baseline turn-handling logic yet -- always defer to the LLM.
  return { decision: "defer_to_llm" };
}

main(decide);
