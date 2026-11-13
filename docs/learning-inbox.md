# Learning inbox

## Scope

The inbox provides an explicit handoff from questions or pasted conversation text into personal learning cards. It does not read a remote conversation, recover missing history, or claim that a scheduled source sync has completed. Daily publication, public feed revisions and private source checkpoints are unaffected.

## User flow

Open **My Phrases → Learning inbox**. Type a question in either language or paste a selected chat exchange, then choose **Save to inbox**. Saving is local and does not call the coach. Choose **Prepare cards** to send that saved item to the configured private coaching service. Successful replies add English learning cards to My Phrases and its existing review queue. Uncertain meanings remain visible as clarification requests.

If the coach is unavailable, the question remains saved and can be retried. Closing the inbox aborts the browser request without completing the saved item. The provider request may already have started. There is no background retry or exact-time delivery guarantee.

For a handoff without coach credentials, expand **Bring learning cards from ChatGPT**. Use the provided preparation instructions with the selected source material. Paste the resulting JSON or choose a JSON file under 100 KB, inspect its preview, and import it. A raw account conversation export is not accepted. Missing assistant explanations must not be represented as recovered originals.

## Data and privacy

Questions, replies, pending clarifications and cards stay in the existing device learning store and its backup format. They are not committed to the public feed. The service sends the selected item to the configured model with `store: false`; this is not a promise of zero provider retention. Do not paste credentials or unnecessary private details.

Device storage is not a cloud account or encrypted vault. Export a private backup before clearing browser data or changing devices. Restore replaces the device store using the existing confirmation flow. Old backups remain compatible. A failed inbox write does not show a successful save or discard the input.

Card matching uses normalized expression and meaning. Identical senses reuse existing IDs and preserve review progress; distinct meanings remain separate. Different paraphrases of the same meaning can still produce separate cards. Imported IDs cannot overwrite published records. Personal imports never replace Daily Three lesson membership.

## Service and release

`POST /api/learning-inbox` uses the existing origin allowlist, access-code authorization, request limits and model configuration. Input is limited to 12,000 characters; replies contain at most eight cards and eight clarification items. Both manual imports and provider responses are validated at their boundaries. The prompt treats pasted text as source material, uses neutral examples and requests English-only fields.

Frontend and backend must both be released for online preparation. The local implementation alone does not make the new route available on the existing deployment. Manual card import works without the backend once the frontend is published. A real configured provider call remains required for production acceptance; browser fixtures verify application behavior, not linguistic quality.

The original remote daily task still needs an authoritative paused-state check. This feature neither changes that task nor resolves its access restriction.
