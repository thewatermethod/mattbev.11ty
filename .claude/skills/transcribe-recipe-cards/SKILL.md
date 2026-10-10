---
name: transcribe-recipe-cards
description: Transcribe one scanned recipe card per run into a JSON data file for this 11ty site. Each run handles exactly one card and then stops, so the run can be repeated until the inbox is empty.
---

## Paths

- Inbox: `scans/` (unprocessed card photos)
- Done: `scans/done/` (photos already transcribed)
- Needs review: `scans/review/` (photos that couldn't be transcribed confidently)
- Output: `recipes/` (one `<slug>.json` per recipe)
- Reference: `recipes/creamy-tomato-banza-chickpea-pasta.json`
- Validator: `bin/validate-recipe.mjs`

## Procedure

1. List the inbox sorted by filename. If it is empty, print `NO CARDS REMAINING` and stop without doing anything else.
2. Take the first image and open it. A card has two sides: a front (title, hero photo, ingredient list) and a back (numbered steps). The other side is normally the adjacent file in sort order. Open it and confirm both sides belong to the same recipe before going on: the ingredients on the front should be the ones the steps on the back use. If you can't find a matching side, move the image to the review folder with a note (see "When a card can't be transcribed") and stop.
3. Transcribe both sides into a JSON object following the schema and rules below.
4. Write it to the output directory as `<slug>.json`. If a file with that slug already exists, do not overwrite it: treat the card as a duplicate, move the images to the review folder with a note, and stop.
5. Run `node bin/validate-recipe.mjs <path-to-new-file>`. If the validator doesn't exist yet, create it first (see "Validator"). Fix any failures by re-reading the card, not by guessing.
6. Move both images to the done folder.
7. Print one line: the slug, the number of ingredients and steps, and any `review` notes. Then stop. Do not start a second card.

## Schema

The reference file is the canonical example. Match its shape exactly, including key order.

- `title`, `subtitle`: as printed. `subtitle` is the "with ..." line; omit the key if the card has none.
- `slug`: kebab-case of the title only.
- `source`: `{ "name", "url" }` for the publisher printed on the card.
- `servings`: number.
- `time`: `{ "min", "max", "unit": "minutes" }`. If the card gives a single time, set `min` and `max` to the same value.
- `tags`: 2 to 4 lowercase tags you infer from the dish (main component, diet, occasion). Reuse tags already present in other files in the output directory before inventing new ones.
- `ingredients`: array of `{ "id", "quantity", "unit", "item" }`, plus optional `note` and `variant`.
  - `id`: short kebab-case handle, unique within the recipe.
  - `quantity`: always a JSON number. Convert fractions to decimals (¼ is `0.25`, ⅓ is `0.333`, 1½ is `1.5`).
  - `unit`: as printed, with the card's abbreviation style (`oz`, `Tbsp`, `tsp`, `cup`, `cloves`). When the card gives a count of a packaged size, put the package in the unit: "1 8-oz can Tomato Sauce" is quantity `1`, unit `"8-oz can"`. For a bare count ("2 Scallions"), use `"unit": null`.
  - `item`: the ingredient name in lowercase, except proper nouns and brand names.
  - `note`: footnote text attached to the ingredient, such as the contents of a spice blend.
  - `variant`: set only on ingredients that belong to a customized option, using that variant's `id`.
- `pantry`: staples the steps call for that are not in the printed ingredient list (olive oil, salt, pepper, butter, and so on). Read the steps to find them.
- `variants`: array of `{ "id", "label" }`, one per customized option on the card. Use an empty array if there are none.
- `steps`: array of `{ "number", "title", "instructions" }`, plus optional `variantInstructions`.
  - `instructions`: one string per bullet, in order.
  - `variantInstructions`: an object keyed by variant id, each value a complete replacement array for that step. Include it only on steps the card customizes.
- `review`: array of strings, present only when something needs a human look (see below).

## Transcription rules

- Transcribe the instructions word for word. Do not paraphrase, tighten, or correct them. The site should say what the card says.
- Write fractions inside instruction text as plain ASCII (`3/4`, `1/2`), since that text is not parsed.
- Drop the closing "Enjoy!" and similar sign-offs.
- Each variant's instructions must stand alone. Cards often abbreviate a customized step to something like "finish as directed, using the pan of cooked sausage." Expand that into the full base instructions with the variant's substitutions applied, so the site can render a variant without referring back to the base text.
- Leave out everything that isn't the recipe: diet-program points and tips, voice-assistant promos, wine pairings, allergen and facility boilerplate, social media prompts, barcodes, and print codes.
- Never fill a gap with a plausible value. The photos are taken in uneven light and some text will be in shadow or glare. If you can't read a quantity, a time, or a word with confidence, write your best reading and add an entry to `review` that says which field and why, for example `"steps[2].instructions[1]: cook time partly in shadow, read as '2 to 3 minutes'"`. A flagged guess is useful; a silent one corrupts the collection.
- Cross-check the two sides before writing. Every ingredient on the front should appear in the steps, and every ingredient the steps name should be on the front or in `pantry`. A mismatch usually means a misread or the wrong pair of photos.

## Validator

`bin/validate-recipe.mjs` takes one or more file paths, exits non-zero on any failure, and prints one line per problem. It uses no dependencies beyond Node. It checks that:

- the file parses and has every required key;
- `slug` matches the filename;
- every `quantity` is a finite number greater than zero;
- `time.min` is no greater than `time.max`;
- ingredient ids are unique;
- every `variant` on an ingredient and every key in `variantInstructions` names an id in `variants`;
- step numbers are consecutive starting at 1;
- every `instructions` and `variantInstructions` array is non-empty and contains only non-empty strings.

Create it once, on the first run where it is missing. On later runs, use it as it is. If a card legitimately needs something the validator rejects, add a `review` note describing the conflict and leave the validator alone.

## When a card can't be transcribed

If the photo is too blurred or cropped to read, has no matching second side, or duplicates an existing recipe, move the image or images to the review folder and append a line to `scans/review/NOTES.md` with the filenames and the reason. Write no JSON for that card. This still counts as the run's one card, so stop afterward.
