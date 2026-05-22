import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { product } = await req.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `あなたは個人開発者のプロダクト発信を支援するマーケティングの専門家です。
以下のプロダクト情報をもとに、各プラットフォーム向けの発信コンテンツを生成してください。

【プロダクト情報】
名前：${product.name}
概要：${product.description}
ターゲットユーザー：${product.target}
主な特徴・強み：${product.features}
URL：${product.url || "未設定"}

【生成するコンテンツ】

---LP_HERO---
LP用ヒーローコピー（キャッチコピー1行 + サブコピー2〜3行）
個人開発者のプロダクトに刺さる、シンプルで力強い言葉で。

---X_THREAD---
Xバズりスレッド（5〜7ツイート構成）
個人開発者コミュニティでバズりやすい形式で。
1ツイート目は必ずフックになる一言から始める。
「〇〇を作りました」ではなく「〇〇という問題を解決しました」の形で。

---PRODUCT_HUNT---
Product Hunt投稿文（英語）
Tagline（60文字以内）とDescription（300文字程度）を生成。
個人開発者らしい熱量と具体性を持たせる。

---COMMUNITY---
個人開発者コミュニティ向け紹介文（Zenn・Qiita・Discordなど）
技術的な背景・作った理由・どんな課題を解決するかを中心に。300〜500字程度。

---TAGLINE---
サービスの一言キャッチフレーズ（日本語・10〜15字程度）

---X_THREAD_B---
Xバズりスレッド【パターンB】（5〜7ツイート構成）
パターンAとは異なるアングル・切り口で。
例：パターンAが「問題提起型」ならBは「ビフォーアフター型」や「数字で語る型」にする。

---BEST_TIME---
最適な投稿時間帯の提案
ターゲットユーザーの属性・業界・行動パターンを分析して、
曜日・時間帯・理由をセットで3パターン提案する。

---TRENDS---
このプロダクトに関連するトレンドワード・ハッシュタグ提案
今の業界トレンドと掛け合わせることでバズりやすくなるキーワードを10個提案。
なぜそのワードが有効かの理由も一言添える。

各セクションは必ず上記の「---セクション名---」で区切ること。`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    if (!text) throw new Error("生成に失敗しました");

    // セクションごとにパース
    const sections: Record<string, string> = {};
    const sectionNames = ["LP_HERO", "X_THREAD", "PRODUCT_HUNT", "COMMUNITY", "TAGLINE", "X_THREAD_B", "BEST_TIME", "TRENDS"];

    for (let i = 0; i < sectionNames.length; i++) {
      const name = sectionNames[i];
      const nextName = sectionNames[i + 1];
      const start = text.indexOf(`---${name}---`);
      const end = nextName ? text.indexOf(`---${nextName}---`) : text.length;
      if (start !== -1) {
        sections[name] = text.slice(start + name.length + 6, end).trim();
      }
    }

    return NextResponse.json({ sections });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
