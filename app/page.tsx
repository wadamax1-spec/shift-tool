'use client';
import React, { useState, useEffect } from 'react';

export default function App() {
  const createNewStore = (name: string) => ({
    storeName: "店舗1", year: 2024, month: 5,
    salesBudget: 2000000, targetRatio: 45,
    salaryFixed: 250000, partBudget: 650000,
    averageRate: 1300, businessDays: 30,
    staffs: [
      { id: 1, name: '', type: 'パート', hours: Array(31).fill('') },
      { id: 2, name: '', type: 'パート', hours: Array(31).fill('') },
      { id: 3, name: '', type: 'パート', hours: Array(31).fill('') },
      { id: 4, name: '', type: 'パート', hours: Array(31).fill('') },
    ]
  });

  const [stores, setStores] = useState(() => {
    const saved = localStorage.getItem('labor_final_pro_v5');
    return saved ? JSON.parse(saved) : { "店舗1": createNewStore("店舗1") };
  });
  const [activeStoreKey, setActiveStoreKey] = useState(() => localStorage.getItem('active_pro_v5') || "店舗1");
  const currentStore = stores[activeStoreKey] || stores[Object.keys(stores)[0]];

  useEffect(() => {
    localStorage.setItem('labor_final_pro_v5', JSON.stringify(stores));
    localStorage.setItem('active_pro_v5', activeStoreKey);
  }, [stores, activeStoreKey]);

  const updateStoreData = (field: string, value: any) => {
    setStores((prev: any) => ({ ...prev, [activeStoreKey]: { ...prev[activeStoreKey], [field]: value } }));
  };

  const calculateHours = (str: string) => {
    if (!str || !str.includes('-')) return 0;
    const p = str.replace('：', ':').split('-');
    const parse = (t: string) => { 
      let [h, m] = t.trim().split(':').map(Number); 
      return (h || 0) + (m || 0) / 60; 
    };
    try {
      const d = parse(p[1]) - parse(p[0]);
      return d < 0 ? d + 24 : d;
    } catch { return 0; }
  };

  const getStaffStats = (hours: string[]) => {
    const total = hours.reduce((s, h) => s + calculateHours(h), 0);
    const days = hours.filter(h => calculateHours(h) > 0).length;
    return { total: total.toFixed(1), days };
  };

  const totalHoursAll = currentStore.staffs.reduce((sum: number, s: any) => sum + parseFloat(getStaffStats(s.hours).total), 0);
  const currentCost = totalHoursAll * currentStore.averageRate;
  const actualRatio = currentStore.salesBudget > 0 ? ((currentCost + currentStore.salaryFixed) / currentStore.salesBudget) * 100 : 0;
  const daysArray = Array.from({ length: new Date(currentStore.year, currentStore.month, 0).getDate() }, (_, i) => i + 1);

  return (
    <div className="p-4 bg-[#f1f5f9] min-h-screen font-sans text-xs">
      <style>{`
        @media print { .no-print { display: none; } body { background: white; padding: 0; } }
        table { border-collapse: collapse; border: 1.5px solid #000; width: 100%; table-layout: fixed; background: white; }
        th, td { border: 1px solid #ccc; text-align: center; }
        .day-sun { background: #fff5f5; color: #ef4444; }
        .day-sat { background: #f0f9ff; color: #3b82f6; }
      `}</style>

      {/* タブ */}
      <div className="flex gap-1 mb-2 no-print">
        {Object.keys(stores).map(k => (
          <div key={k} className="flex border border-slate-300 rounded-t-lg bg-white">
            <button onClick={() => setActiveStoreKey(k)} className={`px-4 py-1.5 ${activeStoreKey === k ? 'font-bold border-t-2 border-t-blue-500' : 'text-slate-500'}`}>{k}</button>
            <button onClick={() => {if(window.confirm('店舗を削除しますか？')){const n={...stores}; delete n[k]; setStores(n); setActiveStoreKey(Object.keys(n)[0])}}} className="px-1 text-slate-300 hover:text-red-500 border-l border-slate-100">×</button>
          </div>
        ))}
        <button onClick={() => {const n = window.prompt("店舗名"); if(n) setStores((p:any)=>({...p,[n]:createNewStore(n)}))}} className="px-4 py-1.5 text-blue-500 font-bold bg-white border border-slate-300 rounded-t-lg ml-1">+店舗追加</button>
      </div>

      {/* 5枚カード：画像通りに文言・配置を完全固定 */}
      <div className="flex gap-2 mb-3 h-[100px]">
        <div className="w-[12%] bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-400">店舗名 (変更可)</div>
          <input className="w-full font-bold text-lg mt-1 outline-none" value={currentStore.storeName} onChange={e => updateStoreData('storeName', e.target.value)} />
        </div>

        <div className="w-[28%] bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-400">売上予算 × 目標比率</div>
          <div className="flex items-center gap-1 mt-1">
            <input type="number" className="w-[110px] font-bold text-2xl outline-none" value={currentStore.salesBudget} onChange={e=>updateStoreData('salesBudget', Number(e.target.value))} />
            <span className="text-2xl text-slate-300">×</span>
            <input type="number" className="w-10 font-bold text-2xl outline-none text-center" value={currentStore.targetRatio} onChange={e=>updateStoreData('targetRatio', Number(e.target.value))} />
            <span className="text-xl font-bold">%</span>
          </div>
          <div className="text-[10px] text-slate-400">予算上限: {(currentStore.salesBudget * (currentStore.targetRatio/100)).toLocaleString()}円</div>
        </div>

        <div className="w-[20%] bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-400 font-bold italic">時間分析 (パート・プロ契)</div>
          <div className="text-[10px] mt-1 font-bold">予算内可能総時間:</div>
          <div className="text-lg font-bold">{(currentStore.averageRate > 0 ? currentStore.partBudget / currentStore.averageRate : 0).toFixed(1)}h</div>
          <div className="text-[10px] text-blue-500 font-bold">時間差異: {( (currentStore.partBudget / (currentStore.averageRate || 1)) - totalHoursAll ).toFixed(1)}h</div>
        </div>

        <div className="w-[20%] bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-400 italic">人件費差異 (予算残高)</div>
          <div className="text-[20px] font-bold text-emerald-500 mt-3">{(currentStore.partBudget - currentCost).toLocaleString()}円</div>
        </div>

        <div className="w-[20%] bg-[#1e293b] text-white p-3 rounded-xl shadow-lg">
          <div className="text-[10px] text-slate-400 italic">実質人件費率 / 営業日数</div>
          <div className={`text-[26px] font-bold mt-1 ${actualRatio > currentStore.targetRatio ? 'text-red-400' : 'text-emerald-400'}`}>{actualRatio.toFixed(1)}%</div>
          <div className="text-[11px] mt-1">営業日: <input type="number" className="bg-transparent border-b border-slate-500 w-8 text-center outline-none" value={currentStore.businessDays} onChange={e=>updateStoreData('businessDays', Number(e.target.value))} /> 日</div>
        </div>
      </div>

      {/* 黄色枠エリア：文言・配置を画像通りに再現 */}
      <div className="border-[2.5px] border-yellow-400 bg-white p-4 mb-3 flex items-center justify-between no-print rounded-xl shadow-sm">
        <div className="flex gap-8">
          <div className="text-[11px] font-bold text-emerald-600">社員給与合計:<br/>
            <input type="number" className="w-24 border rounded p-1 text-black font-normal text-sm mt-1" value={currentStore.salaryFixed} onChange={e=>updateStoreData('salaryFixed', Number(e.target.value))} /> <span className="text-black font-normal">円</span>
          </div>
          <div className="text-[11px] font-bold text-blue-600">パート・プロ契約給与:<br/>
            <input type="number" className="w-24 border rounded p-1 text-black font-normal text-sm mt-1" value={currentStore.partBudget} onChange={e=>updateStoreData('partBudget', Number(e.target.value))} /> <span className="text-black font-normal">円</span>
          </div>
          <div className="text-[11px] font-bold text-slate-700">平均時給:<br/>
            <input type="number" className="w-20 border rounded p-1 text-black font-normal text-sm mt-1" value={currentStore.averageRate} onChange={e=>updateStoreData('averageRate', Number(e.target.value))} /> <span className="text-black font-normal">円</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <input type="number" className="w-14 border rounded p-1 text-center font-bold" value={currentStore.year} onChange={e=>updateStoreData('year', Number(e.target.value))} /> 年
          <input type="number" className="w-10 border rounded p-1 text-center font-bold" value={currentStore.month} onChange={e=>updateStoreData('month', Number(e.target.value))} /> 月
          <button onClick={() => updateStoreData('staffs', [...currentStore.staffs, { id: Date.now(), name: '', type: 'パート', hours: Array(31).fill('') }])} className="ml-3 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs shadow-sm hover:bg-slate-50">+スタッフ追加</button>
          <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-700 text-white rounded text-xs shadow-sm hover:bg-slate-800">印刷</button>
        </div>
      </div>

      {/* テーブル：氏名欄・削除「×」付き */}
      <table>
        <thead>
          <tr className="bg-slate-50">
            <th className="w-[40px] py-1 font-normal">日</th><th className="w-[40px] font-normal">曜</th>
            {currentStore.staffs.map((s: any, idx: number) => {
              const stats = getStaffStats(s.hours);
              return (
                <th key={s.id} className="p-1 relative border-x h-[90px]">
                  <button onClick={() => {if(window.confirm('スタッフを削除しますか？')) updateStoreData('staffs', currentStore.staffs.filter((st:any)=>st.id!==s.id))}} className="no-print absolute top-1 right-1 text-slate-300 hover:text-red-500">×</button>
                  <div className="text-[10px] text-slate-400 font-normal">氏名</div>
                  <select className="text-[11px] border rounded mb-1 bg-white" value={s.type} onChange={e => {const n = [...currentStore.staffs]; n[idx].type = e.target.value; updateStoreData('staffs', n);}}>
                    <option>パート</option><option>プロ契</option><option>社員</option>
                  </select><br/>
                  <input className="w-[90%] font-bold text-center border-b border-slate-100 outline-none text-[14px]" value={s.name} placeholder="入力" onChange={e => {const n = [...currentStore.staffs]; n[idx].name = e.target.value; updateStoreData('staffs', n);}} /><br/>
                  <div className="text-[10px] text-blue-500 font-bold mt-1 italic leading-tight">{stats.total}h / {stats.days}日</div>
                </th>
              );
            })}
            <th className="w-[60px] bg-yellow-50 font-bold text-xs">日計(h)</th>
          </tr>
        </thead>
        <tbody>
          {daysArray.map(day => {
            const date = new Date(currentStore.year, currentStore.month - 1, day);
            const w = date.getDay();
            const total = currentStore.staffs.reduce((sum: number, s: any) => sum + calculateHours(s.hours[day-1]), 0);
            return (
              <tr key={day} className="h-7 hover:bg-slate-50">
                <td className={`font-bold ${w===0?'day-sun':w===6?'day-sat':''}`}>{day}</td>
                <td className={`${w===0?'day-sun':w===6?'day-sat':''}`}>{['日','月','火','水','木','金','土'][w]}</td>
                {currentStore.staffs.map((s: any, sIdx: number) => (
                  <td key={s.id} className={`${w===0?'day-sun':w===6?'day-sat':''}`}>
                    <input className="w-full h-full text-center bg-transparent outline-none focus:bg-white" value={s.hours[day-1]} placeholder="-" onChange={e => {const n = [...currentStore.staffs]; n[sIdx].hours[day-1] = e.target.value; updateStoreData('staffs', n);}} />
                  </td>
                ))}
                <td className="bg-yellow-50 font-bold text-xs">{total > 0 ? total.toFixed(1) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
