import {
  runTutorGroundingE2eHarness,
} from "./tutor-grounding.e2e.js";

try {
  const results = await runTutorGroundingE2eHarness();

  console.log(
    `Tutor grounding e2e passed: ${results.length} cases`,
  );
} catch (error) {
  console.error("Tutor grounding e2e failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
}