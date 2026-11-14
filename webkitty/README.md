# GameYard — automatic PS4 14.02 route

This directory integrates the 14.02 SlopKit / Afterglow chain from
[ArabPixel/WebKitty](https://github.com/ArabPixel/WebKitty) at commit
`8c8ee71bc7622dcb80713889029d6a16c8a269ab`.

The six files under `src/slopkit-afterglow/`, the bundled GoldHEN
`v2.4b18.14` binary, and `LICENSE` match that upstream revision byte for byte.
`UPSTREAM.json` records their Git blob hashes and the payload SHA-256.
The binary is the upstream raw payload; the composite GoldHEN loader and
firmware patch blobs used by other payload forms are not selected here.

The GameYard landing page waits for Application Cache to finish before navigating
to a separate execution document. It automatically selects the bundled GoldHEN
binary. The adapter supplies the two host callbacks used by the original chain.
The original same-folder landing-page referrer check remains in effect. A
completed or restored attempt does not automatically run a second time; opening
the main GameYard URL starts a new attempt.

Only the 14.02 engine is included in this directory. Earlier firmware continues
to use its existing engine and payload files. AGPL-3.0-or-later applies to the
upstream source; retain the original file headers and MIT notice in
`LICENSE-raw13g`. Public corresponding source is available in this repository.

Validation covers automatic routing, cache completion/error handling, offline
asset completeness and upstream file integrity. Execution on physical PS4
hardware has not been tested in this development environment.
