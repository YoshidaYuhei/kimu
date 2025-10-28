# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

kimu - Knowledge Management Tool

React + TypeScript で構築するナレッジマネジメントツール。
テストは Jest（単体テスト）と Playwright/Cypress（E2Eテスト）を使用。

## Custom Commands

### /issue
対話型でGitHub Issueを作成するコマンド。ユーザーから簡単な要望を受け取り、詳細を質問して、構造化されたIssueを自動生成します。

### /adr
GitHub IssueからADR（Architecture Decision Record）を作成するコマンド。Issue番号を受け取り、設計・実装方針について対話的に質問し、構造化されたADRドキュメントを `docs/adr/` に生成します。

### /testcode
ADRからテストコードを生成するコマンド。ADR番号またはファイルパスを受け取り、決定内容に基づいてJestによる単体テスト（React Testing Library使用）とE2Eテストを生成します。TypeScript対応。

### /implement
ADRとテストコードを読んで実装を行うコマンド。ADR番号またはファイルパスを受け取り、設計決定とテスト仕様に基づいてTypeScript/Reactコードを実装します。実装後は自動でテストを実行し、型チェックとリントを行います。

### /review-pr
GitHub Pull Requestを包括的にレビューするコマンド。PR番号を受け取り、設計（ADR準拠）、TypeScript/React固有の問題、コード品質、パフォーマンス、セキュリティ、アクセシビリティ、テストなど多角的な観点でレビューし、重要度別に整理されたフィードバックを提供します。

### /feedback
会話履歴を分析してClaude自身への指示を改善するコマンド。カスタムスラッシュコマンドやCLAUDE.mdの内容を分析し、不足している情報、曖昧な指示、追加すべきルールなどを特定して優先度付きの改善案を提案します。メタ改善ツール。
