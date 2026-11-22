# GameYard PS5 Autoloader v0.8.3 (visual release r7)

Upstream: https://github.com/itsPLK/ps5-webkit-autoloader/releases/tag/v0.8.3 (published 2026-11-21)
Device: PS5; official upstream advertises firmware **5.00–13.60**. **14.02 is NOT verified**.

This is a NON-FUNCTIONAL-CHANGE visual variant: downloaded v0.8.3 ELF is verified against the official published SHA-256, and only its 512x512 home-screen PNG artwork is replaced in-place with a GameYard icon. The official WebKit/Poops/Relapse exploit logic, AppCache, and .text executable section are not changed.

The build job runs on GitHub Actions in the feature branch and uploads an ELF archive. The desktop host in the archive is the unmodified official v0.8.3 Python host.

## Safe installation
* On a console already running compatible software and able to launch ELF payloads, launch the updated installer ELF from an ELF loader or Payload Manager.
* If not yet set up, use the official host Python for one-time installation from a PC. Then restart once and open WebKit Autoloader from PS5 home.
* Cache is refreshed by reinstalling. Your existing /data/ps5_autoloader or USB autoload.txt are not rewritten by this updater.
* Archive the previous v0.7.1 GameYard build as a rollback option.

Branding limitation: the GitHub job uses the logo stored in this website repo (gameyard-logo.jpeg), not the previous cartoon portrait. For the original cartoon portrait use the separate local build package with its included approved PNG and the same verified icon-patching logic. The upstream browser UI remains the upstream v0.8.3 UI, not GameYard's custom v6 interface.

No actual PS5 testing performed. No claims of 14.02 functionality.

Official v0.8.3 SHA-256: f4b0dee9af572ea1cb77aaf1e6fc5bf8ef520fc0a0a30753dd94a5cbdc04dd8e
