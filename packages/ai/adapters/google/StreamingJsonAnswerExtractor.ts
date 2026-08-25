export class StreamingJsonAnswerExtractor {
  private buffer = "";
  private inAnswerText = false;
  private finishedAnswerText = false;
  private extractedLength = 0;

  public processChunk(chunkText: string): string {
    this.buffer += chunkText;

    if (this.finishedAnswerText) {
      return "";
    }

    if (!this.inAnswerText) {
      const openQuoteIndex = this.findAnswerTextStart();
      if (openQuoteIndex === -1) {
        return "";
      }
      this.inAnswerText = true;
      this.extractedLength = openQuoteIndex + 1;
    }

    if (this.inAnswerText) {
      return this.extractNewTextTokens();
    }

    return "";
  }

  public getFullBuffer(): string {
    return this.buffer;
  }

  private findAnswerTextStart(): number {
    const marker = '"answerText"';
    const markerIndex = this.buffer.indexOf(marker);
    if (markerIndex === -1) {
      return -1;
    }

    const colonIndex = this.buffer.indexOf(":", markerIndex + marker.length);
    if (colonIndex === -1) {
      return -1;
    }

    return this.buffer.indexOf('"', colonIndex + 1);
  }

  private extractNewTextTokens(): string {
    let currentIndex = this.extractedLength;
    let newChars = "";

    while (currentIndex < this.buffer.length) {
      const char = this.buffer[currentIndex];
      const prevChar = currentIndex > 0 ? this.buffer[currentIndex - 1] : "";

      if (char === '"' && prevChar !== "\\") {
        this.inAnswerText = false;
        this.finishedAnswerText = true;
        currentIndex += 1;
        break;
      }

      if (char === "\\" && currentIndex + 1 < this.buffer.length) {
        const nextChar = this.buffer[currentIndex + 1];
        newChars += this.resolveEscapeSequence(nextChar);
        currentIndex += 2;
      } else if (char === "\\" && currentIndex + 1 >= this.buffer.length) {
        // Incomplete escape sequence at the end of the chunk; wait for next chunk
        break;
      } else {
        newChars += char;
        currentIndex += 1;
      }
    }

    this.extractedLength = currentIndex;
    return newChars;
  }

  private resolveEscapeSequence(nextChar: string | undefined): string {
    if (nextChar === "n") {
      return "\n";
    }
    if (nextChar === "t") {
      return "\t";
    }
    if (nextChar === '"') {
      return '"';
    }
    if (nextChar === "\\") {
      return "\\";
    }
    return nextChar ?? "";
  }
}
