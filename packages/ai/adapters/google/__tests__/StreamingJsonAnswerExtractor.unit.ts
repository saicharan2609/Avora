import { StreamingJsonAnswerExtractor } from "../StreamingJsonAnswerExtractor.js";

class ExtractorTestFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "ExtractorTestFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new ExtractorTestFailure(caseId, reason);
  }
}

function testSingleChunkExtraction(): void {
  const caseId = "extractor-single-chunk";
  const extractor = new StreamingJsonAnswerExtractor();
  const raw = '{\n  "answerText": "Hello world.",\n  "citations": []\n}';
  const extracted = extractor.processChunk(raw);

  assert(extracted === "Hello world.", caseId, "failed single chunk extraction");
  assert(extractor.getFullBuffer() === raw, caseId, "buffer mismatch");
}

function testMultiChunkIncrementalExtraction(): void {
  const caseId = "extractor-multi-chunk";
  const extractor = new StreamingJsonAnswerExtractor();

  const c1 = extractor.processChunk('{\n  "answerText": "First part ');
  assert(c1 === "First part ", caseId, "chunk 1 mismatch");

  const c2 = extractor.processChunk("and second part ");
  assert(c2 === "and second part ", caseId, "chunk 2 mismatch");

  const c3 = extractor.processChunk('completed.",\n  "citations": []\n}');
  assert(c3 === "completed.", caseId, "chunk 3 mismatch");

  const c4 = extractor.processChunk("");
  assert(c4 === "", caseId, "chunk 4 after end quote must be empty");
}

function testEscapeSequencesExtraction(): void {
  const caseId = "extractor-escape-sequences";
  const extractor = new StreamingJsonAnswerExtractor();

  const c1 = extractor.processChunk('{"answerText": "Line 1\\nLine 2\\t\\\\"quote\\\\"');
  assert(c1 === 'Line 1\nLine 2\t\\"quote\\"', caseId, "escapes mismatch");

  const c2 = extractor.processChunk(' end."}');
  assert(c2 === " end.", caseId, "end chunk mismatch");
}

function main(): void {
  testSingleChunkExtraction();
  testMultiChunkIncrementalExtraction();
  testEscapeSequencesExtraction();
}

main();
