# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

kimu - Knowledge Management Tool

React + TypeScript で構築するナレッジマネジメントツール。
テストは Jest（単体テスト）と Playwright/Cypress（E2Eテスト）を使用。

### プロジェクト構成
- React Native CLI 0.82.1（iOS開発）
- Monorepo構成: `apps/mobile/`配下に独立プロジェクト
- npm workspacesは使用しない（React Nativeの依存関係解決との競合を避けるため）

## MCP Servers

このプロジェクトでは以下のMCPサーバーを使用します：

### context7
コードベースの深い理解と検索を提供。コード解析、依存関係の追跡、セマンティック検索が可能。
- 設定: `./mcp.json`

### serena
プロジェクト管理とタスクトラッキング。Issue、マイルストーン、プロジェクトボードの操作が可能。
- 設定: `./mcp.json`
- 環境変数: なし

### filesystem
ローカルファイルシステムへの安全なアクセス。ファイル読み書き、ディレクトリ操作が可能。
- 設定: `.mcp.json`
- 対象ディレクトリ: `/Users/yoshidayuuhei/product/kimu`

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

## React Native開発ガイドライン

### 開発時の重要事項

#### Metro Bundler管理
- 複数のMetro bundlerが同時に起動しないよう注意
- エラー時は `lsof -ti:8081 | xargs kill -9` でポートをクリア
- 必要に応じて `--reset-cache` オプションを使用

#### iOS開発
- CocoaPodsバージョン: 1.15.2以上
- Xcodeビルド前に `pod install` を実行
- Clean Buildが必要な場合: Product > Clean Build Folder (Cmd+Shift+K)

#### よくある問題と解決策
1. **Module not found**: node_modulesの再インストールを検討
2. **Metro bundler接続エラー**: ポート8081の競合を確認
3. **CocoaPods依存関係エラー**: `pod install --repo-update` を実行
4. **No script URL provided**: Metro bundlerを再起動してからビルド

### テスト環境
- 単体テスト: Jest + React Native Testing Library
- カバレッジ閾値: 80%（branches, functions, lines, statements）
- テスト実行: `npm test` または `npm run test:coverage`

### CI/CD
- PR時: lint, type-check, test, coverage check
- main時: 上記 + iOSビルド検証（GitHub Actions, macos-latest）

## 開発ワークフロー

### 初期セットアップ（新規プロジェクト）
1. 基本設定（TypeScript, ESLint, Prettier）
2. アーキテクチャ構築（ディレクトリ構造、ルーティング）
3. 状態管理セットアップ
4. テスト環境構築
5. CI/CD設定

各ステップ完了後、動作確認とコミットを行う。

### 機能開発（既存プロジェクト）
1. `/issue`: GitHub Issueを作成
2. `/adr`: 設計決定を記録
3. `/testcode`: テストコードを生成
4. `/implement`: 実装を行う
5. `/review-pr`: PRをレビュー

### 段階的実装の原則
- 各ステップで動作確認を行う
- 小さく実装してコミット
- テストを書いてから実装（TDD）
- ADRで設計を先に決める

## CI/CD環境の注意事項

### GitHub Actions（iOS）
- **実行環境**: macos-latest
- **利用可能なシミュレーター**: GitHub Actionsのドキュメントで確認
  - iPhone 16シリーズ以降を推奨（2025年時点）
  - `xcrun simctl list devices` で確認可能なデバイス名を使用
- **必要なツール**:
  - xcpretty: 明示的にインストール `gem install xcpretty`
  - CocoaPods: ruby/setup-ruby actionでセットアップ

### ローカルとCI環境の差異
- シミュレーターの種類・バージョン
- インストール済みツールの違い
- 環境変数の設定
- キャッシュの動作

### ベストプラクティス
- CI環境で使用するツールは明示的にインストール
- シミュレーター指定は具体的なバージョンではなく"latest"を使用
- ビルドスクリプトをローカルでも実行可能にする
- CIが失敗した場合は、同じ環境（Docker等）でローカル再現

## プロジェクト構造

### ディレクトリ構成

```
apps/mobile/
├── src/
│   ├── features/          # Feature-basedアーキテクチャ
│   │   ├── home/
│   │   │   ├── screens/
│   │   │   │   ├── HomeScreen.tsx
│   │   │   │   └── __tests__/
│   │   │   │       └── HomeScreen.test.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── auth/
│   ├── navigation/        # ルーティング設定
│   ├── store/            # Zustand状態管理
│   │   ├── types.ts
│   │   ├── useUserStore.ts
│   │   └── __tests__/
│   ├── types/            # 共通型定義
│   ├── utils/            # 共通ユーティリティ
│   └── components/       # 共通コンポーネント
├── ios/                  # iOSネイティブコード
├── android/              # Androidネイティブコード
└── __tests__/            # アプリレベルのテスト
```

### ファイル命名規則
- コンポーネント: PascalCase（例: `HomeScreen.tsx`）
- Hook: camelCaseで"use"プレフィックス（例: `useUserStore.ts`）
- ユーティリティ: camelCase（例: `formatDate.ts`）
- テストファイル: `[ファイル名].test.tsx` または `[ファイル名].spec.tsx`
- 型定義: `types.ts` または `[機能名].types.ts`

### 新機能追加時の配置ルール
1. 機能固有のコード: `src/features/[機能名]/`
2. 複数機能で共有: `src/components/`, `src/utils/`
3. アプリ全体の状態: `src/store/`
4. 型定義: 機能内または `src/types/`

## Git操作ガイドライン

### コミットタイミング
- 各機能セットアップ完了後
- テストがすべてパスした後
- ビルドが成功した後
- 小さく頻繁にコミット（WIPコミットも可）

### コミットメッセージフォーマット
```
[type]: [簡潔な説明（日本語可）]

[詳細な説明（箇条書き）]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type**:
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント
- `chore`: その他（設定変更等）
- `ci`: CI/CD設定

### Pre-commit Hooksでのエラー対処
1. **ESLintエラー**:
   - 自動修正可能な場合: `npm run lint:fix`
   - それ以外: コードを修正してから再コミット

2. **公式パターンとの衝突**:
   - React NavigationのグローバルNamespace等
   - eslint-disableコメントで対応（ユーザーに確認）

3. **型エラー**:
   - 型チェックを修正してからコミット

### コミット時の原則
- ユーザーの明示的な指示がない限り、自動コミットしない
- コミット前に変更内容を確認（git statusとgit diff）
- コミットメッセージは変更内容を正確に反映

## 開発環境のクリーンアップ

### Background Processの管理
React Native開発では、Metro bundlerが背景で実行され続けることがあります。

**クリーンアップ方法**:
```bash
# Metro bundlerプロセスを確認
lsof -i :8081

# すべてのMetro bundlerを終了
lsof -ti:8081 | xargs kill -9

# 他のReact Nativeプロセスも確認
ps aux | grep "react-native"
```

**定期的なクリーンアップのタイミング**:
- セッション終了時
- 新しい機能の実装開始前
- エラーが頻発する場合
