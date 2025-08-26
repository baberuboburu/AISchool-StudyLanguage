// src/app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {

  // 初期値
	const [language, setLanguage] = useState<string | null>(null);
	const [difficulty, setDifficulty] = useState<string | null>(null);
	const [qtype, setQtype] = useState<string | null>(null);
	
	// 判定式
  const step1Active = true;
	const step2Active = step1Active && !!language;
	const step3Active = step2Active && !!difficulty;
  const canStart = step3Active && !!qtype;

  return (
    <main className="bg-[#F7F7F7] w-[100vw] h-[100vh] max-lg:h-full max-lg:pb-[50px]">
      <section className="pt-[37px]">
        <h1 className="text-[#1E1E1E] text-[26px] font-bold tracking-[0.06em] leading-none text-center">出題選択</h1>

        <div className="flex justify-center items-center mt-[63px]">
          <Step label="言語" number="01" active={step1Active}/>
          <Divider active={step1Active}/>
          <Step label="難易度" number="02" active={step2Active}/>
          <Divider active={step2Active}/>
          <Step label="出題" number="03" active={step3Active}/>
        </div>

        <div className="flex justify-center items-center gap-[42px] mt-[37px] max-lg:flex-col">
          <Card
            select1="英語" select2="中国語" select3="フランス語"
            active={step1Active}
            selected={language}
            onSelect={(v) => { setLanguage(v); setDifficulty(null); setQtype(null); }}
          />
          <Card
            select1="初級" select2="中級" select3="上級"
            active={step2Active}
            selected={difficulty}
            onSelect={(v) => { if (!step2Active) return; setDifficulty(v); setQtype(null); }}
          />
          <Card
            select1="単語" select2="文法" select3="和訳"
            active={step3Active}
            selected={qtype}
            onSelect={(v) => { if (!step3Active) return; setQtype(v); }}
          />
        </div>

        <StartButton active={canStart} language={language} difficulty={difficulty} qtype={qtype}/>

      </section>
    </main>
  );
};

function Step(props: { label: string; number: string; active?: boolean }) {
  const { label, number, active } = props;
  return (
    <div className="flex flex-col justify-between items-center">
      <div className={`w-[92px] h-[92px] rounded-full flex items-center justify-center ${active ? 'bg-[#0764C0] text-white' : 'bg-gray-200 text-gray-500'}`}>
          <span className={`text-[16px] font-bold tracking-[0.06em] leading-none ${active ? 'text-white' : 'text-[#9C9C9C]'}`}>{number}</span>
      </div>
      <span className={`mt-[9px] text-[16px] font-bold tracking-[0.06em] leading-none ${active ? 'text-[#1E1E1E]' : 'text-[#9C9C9C]'}`}>{label}</span>
    </div>
  );
};

function Divider(props: {active?: boolean}) {
  const { active } = props;
  return <div className={`h-[1px] w-[248px] translate-y-[-16.5px] ${active ? 'bg-[#0764C0]' : 'bg-[#D9D9D9]'}`}/>;
}

function Card(props: { select1: string; select2: string; select3: string; selected: string | null, active?: boolean; onSelect: (v: string) => void;}) {
  const { select1, select2, select3, active=true, selected, onSelect } = props;
  const selectedArray: boolean[] = [
    selected === select1,
    selected === select2,
    selected === select3,
  ];
  
  return (
    <div className={`bg-white rounded-[6px] p-[16px] flex flex-col justify-between items-center gap-[12px] ${active ? '' : 'opacity-40 pointer-events-none'}`}>
      <Select option={select1} active={active} selected={selectedArray[0]} onClick={() => onSelect(select1)}/>
      <Select option={select2} active={active} selected={selectedArray[1]} onClick={() => onSelect(select2)}/>
      <Select option={select3} active={active} selected={selectedArray[2]} onClick={() => onSelect(select3)}/>
    </div>
  );
};

function Select(props: { option: string; active: boolean; selected: boolean; onClick: () => void;}) {
  const { option, active, selected, onClick } = props;
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={active ? onClick : undefined}
      onKeyDown={(e) => {
        if (active && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
      className={`flex justify-center items-center pt-[11px] pb-[11px] w-[274px] rounded-[6px] border-[#1E1E1E] ${selected ? 'bg-[#0764C0]' : 'bg-[#F8F8F8]'}`}
      aria-pressed={selected}
    >
      <p className={`text-[16px] font-bold tracking-[0.06em] leading-none ${selected ? 'text-white' : active ? 'text-[#1E1E1E]' : 'text-[#9C9C9C]'}`}>{option}</p>
    </div>
  );
}

function StartButton(props: {active: boolean, language: string | null; difficulty: string | null; qtype: string | null;}) {
  const { active, language, difficulty, qtype } = props;
  const router = useRouter();

  const handleClick = () => {
    if (!active) return;
    router.push(`/chat?language=${language}&difficulty=${difficulty}&qtype=${qtype}`);
  };

  return (
    <div className="flex justify-center items-center mt-[183px] max-lg:mt-[80px] max-lg:w-[90%] max-lg:mx-auto">
      <button
        className={`w-[462px] pt-[18px] pb-[18px] text-white text-[16px] font-normal tracking-[0.19em] leading-none bg-[linear-gradient(to_right,#0152A3_0%,#00A5EC_100%)]
          ${active ? 'opacity-100' : 'opacity-60 cursor-not-allowed'}`}
        disabled={!active}
        onClick={handleClick}
      >
      学習開始
      </button>
    </div>
  );
};