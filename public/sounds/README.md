# Sound assets

## Tones

Built-in tones (`tone-*.wav`) are generated from `scripts/generate-tones.mjs`. Regenerate with:

    npm run generate:tones

Pure synthesis — no external dependencies.

## Voices

Voice clips (`voice-<lang>-*.mp3`) are short spoken alerts in the languages the app supports:

- `en` English, `ko` Korean, `ja` Japanese, `zh` Chinese, `es` Spanish, `ru` Russian

They are generated via Microsoft Edge TTS (Azure Neural voices — free, no API key). Regenerate with:

    pip install edge-tts
    npm run generate:voices

Each call is a short HTTPS request to Microsoft's public Edge TTS endpoint; no account or credential is needed.

If you want to swap a clip with your own recording, just overwrite the file — keep the same filename (it's referenced by ID in `src/audio/soundPresets.ts`).

If a voice clip is missing at runtime, `AlertSoundService` falls back to the default tone — the app keeps working.

### Clip rules

- Length ≤ 2 s, mono, ≤ 50 KB target.
- File names must match the IDs in `src/audio/soundPresets.ts`.
