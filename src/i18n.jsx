import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const en = {
  nav: { home: 'Home', record: 'Record', trends: 'Trends', history: 'History' },
  app: { tagline: 'Health RPG' },
  home: {
    level: 'LEVEL', toNext: '{n} EXP to Level {l}', streak: '{n}-day streak', badges: 'Badges', next: 'Next',
    allBadges: 'All badges unlocked! 🎉', latest: 'Latest reading', install: 'Install PulseQuest',
    installDesc: 'Add it to your home screen for the full app experience.',
    installIOS: "In Safari tap Share, then 'Add to Home Screen'.", installBtn: 'Install',
    noReadings: 'No readings yet. Log your first one!', log: 'Log Reading',
    nudge: "You haven't logged today. Keep your streak alive!", sysdia: 'SYS / DIA · mmHg', bpm: 'bpm',
  },
  record: {
    title: ['New', 'Reading'], sys: 'SYSTOLIC (SYS)', dia: 'DIASTOLIC (DIA)', hr: 'HEART RATE (PULSE)',
    tagTitle: 'NOTES / TAG', tagOpt: '(optional, +5 EXP)', custom: 'Or type a custom note…', save: 'Save Reading',
    auto: 'The date and time are captured automatically when you save.',
    tags: ['Morning', 'After Exercise', 'Before Bed', 'After Meal', 'Stressed', 'Resting'],
    eFill: 'Please fill in SYS, DIA and Pulse.', eSys: 'Systolic should be between 50 and 260 mmHg.',
    eDia: 'Diastolic should be between 30 and 160 mmHg.', eHr: 'Pulse should be between 30 and 220 bpm.',
    eOrder: 'Systolic must be higher than diastolic.',
  },
  modal: {
    saved: 'Reading saved!', levelUp: '🎉 LEVEL UP! You are now level {n}', badge: 'Badge unlocked: {name}', ok: 'Awesome!',
    disclaimer: 'General guidance based on standard (AHA) categories. It is not medical advice. Consult your clinician.',
  },
  trends: {
    title: ['Trends &', 'Analytics'], d7: '7 Days', d30: '30 Days', all: 'All Time', none: 'No readings in this range.',
    hint: 'Tap or drag on the chart to inspect a reading', avg: 'AVG', insights: 'Smart Insights', pulse: 'Pulse',
  },
  ins: {
    few: 'Log at least 3 readings in this range to unlock Smart Insights.',
    consVery: 'Your systolic pressure is very consistent (±{sd} mmHg). Nice stability!',
    consMod: 'Your systolic pressure varies moderately (±{sd} mmHg).',
    consVar: 'Your systolic pressure swings a lot (±{sd} mmHg). Try measuring under the same conditions each time.',
    eveHigher: 'Your systolic pressure runs about {d} mmHg higher in the evening.',
    morHigher: 'Your systolic pressure runs about {d} mmHg higher in the morning.',
    noDiff: 'No big time-of-day difference. Morning and evening readings are similar.',
    hr: 'Average pulse {a} bpm, {s} (±{sd}).', stab1: 'very stable', stab2: 'fairly stable', stab3: 'quite variable',
    hrHigh: ' That is above the typical resting range.', hrLow: ' That is below the typical resting range.',
    spike: '{n} reading(s) were high. Most recent: {date}{tag}.',
    down: 'Recent systolic readings are trending down by about {d} mmHg.', up: 'Recent systolic readings are trending up by about {d} mmHg.',
    pct: '{p}% of your readings are in the normal range.',
  },
  hist: {
    title: ['History &', 'Export'], entries: '{n} entries', export: 'Export to CSV', none: 'No entries yet.', sure: 'Sure?',
    reset: 'Reset to demo data', resetConfirm: 'Replace all data with demo data?', delete: 'Delete entry',
  },
  csv: { date: 'Date', time: 'Time', sys: 'Systolic (mmHg)', dia: 'Diastolic (mmHg)', hr: 'Pulse (bpm)', cat: 'Category', note: 'Notes/Tag' },
  set: {
    title: 'Settings', theme: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark', language: 'Language',
    reminders: 'Daily reminders', remDesc: 'Get a nudge to measure at your chosen times.', add: '+ Add time', test: 'Send test notification',
    denied: 'Notifications are blocked. Enable them in your browser or phone settings.',
    unsupported: 'This browser does not support notifications.', iosHint: 'On iPhone, install the app to the home screen first (iOS 16.4+).',
    limits: 'Reminders fire while the app is open or running in the background. A fully closed app needs a push server to be woken up.',
    sent: 'Test notification sent!', close: 'Done', times: 'Reminder times', remove: 'Remove',
  },
  rem: { title: '🩺 Time to check your blood pressure', body: 'Log a reading to keep your streak and earn EXP!', toast: 'Reminder: time to log a reading' },
  cats: {
    low: { label: 'Low', summary: 'Your pressure is lower than the typical range.',
      tips: ['Drink water regularly and do not skip meals.', 'Stand up slowly from sitting or lying down.', 'Add a little more salt only if your doctor agrees.', 'If you feel dizzy, faint or weak, sit down and contact a clinician.'] },
    normal: { label: 'Normal', summary: 'Great job! Your reading is in the healthy range.',
      tips: ['Keep up 150 minutes of moderate activity each week.', 'Eat plenty of fruit, vegetables and whole grains.', 'Keep sodium low and sleep 7–9 hours.', 'Log at the same time each day for reliable trends.'] },
    elevated: { label: 'Elevated', summary: 'Slightly above ideal. Lifestyle changes can bring it back down.',
      tips: ['Cut back on salt and processed foods.', 'Take a brisk 30-minute walk most days.', 'Limit alcohol and caffeine, and try 5 minutes of slow breathing.', 'Recheck in a few days and track the pattern.'] },
    stage1: { label: 'Hypertension Stage 1', summary: 'This is in the Stage 1 hypertension range.',
      tips: ['Talk to your healthcare provider, especially if this repeats.', 'Follow a DASH-style diet: more potassium, less sodium.', 'Aim for a healthy weight and regular exercise.', 'Manage stress, quit smoking, and measure twice a day for a week.'] },
    stage2: { label: 'Hypertension Stage 2', summary: 'This is in the Stage 2 range. Medical follow-up is recommended.',
      tips: ['Contact your doctor soon. Treatment often includes medication.', 'Rest 5 minutes, then re-measure seated with your arm supported.', 'Avoid salt, alcohol and tobacco.', 'Bring your PulseQuest CSV export to your appointment.'] },
    crisis: { label: 'Hypertensive Crisis', summary: 'This reading is dangerously high.',
      tips: ['Rest and re-measure after 5 minutes.', 'If it is still this high, contact your doctor right away.', 'Chest pain, shortness of breath, numbness, vision or speech changes: call emergency services immediately.'] },
  },
  hrs: { low: 'Low', normal: 'Normal', high: 'High' },
  badges: {
    first: { name: 'First Pulse', desc: 'Log your first reading' }, s3: { name: 'On Fire', desc: '3-day streak' },
    s7: { name: 'Week Warrior', desc: '7-day streak' }, l10: { name: 'Data Hero', desc: 'Log 10 readings' },
    g5: { name: 'Green Zone', desc: '5 normal readings' }, tag: { name: 'Tag Master', desc: 'Use 3 different tags' },
    lv3: { name: 'Level 3', desc: 'Reach level 3' },
  },
};

const th = {
  nav: { home: 'หน้าหลัก', record: 'บันทึก', trends: 'แนวโน้ม', history: 'ประวัติ' },
  app: { tagline: 'เฮลท์ RPG' },
  home: {
    level: 'เลเวล', toNext: 'อีก {n} EXP ถึงเลเวล {l}', streak: 'ต่อเนื่อง {n} วัน', badges: 'เหรียญตรา', next: 'ถัดไป',
    allBadges: 'ปลดล็อกครบทุกเหรียญแล้ว! 🎉', latest: 'ค่าล่าสุด', install: 'ติดตั้ง PulseQuest',
    installDesc: 'เพิ่มลงหน้าจอหลักเพื่อใช้งานเต็มรูปแบบ', installIOS: "ใน Safari แตะปุ่มแชร์ แล้วเลือก 'เพิ่มลงหน้าจอโฮม'",
    installBtn: 'ติดตั้ง', noReadings: 'ยังไม่มีค่าที่วัด ลองบันทึกครั้งแรกเลย!', log: 'บันทึกค่า',
    nudge: 'วันนี้คุณยังไม่ได้บันทึก รักษาสตรีคไว้นะ!', sysdia: 'ตัวบน / ตัวล่าง · มม.ปรอท', bpm: 'ครั้ง/นาที',
  },
  record: {
    title: ['บันทึก', 'ค่าความดัน'], sys: 'ความดันตัวบน (SYS)', dia: 'ความดันตัวล่าง (DIA)', hr: 'อัตราการเต้นหัวใจ (ชีพจร)',
    tagTitle: 'บันทึก / แท็ก', tagOpt: '(ไม่บังคับ, +5 EXP)', custom: 'หรือพิมพ์โน้ตของคุณเอง…', save: 'บันทึกค่า',
    auto: 'ระบบจะบันทึกวันและเวลาให้อัตโนมัติเมื่อกดบันทึก',
    tags: ['ตอนเช้า', 'หลังออกกำลังกาย', 'ก่อนนอน', 'หลังอาหาร', 'เครียด', 'พักผ่อน'],
    eFill: 'กรุณากรอกค่าตัวบน ตัวล่าง และชีพจรให้ครบ', eSys: 'ค่าตัวบนควรอยู่ระหว่าง 50 ถึง 260 มม.ปรอท',
    eDia: 'ค่าตัวล่างควรอยู่ระหว่าง 30 ถึง 160 มม.ปรอท', eHr: 'ชีพจรควรอยู่ระหว่าง 30 ถึง 220 ครั้ง/นาที',
    eOrder: 'ค่าตัวบนต้องมากกว่าค่าตัวล่าง',
  },
  modal: {
    saved: 'บันทึกเรียบร้อย!', levelUp: '🎉 เลเวลอัป! ตอนนี้คุณเลเวล {n}', badge: 'ปลดล็อกเหรียญ: {name}', ok: 'เยี่ยมเลย!',
    disclaimer: 'คำแนะนำทั่วไปตามเกณฑ์มาตรฐาน (AHA) ไม่ใช่คำแนะนำทางการแพทย์ โปรดปรึกษาแพทย์',
  },
  trends: {
    title: ['แนวโน้มและ', 'การวิเคราะห์'], d7: '7 วัน', d30: '30 วัน', all: 'ทั้งหมด', none: 'ไม่มีข้อมูลในช่วงเวลานี้',
    hint: 'แตะหรือลากบนกราฟเพื่อดูค่าแต่ละครั้ง', avg: 'เฉลี่ย', insights: 'ข้อมูลเชิงลึกอัจฉริยะ', pulse: 'ชีพจร',
  },
  ins: {
    few: 'บันทึกอย่างน้อย 3 ครั้งในช่วงนี้เพื่อปลดล็อกข้อมูลเชิงลึก',
    consVery: 'ความดันตัวบนของคุณสม่ำเสมอมาก (±{sd} มม.ปรอท) ยอดเยี่ยม!',
    consMod: 'ความดันตัวบนของคุณแปรผันปานกลาง (±{sd} มม.ปรอท)',
    consVar: 'ความดันตัวบนของคุณแกว่งค่อนข้างมาก (±{sd} มม.ปรอท) ลองวัดในสภาพแวดล้อมเดิมทุกครั้ง',
    eveHigher: 'ความดันตัวบนช่วงเย็นสูงกว่าช่วงเช้าประมาณ {d} มม.ปรอท',
    morHigher: 'ความดันตัวบนช่วงเช้าสูงกว่าช่วงเย็นประมาณ {d} มม.ปรอท',
    noDiff: 'ค่าช่วงเช้าและเย็นใกล้เคียงกัน ไม่มีความแตกต่างชัดเจน',
    hr: 'ชีพจรเฉลี่ย {a} ครั้ง/นาที {s} (±{sd})', stab1: 'คงที่มาก', stab2: 'ค่อนข้างคงที่', stab3: 'แปรผันค่อนข้างมาก',
    hrHigh: ' สูงกว่าช่วงปกติขณะพัก', hrLow: ' ต่ำกว่าช่วงปกติขณะพัก',
    spike: 'มี {n} ครั้งที่ค่าสูง ล่าสุดเมื่อ {date}{tag}',
    down: 'ความดันตัวบนล่าสุดมีแนวโน้มลดลงประมาณ {d} มม.ปรอท', up: 'ความดันตัวบนล่าสุดมีแนวโน้มเพิ่มขึ้นประมาณ {d} มม.ปรอท',
    pct: '{p}% ของการวัดอยู่ในเกณฑ์ปกติ',
  },
  hist: {
    title: ['ประวัติและ', 'ส่งออก'], entries: '{n} รายการ', export: 'ส่งออกเป็น CSV', none: 'ยังไม่มีรายการ', sure: 'แน่ใจ?',
    reset: 'รีเซ็ตเป็นข้อมูลตัวอย่าง', resetConfirm: 'แทนที่ข้อมูลทั้งหมดด้วยข้อมูลตัวอย่าง?', delete: 'ลบรายการ',
  },
  csv: { date: 'วันที่', time: 'เวลา', sys: 'ตัวบน (มม.ปรอท)', dia: 'ตัวล่าง (มม.ปรอท)', hr: 'ชีพจร (ครั้ง/นาที)', cat: 'ระดับ', note: 'โน้ต/แท็ก' },
  set: {
    title: 'ตั้งค่า', theme: 'ธีม', auto: 'อัตโนมัติ', light: 'สว่าง', dark: 'มืด', language: 'ภาษา',
    reminders: 'แจ้งเตือนประจำวัน', remDesc: 'รับการแจ้งเตือนให้วัดความดันตามเวลาที่ตั้งไว้', add: '+ เพิ่มเวลา', test: 'ส่งการแจ้งเตือนทดสอบ',
    denied: 'การแจ้งเตือนถูกบล็อก โปรดเปิดในการตั้งค่าเบราว์เซอร์หรือโทรศัพท์',
    unsupported: 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน', iosHint: 'บน iPhone ต้องติดตั้งแอปลงหน้าจอโฮมก่อน (iOS 16.4 ขึ้นไป)',
    limits: 'การแจ้งเตือนทำงานขณะเปิดแอปหรือทำงานเบื้องหลัง หากปิดแอปสนิท ต้องใช้เซิร์ฟเวอร์ push จึงจะปลุกแอปได้',
    sent: 'ส่งการแจ้งเตือนทดสอบแล้ว!', close: 'เสร็จสิ้น', times: 'เวลาแจ้งเตือน', remove: 'ลบ',
  },
  rem: { title: '🩺 ถึงเวลาวัดความดันแล้ว', body: 'บันทึกค่าเพื่อรักษาสตรีคและรับ EXP!', toast: 'เตือน: ถึงเวลาบันทึกค่าความดัน' },
  cats: {
    low: { label: 'ต่ำ', summary: 'ความดันของคุณต่ำกว่าช่วงปกติ',
      tips: ['ดื่มน้ำสม่ำเสมอและไม่ข้ามมื้ออาหาร', 'ลุกขึ้นช้า ๆ เมื่อนั่งหรือนอนอยู่', 'เพิ่มเกลือเล็กน้อยเมื่อแพทย์เห็นชอบเท่านั้น', 'หากเวียนศีรษะ หน้ามืด หรืออ่อนแรง ให้นั่งพักและปรึกษาแพทย์'] },
    normal: { label: 'ปกติ', summary: 'ยอดเยี่ยม! ค่าของคุณอยู่ในเกณฑ์ที่ดีต่อสุขภาพ',
      tips: ['ออกกำลังกายระดับปานกลางให้ได้ 150 นาทีต่อสัปดาห์', 'กินผัก ผลไม้ และธัญพืชไม่ขัดสีให้มาก', 'ลดโซเดียมและนอนหลับ 7–9 ชั่วโมง', 'วัดและบันทึกเวลาเดิมทุกวันเพื่อให้แนวโน้มแม่นยำ'] },
    elevated: { label: 'สูงเล็กน้อย', summary: 'สูงกว่าค่าที่เหมาะสมเล็กน้อย ปรับพฤติกรรมช่วยให้กลับมาปกติได้',
      tips: ['ลดเกลือและอาหารแปรรูป', 'เดินเร็วประมาณ 30 นาทีเกือบทุกวัน', 'จำกัดแอลกอฮอล์และคาเฟอีน ลองหายใจช้า ๆ 5 นาที', 'วัดซ้ำอีกไม่กี่วันและดูแนวโน้ม'] },
    stage1: { label: 'ความดันสูงระยะที่ 1', summary: 'ค่านี้อยู่ในช่วงความดันโลหิตสูงระยะที่ 1',
      tips: ['ปรึกษาแพทย์ โดยเฉพาะหากเกิดซ้ำ', 'กินอาหารแบบ DASH: โพแทสเซียมมากขึ้น โซเดียมน้อยลง', 'รักษาน้ำหนักให้เหมาะสมและออกกำลังกายสม่ำเสมอ', 'จัดการความเครียด เลิกบุหรี่ และวัดวันละ 2 ครั้งเป็นเวลา 1 สัปดาห์'] },
    stage2: { label: 'ความดันสูงระยะที่ 2', summary: 'ค่านี้อยู่ในช่วงระยะที่ 2 แนะนำให้พบแพทย์เพื่อติดตามผล',
      tips: ['ติดต่อแพทย์โดยเร็ว การรักษามักรวมถึงการใช้ยา', 'พัก 5 นาที แล้ววัดซ้ำในท่านั่งโดยวางแขนให้มั่นคง', 'หลีกเลี่ยงเกลือ แอลกอฮอล์ และยาสูบ', 'นำไฟล์ CSV จาก PulseQuest ไปให้แพทย์ดูด้วย'] },
    crisis: { label: 'วิกฤตความดันสูง', summary: 'ค่านี้สูงอันตราย',
      tips: ['พักและวัดซ้ำหลังผ่านไป 5 นาที', 'หากยังสูงเท่าเดิม ให้ติดต่อแพทย์ทันที', 'หากเจ็บหน้าอก หายใจลำบาก ชา มองเห็นหรือพูดผิดปกติ ให้เรียกรถพยาบาลทันที (1669)'] },
  },
  hrs: { low: 'ต่ำ', normal: 'ปกติ', high: 'สูง' },
  badges: {
    first: { name: 'ชีพจรแรก', desc: 'บันทึกค่าครั้งแรก' }, s3: { name: 'ไฟลุก', desc: 'ต่อเนื่อง 3 วัน' },
    s7: { name: 'นักสู้ประจำสัปดาห์', desc: 'ต่อเนื่อง 7 วัน' }, l10: { name: 'ฮีโร่ข้อมูล', desc: 'บันทึกครบ 10 ครั้ง' },
    g5: { name: 'โซนสีเขียว', desc: 'ค่าปกติ 5 ครั้ง' }, tag: { name: 'เจ้าแห่งแท็ก', desc: 'ใช้แท็ก 3 แบบ' },
    lv3: { name: 'เลเวล 3', desc: 'ถึงเลเวล 3' },
  },
};

const DICT = { en, th };
const LKEY = 'pulsequest-lang';
const Ctx = createContext(null);

function resolve(lang, path) {
  const get = (d) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), d);
  const v = get(DICT[lang]);
  return v !== undefined ? v : get(DICT.en);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { const s = localStorage.getItem(LKEY); if (s === 'th' || s === 'en') return s; } catch (e) {}
    return (navigator.language || 'en').toLowerCase().startsWith('th') ? 'th' : 'en';
  });
  useEffect(() => {
    try { localStorage.setItem(LKEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(() => ({
    lang, setLang,
    locale: lang === 'th' ? 'th-TH' : 'en-US',
    t: (path, vars) => {
      let s = resolve(lang, path);
      if (typeof s !== 'string') return path;
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    },
    ta: (path) => resolve(lang, path) || [],
  }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
