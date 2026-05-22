"use client";

import { useState } from "react";

type Screen = "top" | "input" | "result";

interface Product {
  name: string;
  description: string;
  target: string;
  features: string;
  url: string;
}

const TABS = [
  { key: "LP_HERO", label: "🖥️ LPコピー" },
  { key: "X_THREAD", label: "𝕏 Xスレッド" },
  { key: "PRODUCT_HUNT", label: "🚀 Product Hunt" },
  { key: "COMMUNITY", label: "💬 コミュニティ" },
  { key: "TAGLINE", label: "✨ タグライン" },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");
  const [product, setProduct] = useState<Product>({ name: "", description: "", target: "", features: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("LP_HERO");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function generate() {
    if (!product.name || !product.description || !product.target || !product.features) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        setScreen("result");
      } else {
        showToast("生成に失敗しました");
      }
    } catch {
      showToast("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    const text = sections[activeTab] || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isFormValid = product.name && product.description && product.target && product.features;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-white/20 border-t-green-400 rounded-full animate-spin mb-4" />
          <p className="text-white font-semibold">発信コンテンツを生成中...</p>
          <p className="text-zinc-400 text-sm mt-2">各プラットフォーム向けに最適化しています</p>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-zinc-800">
        <button onClick={() => setScreen("top")} className="font-black tracking-widest text-lg text-green-400 hover:opacity-70 transition-opacity">
          LAUNCH
        </button>
        <p className="text-xs text-zinc-500">個人開発者の発信を加速する</p>
      </header>

      {/* Top screen */}
      {screen === "top" && (
        <div className="flex flex-col">
          {/* Hero */}
          <div className="flex flex-col items-center text-center px-8 py-24 max-w-3xl mx-auto w-full">
            <p className="text-xs tracking-widest text-green-400 uppercase mb-4">For Indie Developers</p>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="block">作ったものを、</span>
              <span className="block">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">世界に届ける。</span>
              </span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl leading-relaxed mb-10">
              プロダクト情報を入力するだけで、LP・Xスレッド・Product Hunt・コミュニティ投稿まで<br />
              全部まとめて生成する。
            </p>
            <button
              onClick={() => setScreen("input")}
              className="bg-green-500 hover:bg-green-400 text-zinc-900 font-black px-12 py-4 rounded-2xl text-sm transition-colors"
            >
              無料で試す →
            </button>
          </div>

          {/* 生成されるもの */}
          <div className="bg-zinc-900 px-6 py-16 border-t border-zinc-800">
            <div className="max-w-2xl mx-auto">
              <p className="text-center text-xs tracking-widest text-zinc-500 uppercase mb-10">What we generate</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: "🖥️", title: "LPコピー", desc: "ヒーロー文章をそのまま使える" },
                  { icon: "𝕏", title: "Xスレッド", desc: "バズりやすい構成で自動生成" },
                  { icon: "🚀", title: "Product Hunt", desc: "英語投稿文を即生成" },
                  { icon: "💬", title: "コミュニティ", desc: "Zenn・Qiita向け紹介文" },
                  { icon: "✨", title: "タグライン", desc: "一言で刺さるキャッチコピー" },
                  { icon: "⚡", title: "全部まとめて", desc: "1回の入力で5種類同時生成" },
                ].map((item) => (
                  <div key={item.title} className="bg-zinc-800/50 rounded-2xl p-4">
                    <p className="text-2xl mb-2">{item.icon}</p>
                    <p className="font-bold text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <button
                  onClick={() => setScreen("input")}
                  className="bg-green-500 hover:bg-green-400 text-zinc-900 font-black px-10 py-4 rounded-2xl text-sm transition-colors"
                >
                  今すぐ試す →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input screen */}
      {screen === "input" && (
        <div className="flex items-start justify-center min-h-[calc(100vh-60px)] p-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-1">プロダクト情報を入力</h2>
            <p className="text-sm text-zinc-500 mb-6">入力するだけで全プラットフォーム向けに自動生成します</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">プロダクト名 *</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="例：TRACE"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">どんなサービスか *</label>
                <textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  rows={3}
                  placeholder="例：求人票から業務シナリオを自動生成し、AIとのやり取りで仕事力を測る採用サービス"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">ターゲットユーザー *</label>
                <input
                  type="text"
                  value={product.target}
                  onChange={(e) => setProduct({ ...product, target: e.target.value })}
                  placeholder="例：採用担当者・人事・スタートアップの経営者"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">主な特徴・強み *</label>
                <textarea
                  value={product.features}
                  onChange={(e) => setProduct({ ...product, features: e.target.value })}
                  rows={3}
                  placeholder="例：SPIと違い対策不要・実際の業務で測定・AIが即座に評価レポート生成"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">URL（任意）</label>
                <input
                  type="text"
                  value={product.url}
                  onChange={(e) => setProduct({ ...product, url: e.target.value })}
                  placeholder="例：https://trace-chi-red.vercel.app"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!isFormValid}
              className="w-full mt-6 bg-green-500 hover:bg-green-400 text-zinc-900 font-black py-4 rounded-2xl text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              発信コンテンツを生成する →
            </button>
          </div>
        </div>
      )}

      {/* Result screen */}
      {screen === "result" && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === tab.key
                    ? "bg-green-500 text-zinc-900"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest">
                {TABS.find(t => t.key === activeTab)?.label}
              </p>
              <button
                onClick={copyText}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? "✅ コピーした" : "📋 コピー"}
              </button>
            </div>
            <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
              {sections[activeTab] || "生成されませんでした"}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen("input")}
              className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-3 font-semibold hover:bg-zinc-800 transition-colors text-sm"
            >
              ← 内容を変更する
            </button>
            <button
              onClick={() => { setScreen("top"); setProduct({ name: "", description: "", target: "", features: "", url: "" }); setSections({}); }}
              className="flex-1 border border-zinc-700 text-zinc-400 rounded-xl py-3 font-semibold hover:bg-zinc-800 transition-colors text-sm"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
