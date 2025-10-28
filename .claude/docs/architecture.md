# 和風タイマーアプリ アーキテクチャ設計書

## 目次
1. [技術スタック](#技術スタック)
2. [アーキテクチャパターン](#アーキテクチャパターン)
3. [データベース設計](#データベース設計)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [スケーラビリティ戦略](#スケーラビリティ戦略)
6. [開発ロードマップ](#開発ロードマップ)
7. [コスト試算](#コスト試算)

---

## 技術スタック

### フロントエンド (React Native CLI)

```yaml
言語: TypeScript (strict mode)
状態管理:
  - Zustand (軽量・シンプル)
  - React Query / TanStack Query (サーバー状態管理)

ナビゲーション: React Navigation v6

UI/スタイリング:
  - styled-components (react-native)
  - react-native-reanimated v3 (アニメーション・60fps保証)
  - react-native-svg (アナログ時計描画)

ローカルストレージ:
  - MMKV (超高速・TypeScript対応・AsyncStorageの10倍以上)

音声:
  - react-native-sound
  - または @react-native-community/audio-toolkit

通知:
  - @notifee/react-native (高機能・クロスプラットフォーム)

テスト:
  - Jest + React Native Testing Library (単体テスト)
  - Detox (E2Eテスト)
```

### バックエンド (Supabase)

```yaml
認証: Supabase Auth
  - Email認証
  - Apple Sign In
  - Google Sign In
  - ゲストモード対応

データベース: PostgreSQL
  - Row Level Security (RLS) 有効
  - リアルタイム同期対応

ストレージ: Supabase Storage
  - 将来のカスタム音声アップロード用

リアルタイム: Supabase Realtime
  - 将来のコラボレーション機能用

Edge Functions: Deno
  - サーバーサイドロジック
  - バッチ処理・統計計算
```

### インフラ・ツール

```yaml
CI/CD: GitHub Actions
  - 自動ビルド・テスト
  - Fastlane統合

コード品質:
  - ESLint (TypeScript対応)
  - Prettier (自動フォーマット)
  - Husky (Git hooks)

モニタリング:
  - Sentry (エラートラッキング)
  - Crashlytics (クラッシュレポート)

アナリティクス:
  - Firebase Analytics
  - または Mixpanel

配信自動化: Fastlane
  - iOS: TestFlight → App Store
  - Android: Internal Testing → Google Play
```

---

## アーキテクチャパターン

### Clean Architecture + Feature-First Structure

機能ごとに分離し、スケーラブルな構成を実現。各機能は独立してテスト・開発可能。

**設計原則:**
- 関心の分離 (Separation of Concerns)
- 依存性逆転の原則 (DIP)
- 単一責任の原則 (SRP)
- オフライン・ファースト設計

---

## データベース設計

### Supabase PostgreSQL スキーマ

#### 1. ユーザー
```sql
-- Supabase Authが自動管理
auth.users (
  id uuid PRIMARY KEY,
  email text,
  created_at timestamp,
  ...
)
```

#### 2. ラベル
```sql
CREATE TABLE labels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text, -- 将来の拡張: カスタムカラー
  usage_count int DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own labels"
  ON labels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels"
  ON labels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels"
  ON labels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels"
  ON labels FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_labels_user_id ON labels(user_id);
CREATE INDEX idx_labels_usage_count ON labels(user_id, usage_count DESC);
```

#### 3. タイマーセッション（統計・履歴用）
```sql
CREATE TABLE timer_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label_id uuid REFERENCES labels(id) ON DELETE SET NULL,
  duration_minutes int NOT NULL,
  completed boolean DEFAULT false,
  started_at timestamp DEFAULT now(),
  completed_at timestamp
);

-- RLS
ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON timer_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON timer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX idx_timer_sessions_started_at ON timer_sessions(user_id, started_at DESC);
```

#### 4. プリセット（将来の拡張）
```sql
CREATE TABLE presets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes int NOT NULL,
  label_id uuid REFERENCES labels(id) ON DELETE SET NULL,
  is_default boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own presets"
  ON presets FOR ALL
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_presets_user_id ON presets(user_id, sort_order);
```

---

## ディレクトリ構造

```
ZenTimer/
├── src/
│   ├── features/                # 機能ごとに分離
│   │   ├── timer/
│   │   │   ├── components/
│   │   │   │   ├── AnalogClock.tsx
│   │   │   │   ├── TimerControls.tsx
│   │   │   │   └── PresetButtons.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTimer.ts
│   │   │   │   ├── useTimerSound.ts
│   │   │   │   └── useTimerNotification.ts
│   │   │   ├── store/
│   │   │   │   └── timerStore.ts       # Zustand
│   │   │   ├── screens/
│   │   │   │   └── TimerScreen.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── labels/
│   │   │   ├── components/
│   │   │   │   ├── LabelList.tsx
│   │   │   │   ├── LabelItem.tsx
│   │   │   │   └── LabelInput.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLabels.ts        # React Query
│   │   │   ├── screens/
│   │   │   │   └── LabelsScreen.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── EmailLogin.tsx
│   │   │   │   └── SocialLogin.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── SignupScreen.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── statistics/             # Phase 2: 統計機能
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   └── types.ts
│   │   │
│   │   └── settings/               # 設定画面
│   │       ├── components/
│   │       ├── screens/
│   │       └── types.ts
│   │
│   ├── shared/                     # 共通モジュール
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loading.tsx
│   │   ├── hooks/
│   │   │   ├── useAppState.ts
│   │   │   └── useKeyboard.ts
│   │   ├── utils/
│   │   │   ├── time.ts
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── services/                   # 外部サービス連携
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabaseクライアント初期化
│   │   │   ├── auth.ts             # 認証関連
│   │   │   ├── labels.ts           # ラベルCRUD
│   │   │   ├── sessions.ts         # タイマーセッション記録
│   │   │   └── sync.ts             # オフライン同期ロジック
│   │   ├── storage/
│   │   │   ├── mmkv.ts             # MMKVラッパー
│   │   │   └── cache.ts            # キャッシュ管理
│   │   ├── notifications/
│   │   │   └── notifee.ts          # 通知管理
│   │   ├── analytics/
│   │   │   └── firebase.ts         # イベントトラッキング
│   │   └── sound/
│   │       └── player.ts           # 音声再生
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # メインナビゲーション
│   │   ├── AuthNavigator.tsx       # 認証フロー
│   │   └── MainNavigator.tsx       # アプリメインフロー
│   │
│   ├── theme/
│   │   ├── colors.ts               # 禅カラーパレット
│   │   ├── typography.ts           # フォント設定
│   │   ├── spacing.ts              # スペーシング定数
│   │   └── index.ts
│   │
│   ├── assets/
│   │   ├── sounds/
│   │   │   └── bell.mp3            # 鈴の音
│   │   └── images/
│   │
│   └── App.tsx
│
├── android/                        # Androidネイティブコード
├── ios/                            # iOSネイティブコード
├── __tests__/                      # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # CI/CD設定
│       └── release.yml
│
├── docs/
│   ├── architecture.md             # このファイル
│   ├── requirements.md             # 仕様書
│   └── setup.md                    # セットアップ手順
│
├── fastlane/                       # デプロイ自動化
│   ├── Fastfile
│   └── Appfile
│
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md
```

---

## スケーラビリティ戦略

### 1. オフライン・ファースト設計

**原則**: ネット接続なしでも完全に動作する。

```typescript
// データフロー
User Action → Local Storage (MMKV) → UI Update → Background Sync (Supabase)

// 実装例
const useLabels = () => {
  // ローカルストレージから即座に読み込み
  const localLabels = useMMKV('labels');

  // バックグラウンドでSupabaseと同期
  const { data: remoteLabels } = useQuery(
    'labels',
    () => supabase.from('labels').select(),
    {
      staleTime: 5 * 60 * 1000,    // 5分間キャッシュ
      cacheTime: 10 * 60 * 1000,   // 10分間保持
    }
  );

  // マージロジック: ローカル優先、リモートで補完
  return useMemo(
    () => mergeLabels(localLabels, remoteLabels),
    [localLabels, remoteLabels]
  );
};
```

**同期戦略**:
- Write: ローカル → UI反映 → バックグラウンド同期
- Read: ローカルキャッシュ → バックグラウンド更新
- Conflict Resolution: Last-Write-Wins (updated_at比較)

### 2. パフォーマンス最適化

| 技術 | 効果 |
|------|------|
| **MMKV** | AsyncStorageの10倍以上高速 |
| **React Query** | 自動キャッシング、重複リクエスト削減 |
| **Reanimated v3** | UIスレッドでアニメーション実行（60fps保証） |
| **Hermes** | Androidのメモリ使用量削減、起動時間短縮 |
| **Code Splitting** | 機能ごとに分割、初回ロード高速化 |

### 3. 機能拡張の設計

プラグイン的に機能を追加できる構造。

```typescript
features/
├── timer/          # Phase 1: MVP
├── labels/         # Phase 1: MVP
├── auth/           # Phase 1: MVP
├── statistics/     # Phase 2: 統計・インサイト
├── themes/         # Phase 3: カスタムテーマ
├── sounds/         # Phase 3: カスタム音声
├── collaboration/  # Phase 4: グループタイマー
└── premium/        # Phase 5: サブスクリプション
```

各機能は完全に独立し、他機能への影響なく追加・削除可能。

### 4. データベーススケーリング

**Supabaseの自動スケーリング活用**:
- 無料プラン: 50,000 MAU、500MB DB
- Pro プラン: 100,000 MAU、8GB DB
- 自動バックアップ、ポイントインタイムリカバリ

**将来的な最適化**:
- Read Replica（読み取り専用レプリカ）
- Connection Pooling（接続プール）
- Materialized Views（集計データの事前計算）

---

## 開発ロードマップ

### Phase 1: MVP (4-6週間)

#### Week 1-2: セットアップ・基盤
```
□ React Native CLI プロジェクト初期化
  - TypeScript設定
  - ESLint, Prettier設定
  - Husky (Git hooks) 設定

□ Supabase プロジェクトセットアップ
  - データベーススキーマ作成
  - RLS (Row Level Security) 設定
  - Auth設定 (Email, Apple, Google)

□ CI/CD パイプライン構築
  - GitHub Actions設定
  - 自動テスト実行
  - Fastlane設定

□ 基本的なナビゲーション構造
  - React Navigation設定
  - 画面遷移フロー
```

#### Week 3-4: コア機能実装
```
□ アナログ時計UI
  - SVGで時計盤描画
  - 針のアニメーション (Reanimated)
  - タッチ操作対応

□ タイマーロジック
  - Zustandで状態管理
  - カウントダウン処理
  - バックグラウンド実行対応

□ プリセットボタン
  - 3分、5分、10分、25分、60分
  - カスタム時間設定

□ 通知機能
  - Notifee設定
  - 鈴の音再生
  - iOS/Android権限処理

□ ラベル機能
  - CRUD操作
  - ローカルストレージ (MMKV)
```

#### Week 5-6: 認証・同期・テスト
```
□ Supabase Auth統合
  - Email認証
  - Apple Sign In
  - Google Sign In
  - ゲストモード

□ オフライン同期ロジック
  - React Query設定
  - ローカル↔リモート同期
  - 競合解決

□ テスト作成
  - Jest単体テスト (80%カバレッジ)
  - Detox E2Eテスト
  - スナップショットテスト

□ デザインシステム確立
  - 禅テーマ実装
  - コンポーネントライブラリ
  - アニメーション統一
```

---

### Phase 2: ストアリリース (2-3週間)

```
□ App Store / Google Play 申請準備
  - アプリアイコン最終調整
  - スクリーンショット作成
  - プロモーション動画撮影

□ 法務・コンプライアンス
  - プライバシーポリシー作成
  - 利用規約作成
  - App Store審査ガイドライン対応

□ エラーモニタリング
  - Sentry統合
  - クラッシュレポート設定

□ アナリティクス
  - Firebase Analytics統合
  - イベントトラッキング設定

□ ベータテスト
  - TestFlight (iOS)
  - Internal Testing (Android)
  - フィードバック収集・対応

□ ストア申請・審査対応
  - 審査提出
  - リジェクション対応
  - リリース
```

---

### Phase 3: 成長フェーズ (3-6ヶ月後)

#### 機能拡張
```
□ 統計ダッシュボード
  - 総タイマー時間
  - 完了率グラフ
  - よく使うラベルランキング
  - 集中時間の可視化

□ カスタムテーマ
  - 配色バリエーション
  - ダークモード対応
  - 季節限定テーマ

□ カスタム音声
  - ユーザー音声アップロード
  - 音声プリセット追加
  - 音量調整

□ ウィジェット対応
  - iOS Home Screen Widget
  - Android Home Screen Widget
  - タイマー状態表示・クイックスタート

□ ウェアラブル対応
  - Apple Watch アプリ
  - Wear OS アプリ
  - 独立動作モード

□ サブスクリプション導入
  - プレミアム機能
  - RevenueCat統合
  - 無料トライアル
```

#### スケーリング
```
□ Supabase Edge Functions
  - サーバーサイドロジック
  - バッチ処理（日次統計計算）
  - Webhook処理

□ CDN配信
  - Supabase Storage経由
  - 音声ファイルの高速配信

□ 多言語対応
  - i18next統合
  - 英語・日本語
  - その他言語追加

□ A/Bテスト
  - 機能実験
  - UIパターンテスト
  - コンバージョン最適化
```

---

## コスト試算

### 開発環境 (無料)
```
- React Native CLI: 無料
- Supabase Free Tier: 無料
  - 50,000 MAU/月
  - 500MB Database
  - 1GB File Storage
  - 2GB Bandwidth
- GitHub: 無料
  - リポジトリ
  - GitHub Actions 2,000分/月
- Sentry: 無料
  - 5,000 イベント/月
```

### 配信
```
- Apple Developer Program: $99/年
- Google Play Developer: $25 (買い切り)
```

### 運用 (初期: 0-10K MAU)
```
- Supabase: $0/月 (Free Tierで十分)
- Sentry: $0/月
- Firebase Analytics: $0/月

合計: $0/月
年間: $99 (Appleのみ)
```

### スケール時 (10K-100K MAU)
```
- Supabase Pro: $25/月
  - 100,000 MAU
  - 8GB Database
  - 100GB File Storage
  - 200GB Bandwidth

- Sentry: $26/月
  - 50,000 イベント/月

- Firebase/Mixpanel: $25-50/月
  - イベント無制限
  - 高度な分析機能

合計: $76-101/月
年間: $1,011-1,311
```

### 大規模時 (100K+ MAU)
```
- Supabase Team/Enterprise: $599+/月
- Sentry Business: $80+/月
- Firebase Blaze: $100-300/月
- RevenueCat (サブスク): $250+/月

合計: $1,029-1,429/月
年間: $12,348-17,148
```

---

## 技術的な意思決定の根拠

### なぜReact Native CLIか？
- **フル制御**: ネイティブモジュールの追加が容易
- **パフォーマンス**: Expoより起動が早い
- **将来性**: 複雑な機能追加に対応可能
- **コミュニティ**: 大規模アプリでの実績多数

### なぜSupabaseか？
- **開発速度**: Auth + DB + Storage一体
- **スケーラビリティ**: PostgreSQLベース
- **コスト**: 無料から段階的にスケール
- **TypeScript対応**: 型安全なクエリ
- **オープンソース**: ベンダーロックイン回避

### なぜZustand + React Queryか？
- **Zustand**: Redux比で90%コード削減
- **React Query**: サーバー状態管理のベストプラクティス
- **分離**: ローカル状態とサーバー状態を明確に分離

### なぜMMKVか？
- **速度**: AsyncStorageの10倍以上
- **暗号化**: デフォルトでサポート
- **型安全**: TypeScript対応

---

## セキュリティ考慮事項

### 認証・認可
- Supabase Auth (JWT)
- Row Level Security (RLS) でデータ保護
- Apple Sign In 対応 (App Store要件)

### データ保護
- MMKV暗号化
- HTTPS通信のみ
- API Key環境変数化

### プライバシー
- 個人情報最小化
- GDPR/CCPA準拠
- データ削除機能

---

## まとめ

このアーキテクチャは以下を実現します:

✅ **スケーラビリティ**: 10万ユーザーまで対応可能
✅ **パフォーマンス**: 60fps、高速起動
✅ **開発効率**: TypeScript、モジュール化
✅ **コスト効率**: 無料から段階的にスケール
✅ **メンテナンス性**: Clean Architecture、テスト充実
✅ **拡張性**: プラグイン的な機能追加

---

**バージョン**: 1.0
**最終更新**: 2025-10-28
**著者**: Claude Code
