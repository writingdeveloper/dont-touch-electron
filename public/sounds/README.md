# Sound assets

Built-in tones are generated from `scripts/generate-tones.mjs`. Regenerate with:

    npm run generate:tones

Voice clips (`voice-<lang>-<word>.mp3`) are short spoken prompts in the languages the app supports. They are **not** generated automatically — drop in your own clips by language code:

- `en` English, `ko` Korean, `ja` Japanese, `zh` Chinese, `es` Spanish, `ru` Russian

Recommended clip rules:
- Length ≤ 2 s, mono, 22 kHz or 44.1 kHz, ≤ 50 KB.
- File names must match the IDs in `src/audio/soundPresets.ts`.

If a voice clip is missing at runtime, `AlertSoundService` falls back to the default tone — the app keeps working.
