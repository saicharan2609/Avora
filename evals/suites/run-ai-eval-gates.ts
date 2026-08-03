import { citationValidityCases } from "./citation-validity.fixture.js";
import { runCitationValidityGate } from "./citation-validity.gate.js";

runCitationValidityGate(citationValidityCases);

console.log(`AI evaluation gates passed: ${citationValidityCases.length} citation cases`);