#!/usr/bin/env node
// Validate recipe JSON files. Usage: node scripts/validate-recipe.mjs <file>...
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const REQUIRED = ["title", "slug", "source", "servings", "time", "tags", "ingredients", "pantry", "variants", "steps"];

function validate(file) {
  const problems = [];
  const fail = (msg) => problems.push(`${file}: ${msg}`);

  let recipe;
  try {
    recipe = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    fail(`does not parse: ${err.message}`);
    return problems;
  }

  for (const key of REQUIRED) {
    if (!(key in recipe)) fail(`missing required key "${key}"`);
  }

  if (recipe.slug !== basename(file, ".json")) {
    fail(`slug "${recipe.slug}" does not match filename`);
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const variantIds = new Set((recipe.variants || []).map((v) => v.id));

  const seen = new Set();
  ingredients.forEach((ing, i) => {
    if (!(typeof ing.quantity === "number" && Number.isFinite(ing.quantity) && ing.quantity > 0)) {
      fail(`ingredients[${i}].quantity is not a finite number > 0`);
    }
    if (seen.has(ing.id)) fail(`duplicate ingredient id "${ing.id}"`);
    seen.add(ing.id);
    if ("variant" in ing && !variantIds.has(ing.variant)) {
      fail(`ingredients[${i}].variant "${ing.variant}" is not a declared variant`);
    }
  });

  const byId = new Map(ingredients.map((ing) => [ing.id, ing]));
  (recipe.variants || []).forEach((v, i) => {
    if (!("replaces" in v)) return;
    if (!Array.isArray(v.replaces) || v.replaces.length === 0) {
      fail(`variants[${i}].replaces must be a non-empty array`);
      return;
    }
    v.replaces.forEach((id, j) => {
      const ing = byId.get(id);
      if (!ing) fail(`variants[${i}].replaces[${j}] "${id}" is not an ingredient id`);
      else if ("variant" in ing) fail(`variants[${i}].replaces[${j}] "${id}" is a variant ingredient, not a base one`);
    });
  });

  if (recipe.time && recipe.time.min > recipe.time.max) {
    fail(`time.min (${recipe.time.min}) is greater than time.max (${recipe.time.max})`);
  }

  const checkStrings = (arr, where) => {
    if (!Array.isArray(arr) || arr.length === 0) {
      fail(`${where} must be a non-empty array`);
      return;
    }
    arr.forEach((s, j) => {
      if (typeof s !== "string" || s.trim() === "") fail(`${where}[${j}] is not a non-empty string`);
    });
  };

  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  steps.forEach((step, i) => {
    if (step.number !== i + 1) fail(`steps[${i}].number is ${step.number}, expected ${i + 1}`);
    checkStrings(step.instructions, `steps[${i}].instructions`);
    for (const [key, arr] of Object.entries(step.variantInstructions || {})) {
      if (!variantIds.has(key)) fail(`steps[${i}].variantInstructions key "${key}" is not a declared variant`);
      checkStrings(arr, `steps[${i}].variantInstructions.${key}`);
    }
  });

  return problems;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: validate-recipe.mjs <file>...");
  process.exit(2);
}

const problems = files.flatMap(validate);
for (const p of problems) console.log(p);
process.exit(problems.length ? 1 : 0);
