// 2026年草加市議会議員一般選挙 新旧比較・データ分析用データセット
// ※政治的中立性と完全な客観性を担保したファクトベースの集計データ

export interface ElectedCouncilor {
  rank: number;
  name: string;
  kana: string;
  gender: '男' | '女';
  age: number;
  party: string;             // 立候補時の政党（公認・推薦等）
  status: '現職再選' | '新人当選';
  prevFaction: string;       // 改選前の所属会派（新人は「改選前議席なし」）
  termCount: number;         // 今回当選を含む通算期数
  votes: string;
  voteShare: string;
  hasFraction: boolean;
  fractionNote?: string;
}

export interface FactionStats {
  name: string;
  prevCount: number;         // 改選前の所属議員数
  reElectedCount: number;    // 現職再選数
  fallenCount: number;       // 現職落選数
  retiredCount: number;      // 勇退・不出馬数
  reElectedMembers: string[];
  fallenMembers: string[];
  retiredMembers: string[];
}

export interface PartyStats {
  party: string;
  candidatesCount: number;   // 立候補者数
  electedCount: number;      // 当選者数
  electedRatio: string;      // 当選率
  breakdown: string;         // 内訳（現職○ / 新人○）
}

// 当選者28名の全プロファイル
export const ELECTED_COUNCILORS: ElectedCouncilor[] = [
  {
    rank: 1,
    name: "かわぐち みほ",
    kana: "かわぐち みほ",
    gender: "女",
    age: 31,
    party: "日本保守党（代表者：石濱哲信）",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "5,469",
    voteShare: "6.3%",
    hasFraction: false
  },
  {
    rank: 2,
    name: "中村 りか",
    kana: "なかむら りか",
    gender: "女",
    age: 39,
    party: "無所属",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "4,905",
    voteShare: "5.6%",
    hasFraction: false
  },
  {
    rank: 3,
    name: "白石 たかお",
    kana: "しらいし たかお",
    gender: "男",
    age: 70,
    party: "自由民主党",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 4,
    votes: "4,433",
    voteShare: "5.1%",
    hasFraction: false
  },
  {
    rank: 4,
    name: "吉沢 哲夫",
    kana: "よしざわ てつお",
    gender: "男",
    age: 88,
    party: "無所属",
    status: "現職再選",
    prevFaction: "無所属（会派所属なし）",
    termCount: 14,
    votes: "4,171",
    voteShare: "4.8%",
    hasFraction: false
  },
  {
    rank: 5,
    name: "きくち けいた",
    kana: "きくち けいた",
    gender: "男",
    age: 42,
    party: "立憲民主党",
    status: "現職再選",
    prevFaction: "立憲民主党草加市議会議員団",
    termCount: 3,
    votes: "3,628",
    voteShare: "4.2%",
    hasFraction: false
  },
  {
    rank: 6,
    name: "関 一幸",
    kana: "せき かずゆき",
    gender: "男",
    age: 63,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 6,
    votes: "3,596",
    voteShare: "4.1%",
    hasFraction: false
  },
  {
    rank: 7,
    name: "ひらやま きょうか",
    kana: "ひらやま きょうか",
    gender: "女",
    age: 30,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 2,
    votes: "3,391",
    voteShare: "3.9%",
    hasFraction: false
  },
  {
    rank: 8,
    name: "佐藤 のりかず",
    kana: "さとう のりかず",
    gender: "男",
    age: 41,
    party: "無所属",
    status: "現職再選",
    prevFaction: "市民共同議員団",
    termCount: 5,
    votes: "3,354.821",
    voteShare: "3.9%",
    hasFraction: true,
    fractionNote: "※按分票（同姓・同名等の候補者への按分計算）により端数発生"
  },
  {
    rank: 9,
    name: "さとう りき",
    kana: "さとう りき",
    gender: "男",
    age: 58,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 4,
    votes: "3,025.740",
    voteShare: "3.5%",
    hasFraction: true,
    fractionNote: "※按分票（同姓・同名等の候補者への按分計算）により端数発生"
  },
  {
    rank: 10,
    name: "矢部 しょうへい",
    kana: "やべ しょうへい",
    gender: "男",
    age: 41,
    party: "無所属",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 3,
    votes: "2,777",
    voteShare: "3.2%",
    hasFraction: false
  },
  {
    rank: 11,
    name: "平野 あつ子",
    kana: "ひらの あつこ",
    gender: "女",
    age: 66,
    party: "日本共産党",
    status: "現職再選",
    prevFaction: "無所属（会派所属なし）",
    termCount: 7,
    votes: "2,593",
    voteShare: "3.0%",
    hasFraction: false
  },
  {
    rank: 12,
    name: "川崎 ひさのり",
    kana: "かわさき ひさのり",
    gender: "男",
    age: 55,
    party: "日本維新の会",
    status: "現職再選",
    prevFaction: "無所属（会派所属なし）",
    termCount: 2,
    votes: "2,412",
    voteShare: "2.8%",
    hasFraction: false
  },
  {
    rank: 13,
    name: "金井 としはる",
    kana: "かない としはる",
    gender: "男",
    age: 63,
    party: "公明党",
    status: "現職再選",
    prevFaction: "公明党草加市議会議員団",
    termCount: 4,
    votes: "2,410",
    voteShare: "2.8%",
    hasFraction: false
  },
  {
    rank: 14,
    name: "鈴木 よしかず",
    kana: "すずき よしかず",
    gender: "男",
    age: 57,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 7,
    votes: "2,369",
    voteShare: "2.7%",
    hasFraction: false
  },
  {
    rank: 15,
    name: "松井 ゆみ子",
    kana: "まつい ゆみこ",
    gender: "女",
    age: 76,
    party: "無所属",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 8,
    votes: "2,340",
    voteShare: "2.7%",
    hasFraction: false
  },
  {
    rank: 16,
    name: "おおこし ひろこ",
    kana: "おおこし ひろこ",
    gender: "女",
    age: 54,
    party: "公明党",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "2,262",
    voteShare: "2.6%",
    hasFraction: false
  },
  {
    rank: 17,
    name: "木村 ただよし",
    kana: "きむら ただよし",
    gender: "男",
    age: 61,
    party: "自由民主党",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 2,
    votes: "2,231",
    voteShare: "2.6%",
    hasFraction: false
  },
  {
    rank: 18,
    name: "浅古 きょういち",
    kana: "あさこ きょういち",
    gender: "男",
    age: 46,
    party: "無所属",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "2,178",
    voteShare: "2.5%",
    hasFraction: false
  },
  {
    rank: 19,
    name: "石川 ゆういち",
    kana: "いしかわ ゆういち",
    gender: "男",
    age: 62,
    party: "公明党",
    status: "現職再選",
    prevFaction: "公明党草加市議会議員団",
    termCount: 3,
    votes: "2,175",
    voteShare: "2.5%",
    hasFraction: false
  },
  {
    rank: 20,
    name: "豊田 たかし",
    kana: "とよだ たかし",
    gender: "男",
    age: 60,
    party: "国民民主党",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "2,162.793",
    voteShare: "2.5%",
    hasFraction: true,
    fractionNote: "※按分票（同姓・同名等の候補者への按分計算）により端数発生"
  },
  {
    rank: 21,
    name: "藤原 みどり",
    kana: "フジワラ ミドリ",
    gender: "女",
    age: 63,
    party: "公明党",
    status: "現職再選",
    prevFaction: "公明党草加市議会議員団",
    termCount: 2,
    votes: "2,143",
    voteShare: "2.5%",
    hasFraction: false
  },
  {
    rank: 22,
    name: "森 さとる",
    kana: "もり さとる",
    gender: "男",
    age: 63,
    party: "公明党",
    status: "現職再選",
    prevFaction: "公明党草加市議会議員団",
    termCount: 2,
    votes: "1,953",
    voteShare: "2.2%",
    hasFraction: false
  },
  {
    rank: 23,
    name: "しばの 勝利",
    kana: "しばの かつとし",
    gender: "男",
    age: 59,
    party: "無所属",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 7,
    votes: "1,900",
    voteShare: "2.2%",
    hasFraction: false
  },
  {
    rank: 24,
    name: "並木 まさなり",
    kana: "なみき まさなり",
    gender: "男",
    age: 69,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 2,
    votes: "1,881",
    voteShare: "2.2%",
    hasFraction: false
  },
  {
    rank: 25,
    name: "岸 だいすけ",
    kana: "きし だいすけ",
    gender: "男",
    age: 41,
    party: "国民民主党",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "1,854",
    voteShare: "2.1%",
    hasFraction: false
  },
  {
    rank: 26,
    name: "田川 こうじ",
    kana: "たがわ こうじ",
    gender: "男",
    age: 62,
    party: "無所属",
    status: "現職再選",
    prevFaction: "SOKA新政議員団",
    termCount: 2,
    votes: "1,843",
    voteShare: "2.1%",
    hasFraction: false
  },
  {
    rank: 27,
    name: "佐藤 けいじ",
    kana: "さとう けいじ",
    gender: "男",
    age: 71,
    party: "日本共産党",
    status: "新人当選",
    prevFaction: "改選前議席なし（新人）",
    termCount: 1,
    votes: "1,791.438",
    voteShare: "2.1%",
    hasFraction: true,
    fractionNote: "※按分票（同姓・同名等の候補者への按分計算）により端数発生"
  },
  {
    rank: 28,
    name: "田中 のりみつ",
    kana: "たなか のりみつ",
    gender: "男",
    age: 50,
    party: "無所属",
    status: "現職再選",
    prevFaction: "草加自民党・無所属の会",
    termCount: 4,
    votes: "1,754",
    voteShare: "2.0%",
    hasFraction: false
  }
];

// 改選前所属会派別の当落状況
export const FACTION_STATS: FactionStats[] = [
  {
    name: "草加自民党・無所属の会",
    prevCount: 7,
    reElectedCount: 6,
    fallenCount: 1,
    retiredCount: 0,
    reElectedMembers: ["白石 たかお", "矢部 しょうへい", "松井 ゆみ子", "木村 ただよし", "しばの 勝利", "田中 のりみつ"],
    fallenMembers: ["小川 利八（小川 としや）"],
    retiredMembers: []
  },
  {
    name: "SOKA新政議員団",
    prevCount: 7,
    reElectedCount: 6,
    fallenCount: 0,
    retiredCount: 1,
    reElectedMembers: ["関 一幸", "ひらやま きょうか", "さとう りき", "鈴木 よしかず", "並木 まさなり", "田川 こうじ"],
    fallenMembers: [],
    retiredMembers: ["吉岡 健"]
  },
  {
    name: "公明党草加市議会議員団",
    prevCount: 6,
    reElectedCount: 4,
    fallenCount: 0,
    retiredCount: 2,
    reElectedMembers: ["金井 としはる", "石川 ゆういち", "藤原 みどり", "森 さとる"],
    fallenMembers: [],
    retiredMembers: ["堀込 彰二", "広田 丈夫"]
  },
  {
    name: "無所属（会派所属なし）",
    prevCount: 3,
    reElectedCount: 3,
    fallenCount: 0,
    retiredCount: 0,
    reElectedMembers: ["吉沢 哲夫", "川崎 ひさのり", "平野 あつ子"],
    fallenMembers: [],
    retiredMembers: []
  },
  {
    name: "立憲民主党草加市議会議員団",
    prevCount: 2,
    reElectedCount: 1,
    fallenCount: 0,
    retiredCount: 1,
    reElectedMembers: ["きくち けいた"],
    fallenMembers: [],
    retiredMembers: ["中島 綾菜"]
  },
  {
    name: "市民共同議員団",
    prevCount: 2,
    reElectedCount: 1,
    fallenCount: 1,
    retiredCount: 0,
    reElectedMembers: ["佐藤 のりかず"],
    fallenMembers: ["斉藤 雄二（斉藤 ゆうじ）"],
    retiredMembers: []
  }
];

// 立候補時の政党（党派）別獲得議席
export const PARTY_STATS: PartyStats[] = [
  { party: "公明党", candidatesCount: 5, electedCount: 5, electedRatio: "100%", breakdown: "現職4 / 新人1" },
  { party: "自由民主党", candidatesCount: 2, electedCount: 2, electedRatio: "100%", breakdown: "現職2" },
  { party: "日本共産党", candidatesCount: 3, electedCount: 2, electedRatio: "66.7%", breakdown: "現職1 / 新人1" },
  { party: "国民民主党", candidatesCount: 2, electedCount: 2, electedRatio: "100%", breakdown: "新人2" },
  { party: "立憲民主党", candidatesCount: 1, electedCount: 1, electedRatio: "100%", breakdown: "現職1" },
  { party: "日本維新の会", candidatesCount: 1, electedCount: 1, electedRatio: "100%", breakdown: "現職1" },
  { party: "日本保守党", candidatesCount: 1, electedCount: 1, electedRatio: "100%", breakdown: "新人1" },
  { party: "無所属", candidatesCount: 22, electedCount: 14, electedRatio: "63.6%", breakdown: "現職12 / 新人2" }
];

// 男女比データ（CUD配慮）
export const GENDER_COMPARISON = {
  previous: {
    total: 27,
    female: 5,
    male: 22,
    femaleRatio: "18.5%",
    maleRatio: "81.5%"
  },
  current: {
    total: 28,
    female: 7,
    male: 21,
    femaleRatio: "25.0%",
    maleRatio: "75.0%"
  },
  diff: {
    femaleDiffCount: "+2名",
    femaleDiffRatio: "+6.5pt"
  }
};

// 年代別分布データ
export const AGE_DISTRIBUTION = [
  { group: "20〜30代", count: 3, ratio: "10.7%", note: "3名全員が女性当選者（ひらやま 30歳、かわぐち 31歳、中村 39歳）" },
  { group: "40代", count: 5, ratio: "17.9%", note: "岸 41歳、矢部 41歳、佐藤のりかず 41歳、きくち 42歳、浅古 46歳" },
  { group: "50代", count: 6, ratio: "21.4%", note: "田中のりみつ 50歳、おおこし 54歳、川崎 55歳、鈴木 57歳、さとうりき 58歳、しばの 59歳" },
  { group: "60代", count: 10, ratio: "35.7%", note: "豊田 60歳、木村 61歳、石川 62歳、田川 62歳、金井 63歳、森 63歳、関 63歳、藤原 63歳、平野 66歳、並木 69歳" },
  { group: "70代以上", count: 4, ratio: "14.3%", note: "白石 70歳、佐藤けいじ 71歳、松井 76歳、吉沢 88歳" }
];

// 基本統計指標
export const BASIC_ANALYTICS_METRICS = {
  averageAge: "56.5歳",
  youngest: { age: 30, name: "ひらやま きょうか", status: "現職" },
  newYoungest: { age: 31, name: "かわぐち みほ", status: "新人" },
  oldest: { age: 88, name: "吉沢 哲夫", term: "14期目" },
  femaleTopRankers: "得票数 1位（かわぐち みほ）および 2位（中村 りか）",
  reElectedCount: 21,
  newElectedCount: 7,
  fallenIncumbentsCount: 2,
  retiredIncumbentsCount: 4
};
