'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// モックAPIエンドポイントとキー
const API_URL = "https://api.dify.ai/v1/chat-messages";
const API_KEY = process.env.DIFY_API_KEY;

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function ChatPage() {
  console.log(`Dify API Key: ${process.env.DIFY_API_KEY}`)
  const searchParams = useSearchParams();

  const language = searchParams.get('language') || '未選択';
  const difficulty = searchParams.get('difficulty') || '未選択';
  const qtype = searchParams.get('qtype') || '未選択';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  // ユーザー送信処理
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    try {
      // Dify ワークフロー API 呼び出し
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          query: input || "問題を出題してください。",
          inputs: { 
            "language": language,
            "difficulty": difficulty,
            "qtype": qtype
           },
          response_mode: 'blocking',
          conversation_id: conversationId || '',
          "user": "test-user-001",
          "files": []
        }),
      });

      const data = await res.json() as { answer: string; conversation_id?: string };
      const newAiMessage: Message = { role: 'ai', content: data.answer ?? '(no answer)' };
      setMessages(prev => [...prev, newAiMessage]);
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'エラーが発生しました。' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const handleBack = () => {
    // 以前の選択状態を保ったまま「出題範囲」画面へ戻す
    // 出題範囲のパスが "/" でない場合は、下の '/' を該当パスに変更してください
    const params = new URLSearchParams();
    if (language) params.set('language', language);
    if (difficulty) params.set('difficulty', difficulty);
    if (qtype) params.set('qtype', qtype);
    router.push(`/${params.toString() ? `?${params.toString()}` : ''}`);
    // 直前のページに戻すだけで良ければ: router.back();
  };

  return (
    <main className="h-[100vh] w-[100vw] flex flex-col bg-[#F7F7F7]">
      
      {/* ヘッダー */}
      <header className="bg-white h-[65px] flex justify-between items-center">
        <button
          onClick={handleBack}
          aria-label="出題範囲へ戻る"
          className="ml-[55px] text-[#1E1E1E] text-[16px] font-normal tracking-[0em] leading-none max-md:ml-[15px] max-md:text-[14px]"
        >← 出題範囲へ戻る</button>
        <p className="text-[#1E1E1E] text-[24px] font-normal tracking-[0.06em] leading-none max-md:text-[18px]">【{language} - {difficulty}  - {qtype} 】</p>
        <div className="w-[133.33px]"></div>
      </header>

      {/* チャット履歴表示欄 */}
      <div className="flex-1 overflow-y-auto px-[96px] space-y-[40px] pt-[31px] max-md:px-[5%] pb-[5%]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI 側のアイコン（左） */}
            {m.role !== 'user' && (
              <div className="mr-[24px] w-[64px] h-[64px] rounded-full bg-[#0B66C3] flex items-center justify-center shrink-0 max-md:hidden">
                <span
                  className="w-[36px] h-[36px] bg-[url('/AI.png')] bg-no-repeat bg-center bg-contain  max-md:w-[27px] max-md:h-[27px]"
                  aria-hidden="true"
                />
                {/* 画像がない場合は ↓ を代わりに: <span className="text-white text-2xl">🎓</span> */}
              </div>
            )}

            {/* 吹き出し */}
            <div
              className={`text-[#1E1E1E] max-w-[70%] p-[18px] rounded-[12px] text-[16px] leading-[1.9] whitespace-pre-line max-md:p-[13.5px] max-md:max-w-[95%]
                ${m.role === 'user' ? 'bg-[#EDEDED]' : 'bg-[#E2EDF9]'}
              `}
            >
              {m.content}
            </div>
            
            {/* ユーザー側のアイコン（右） */}
            {m.role === 'user' && (
              <div className="ml-[24px] w-[64px] h-[64px] rounded-full bg-[#9CA3AF] flex items-center justify-center shrink-0 max-md:hidden">
                <span
                  className="w-[32px] h-[32px] bg-[url('/user.png')] bg-no-repeat bg-center bg-contain max-md:w-[24px] max-mdh-[24px]"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-blue-50 rounded-lg text-sm text-gray-500">
              AIが入力中…
            </div>
          </div>
        )}
      </div>


      {/* 入力欄 */}
      <div className="h-[117px] w-full bg-white flex justify-center items-center pt-[17px] pb-[17px]">
        <textarea
          className="w-[782px] h-[83px] border border-[#D4D4D4] resize-none max-lg:w-[90%] "
          placeholder="こちらのチャット欄から回答してみましょう。"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-[18px] h-[18px] bg-[url('/send.png')] bg-center bg-contain -translate-x-[35px] cursor-pointer"
        >
        </button>
      </div>
    </main>
  );
}
