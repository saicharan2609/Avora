# embeddings adapters

Owner: @avora/platform  
AI co-owner: @avora/ai

## Purpose

This directory records the approved adapter boundary for embedding providers introduced in Stage 11 Group 4.

Provider-specific embedding implementations must remain replaceable and must not leak provider request shapes, SDKs, model names, or credentials into feature modules.

## Boundary rules

This group does not add a concrete provider adapter.

A future provider adapter must satisfy the AI-owned embedding port contract and must keep provider-specific code behind the approved adapter boundary.

## Explicitly out of scope

Stage 11 Group 4 does not implement:

- provider SDK calls;
- production embedding credentials;
- provider-specific model routing;
- vector search;
- scoped retrieval search;
- AI Tutor orchestration;
- web APIs;
- mobile APIs.

This directory is intentionally documentation-only in this group so package dependency direction is preserved.