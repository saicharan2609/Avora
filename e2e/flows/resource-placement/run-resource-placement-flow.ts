import {
  runResourcePlacementE2eHarness,
} from "./resource-placement.e2e.js";

try {
  const results = await runResourcePlacementE2eHarness();

  console.log(
    `Resource placement e2e passed: ${results.length} cases`,
  );
} catch (error) {
  console.error("Resource placement e2e failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
}
