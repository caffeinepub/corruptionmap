# CorruptionMap

## Current State
The Report page submits reports with no identity info attached. The form shows a small note saying reports are anonymous, but there's no explicit anonymous mode or any way for the reporter to reference their submission later.

## Requested Changes (Diff)

### Add
- After successful submission, generate a random anonymous reference token (e.g. ANON-XXXXXXXX) client-side and display it prominently in the success state
- Instruct users to copy/save the token to reference their report in future
- Add a visible "Anonymous Mode" shield badge/indicator on the form to reinforce privacy
- Add a copy-to-clipboard button for the token

### Modify
- Success state: expand it to show the anonymous token with copy button instead of just "Report Submitted"
- Report page header: make the anonymous guarantee more prominent

### Remove
- Nothing removed

## Implementation Plan
1. Add `generateAnonToken()` helper that creates a random ANON-XXXXXXXX string
2. Store the token in state alongside `submitted`
3. Update success state UI to display the token prominently with a copy button and save reminder
4. Add a small anonymous shield indicator/badge on the form card header
