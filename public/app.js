const stylePreviewVersion = "2026-07-05-2863d0a";
const stylePreviewUrl = (filename) => {
  const url = new URL(`./assets/${filename}`, import.meta.url);
  url.searchParams.set("v", stylePreviewVersion);
  return url.href;
};

const styleMeta = {
  "A 写实摄影风": {
    id: "realistic",
    description: "真实运动摄影，高细节，自然光影。",
    cover: stylePreviewUrl("style-realistic.png")
  },
  "B 复古艺术纪实摄影": {
    id: "retro-documentary",
    description: "高调黑白，复古体育纪实，慢门拖影。",
    cover: stylePreviewUrl("style-retro-documentary.png")
  },
  "C 胶片动能抓拍": {
    id: "kinetic-detail",
    description: "粗粝胶片，动能细节特写，荷兰角。",
    cover: stylePreviewUrl("style-kinetic-detail.png")
  },
  "D 高速摇摄": {
    id: "high-speed-panning",
    description: "高速摇摄，主体清晰，背景速度拖影。",
    cover: stylePreviewUrl("style-high-speed-panning.png")
  },
  "E 戏剧性肖像": {
    id: "cinematic-portrait",
    description: "低调棚拍，戏剧明暗，边缘光肖像。",
    cover: stylePreviewUrl("style-cinematic-portrait.png")
  }
};

let styles = [
  {
    label: "A 写实摄影风",
    ...styleMeta["A 写实摄影风"],
    prompt:
      "realistic photography, professional sports photography, high detail, natural lighting, shallow depth of field, bokeh, athletic physique, sweat droplets, dynamic action shot, professional camera quality"
  },
  {
    label: "B 复古艺术纪实摄影",
    ...styleMeta["B 复古艺术纪实摄影"],
    prompt:
      "high-speed motion blur photography, retro sports photography aesthetic, simulated film style, grainy film texture, 1970s sports fashion, classic tournament style, minimalist high-key lighting"
  },
  {
    label: "C 胶片动能抓拍",
    ...styleMeta["C 胶片动能抓拍"],
    prompt:
      "retro analog sports photography aesthetic, 1970s editorial vibe, gritty film texture, intentional macro close-up focus on kinetic details, limbs, footwear, racket, ball, motion blur rather than full-body clarity, high-speed capture aesthetic, raw and unpolished documentary feel"
  },
  {
    label: "D 高速摇摄",
    ...styleMeta["D 高速摇摄"],
    prompt:
      "high-speed motion blur photography, retro sports photography aesthetic, simulated film style, grainy film texture, minimalist high-key lighting, selective focus on face and torso with motion-blurred extremities, dynamic panning photography technique, cinematic sports editorial vibe"
  },
  {
    label: "E 戏剧性肖像",
    ...styleMeta["E 戏剧性肖像"],
    prompt:
      "low-key studio sports photography, dramatic chiaroscuro lighting aesthetic, cinematic athletic portrait style, high-contrast silhouette emphasis, minimalist studio composition, focus on form and shadow play, professional fashion-sports editorial vibe, studio portrait photography technique with controlled rim lighting, tight framing on subject details, low-key exposure control"
  }
];

const dimensions = [
  {
    id: "sport",
    title: "Sport",
    hint: "先选运动项目，姿势会按运动品类切换。",
    type: "single",
    options: [
      { label: "篮球", value: "basketball" },
      { label: "网球", value: "tennis" },
      { label: "匹克球", value: "pickleball" }
    ]
  },
  {
    id: "pose",
    title: "Pose",
    hint: "姿势按运动品类、动作类型和专项术语分类。",
    type: "single",
    dynamic: true
  },
  {
    id: "attribute",
    title: "Attribute",
    hint: "人物属性按一级分类单选组合。",
    type: "grouped-single",
    options: [
      { group: "族裔", label: "亚洲人", value: "Asian" },
      { group: "性别", label: "男", value: "male athlete" },
      { group: "性别", label: "女", value: "female athlete" },
      { group: "性别", label: "中性", value: "androgynous athlete" },
      { group: "性别", label: "多人团队", value: "mixed-gender sports team" },
      { group: "年龄/身份", label: "成人专业运动员", value: "adult professional athlete, trained competitive presence" },
      { group: "年龄/身份", label: "青年运动爱好者", value: "young sports enthusiast, energetic lifestyle mood" },
      { group: "年龄/身份", label: "少年运动人群", value: "teen athlete, youthful sports training feel" },
      { group: "年龄/身份", label: "教练/陪练", value: "coach or training partner, instructive athletic posture" },
      { group: "体型", label: "标准体态", value: "standard athletic body, balanced proportions" },
      { group: "体型", label: "运动健硕", value: "muscular athletic body, visible strength and power" },
      { group: "体型", label: "纤瘦运动", value: "lean endurance athlete, agile and light body shape" },
      { group: "体型", label: "Q版迷你", value: "cute chibi body, small body with large head, simplified limbs" },
      { group: "人数", label: "单人", value: "single athlete as main subject" },
      { group: "人数", label: "双人", value: "two athletes interacting, clear primary action" },
      { group: "人数", label: "多人团队", value: "small team group, coordinated sport action" },
      { group: "服装方向", label: "专业比赛服", value: "professional sports uniform, competition-ready outfit" },
      { group: "服装方向", label: "训练服", value: "training outfit, breathable performance fabric" },
      { group: "服装方向", label: "街头运动服", value: "street sportswear, casual athletic styling" },
      { group: "服装方向", label: "品牌色服装", value: "brand-colored athletic outfit, only when brand constraint is on" },
      { group: "表情/气质", label: "专注", value: "focused eyes, calm competitive expression" },
      { group: "表情/气质", label: "爆发", value: "intense expression, high-energy athletic effort" },
      { group: "表情/气质", label: "轻松", value: "natural relaxed smile, lifestyle sports mood" },
      { group: "表情/气质", label: "胜利", value: "confident winning expression, celebratory energy" }
    ]
  },
  {
    id: "composition",
    title: "Composition",
    hint: "选择裁切、比例、留白与导出方向。",
    type: "grouped-single",
    options: [
      { group: "主体裁切", label: "全身", value: "full body visible, entire silhouette readable, no cropped limbs" },
      { group: "主体裁切", label: "半身", value: "upper body or waist-up crop, sport equipment visible" },
      { group: "主体裁切", label: "头部特写", value: "head-and-shoulders portrait, face and sport identity clear" },
      { group: "主体裁切", label: "局部肢体特写", value: "close-up of hands, legs, shoes, ball, racket or paddle" },
      { group: "画面比例", label: "3:4", value: "vertical 3:4 aspect ratio, sports material format" },
      { group: "画面比例", label: "1:1", value: "square 1:1 aspect ratio, avatar or feed tile" },
      { group: "画面比例", label: "9:16", value: "vertical 9:16 aspect ratio, story or short-video cover" },
      { group: "画面比例", label: "16:9", value: "wide 16:9 aspect ratio, banner or presentation cover" },
      { group: "画面比例", label: "4:3", value: "horizontal 4:3 aspect ratio, editorial layout" },
      { group: "留白方式", label: "无边框满版", value: "edge-to-edge composition, subject fills the frame" },
      { group: "留白方式", label: "上下留白", value: "top and bottom negative space for title text" },
      { group: "留白方式", label: "左右留白", value: "side negative space for copywriting" },
      { group: "留白方式", label: "中心构图留白", value: "centered subject with clean surrounding negative space" },
      { group: "素材导出倾向", label: "抠图素材", value: "clean cutout-friendly edges, simple background, complete outline" },
      { group: "素材导出倾向", label: "海报主视觉", value: "hero composition, dramatic subject scale, space for headline" },
      { group: "素材导出倾向", label: "社媒封面", value: "strong readable pose, face and equipment recognizable at small size" }
    ]
  },
  {
    id: "focus",
    title: "Focus",
    hint: "镜头语言：景别、机位、焦段、对焦和运动镜头。",
    type: "grouped-single",
    options: [
      { group: "景别", label: "远景全身", value: "wide full-body shot, full movement path visible" },
      { group: "景别", label: "中景动作", value: "medium action shot, torso and equipment emphasized" },
      { group: "景别", label: "近景表情", value: "close-up portrait, facial intensity and sweat visible" },
      { group: "景别", label: "特写细节", value: "macro detail shot, hands, ball, racket, shoes or fabric texture" },
      { group: "机位", label: "平视", value: "eye-level camera angle, natural documentary perspective" },
      { group: "机位", label: "低机位", value: "low-angle hero shot, athlete looks powerful and taller" },
      { group: "机位", label: "高机位", value: "high-angle tactical view, court lines and movement path visible" },
      { group: "机位", label: "侧向跟拍", value: "side tracking camera, motion direction clearly shown" },
      { group: "机位", label: "斜前方", value: "three-quarter front angle, face and action both visible" },
      { group: "焦段/透视", label: "广角运动镜头", value: "wide-angle sports lens, dynamic perspective, strong foreground energy" },
      { group: "焦段/透视", label: "标准镜头", value: "standard lens, natural proportions, balanced subject" },
      { group: "焦段/透视", label: "长焦压缩", value: "telephoto compression, background separation, professional sports photography" },
      { group: "焦段/透视", label: "浅景深", value: "shallow depth of field, athlete sharply focused, background softly blurred" },
      { group: "对焦重点", label: "面部锁定", value: "sharp focus on face and eyes" },
      { group: "对焦重点", label: "器械锁定", value: "sharp focus on ball, racket, paddle or basketball" },
      { group: "对焦重点", label: "肢体发力", value: "focus on muscles, hands, footwork and body mechanics" },
      { group: "对焦重点", label: "轨迹锁定", value: "focus on motion path, ball trajectory or swing follow-through" },
      { group: "运动镜头", label: "凝冻结尾", value: "frozen peak action, crisp decisive moment" },
      { group: "运动镜头", label: "跟拍拖影", value: "panning motion blur, sharp athlete with streaking background" },
      { group: "运动镜头", label: "冲击瞬间", value: "impact moment, ball contact or landing emphasized" },
      { group: "运动镜头", label: "赛场纪实", value: "documentary sideline camera, candid competitive realism" }
    ]
  },
  {
    id: "background",
    title: "Background",
    hint: "背景只选一个主方向。",
    type: "single",
    options: [
      { group: "无背景", label: "透明底", value: "transparent background, clean cutout, isolated athlete" },
      { group: "无背景", label: "纯白底", value: "pure white background, product material look" },
      { group: "无背景", label: "浅灰底", value: "light gray studio background, clean edge separation" },
      { group: "极简背景", label: "纯色", value: "solid color studio background, minimal distraction" },
      { group: "极简背景", label: "渐变", value: "soft gradient background, subtle depth" },
      { group: "极简背景", label: "品牌纹理", value: "brand texture background, only when brand constraint is on" },
      { group: "极简背景", label: "几何色块", value: "simple geometric color blocks, clean commercial layout" },
      { group: "实景场景", label: "篮球场", value: "indoor or outdoor basketball court, hoop and court lines visible" },
      { group: "实景场景", label: "网球场", value: "tennis court, baseline, net and court color visible" },
      { group: "实景场景", label: "匹克球场", value: "pickleball court, kitchen line and net visible" },
      { group: "实景场景", label: "跑道", value: "running track, lane lines visible" },
      { group: "实景场景", label: "健身房", value: "training gym, equipment softly in background" },
      { group: "抽象氛围", label: "动态速度线", value: "abstract speed-line environment" },
      { group: "抽象氛围", label: "运动光影", value: "sports light trails, arena lighting mood" },
      { group: "抽象氛围", label: "粒子特效", value: "subtle particle energy around movement" },
      { group: "抽象氛围", label: "暗场聚光", value: "dark arena spotlight, athlete isolated by rim light" }
    ]
  },
  {
    id: "effect",
    title: "Effect",
    hint: "特效建议最多 1-2 个。",
    type: "grouped-single",
    options: [
      { group: "无特效", label: "静态标准人物", value: "static clean athlete, no visual effects" },
      { group: "无特效", label: "干净素材", value: "clean material image, no motion trails" },
      { group: "动作增强", label: "运动拖影", value: "motion trail behind limbs or equipment" },
      { group: "动作增强", label: "速度流线", value: "directional speed lines following movement" },
      { group: "动作增强", label: "光影动态模糊", value: "cinematic motion blur, panning energy" },
      { group: "动作增强", label: "起跳气流", value: "air flow or dust lift around jump" },
      { group: "击球/触球瞬间", label: "击球光波", value: "impact glow at ball contact" },
      { group: "击球/触球瞬间", label: "球体轨迹", value: "visible ball trajectory arc" },
      { group: "击球/触球瞬间", label: "地板冲击", value: "floor impact dust or light burst near shoes" },
      { group: "细节强化", label: "汗水细节", value: "visible sweat droplets, intense athletic effort" },
      { group: "细节强化", label: "服装褶皱动势", value: "fabric folds reacting to motion" },
      { group: "细节强化", label: "肌肉发力", value: "subtle muscle tension highlights" },
      { group: "氛围强化", label: "赛场聚光", value: "dramatic rim light and arena glow" },
      { group: "氛围强化", label: "胜利能量", value: "celebration spark or subtle highlight burst" },
      { group: "氛围强化", label: "复古胶片漏光", value: "film light leak, only when style is vintage documentary" }
    ]
  },
  {
    id: "color",
    title: "Color",
    hint: "选择整体色彩与影调。",
    type: "single",
    options: [
      {
        group: "默认纪实色",
        label: "真实纪实",
        value: "realistic documentary color, natural skin tone, believable court lighting, restrained saturation"
      },
      { group: "高对比运动色", label: "高饱和撞色", value: "vivid saturated colors, strong contrast, energetic sports look" },
      { group: "高对比运动色", label: "黑白强反差", value: "black and white high contrast, dramatic athletic form" },
      { group: "高对比运动色", label: "冷暖对比", value: "cool and warm contrast, powerful visual tension" },
      { group: "纪实低饱和", label: "低饱和纪实", value: "muted tones, documentary color grading" },
      { group: "纪实低饱和", label: "胶片暖色", value: "warm analog color, nostalgic sports documentary feel" },
      { group: "纪实低饱和", label: "阴天自然色", value: "soft overcast natural color, realistic training mood" },
      { group: "商业干净色", label: "纯净白底", value: "clean white background, product material clarity" },
      { group: "商业干净色", label: "浅灰高级", value: "light gray premium studio palette" },
      { group: "商业干净色", label: "品牌色主导", value: "brand color palette with controlled accent color, only when brand constraint is on" },
      { group: "潮流氛围色", label: "霓虹潮流", value: "neon rim light, urban night palette" },
      { group: "潮流氛围色", label: "球场绿色", value: "court green dominant palette" },
      { group: "潮流氛围色", label: "篮球橙蓝", value: "orange basketball accent with blue court contrast" }
    ]
  }
];

const poseOptions = {
  basketball: [
    { group: "通用基础", label: "三威胁姿势", value: "triple-threat stance, knees bent, ball protected near the hip" },
    { group: "通用基础", label: "站姿持球", value: "standing with basketball, one hand supporting the ball, relaxed athletic posture" },
    { group: "通用基础", label: "运球准备", value: "ready to dribble, low center of gravity, eyes scanning the court" },
    { group: "进攻类", label: "持球突破", value: "driving to the basket, shoulder lowered, front foot exploding forward" },
    { group: "进攻类", label: "交叉运球", value: "crossover dribble, ball switching hands close to the floor" },
    { group: "进攻类", label: "跳投", value: "jump shot, shooting elbow aligned, wrist snapping at release" },
    { group: "进攻类", label: "后仰跳投", value: "fadeaway jumper, torso leaning back, defender space implied" },
    { group: "进攻类", label: "上篮", value: "layup, knee lifted, ball extended toward the rim" },
    { group: "进攻类", label: "扣篮", value: "slam dunk, body airborne, arm extended above the basket" },
    { group: "进攻类", label: "传球", value: "chest pass or overhead pass, both hands controlling the basketball" },
    { group: "防守类", label: "低位防守", value: "low defensive stance, arms wide, weight on the balls of the feet" },
    { group: "防守类", label: "横移防守", value: "lateral defensive slide, hips low, one arm contesting" },
    { group: "防守类", label: "封盖", value: "shot block, jumping vertically, hand reaching above the ball" },
    { group: "防守类", label: "抢断", value: "steal attempt, one hand poking the ball, quick forward lean" },
    { group: "移动类", label: "快速变向", value: "sharp change of direction, planted outside foot, torso twist" },
    { group: "移动类", label: "急停", value: "sudden stop, sneakers gripping the floor, body braking forward" },
    { group: "移动类", label: "起跳", value: "explosive jump, calves flexed, toes leaving the court" },
    { group: "移动类", label: "落地缓冲", value: "soft landing, knees absorbing impact, balanced recovery" },
    { group: "庆祝类", label: "握拳庆祝", value: "fist pump celebration, intense winning expression" },
    { group: "庆祝类", label: "指向观众", value: "pointing to crowd, confident game-winning gesture" },
    { group: "特殊规则", label: "罚球", value: "free throw stance, feet behind the line, focused quiet posture" },
    { group: "特殊规则", label: "篮板卡位", value: "boxing out for rebound, back contact implied, arms ready" }
  ],
  tennis: [
    { group: "通用基础", label: "握拍准备", value: "ready position with tennis racket, split step, racket centered" },
    { group: "通用基础", label: "正手准备", value: "forehand preparation, shoulder turn, racket pulled back" },
    { group: "通用基础", label: "反手准备", value: "two-handed backhand preparation, compact coil, eyes on ball" },
    { group: "进攻类", label: "正手击球", value: "forehand groundstroke, full follow-through across the body" },
    { group: "进攻类", label: "双手反手", value: "two-handed backhand, balanced stance, racket face controlled" },
    { group: "进攻类", label: "发球", value: "tennis serve, ball toss overhead, arched back, racket drop" },
    { group: "进攻类", label: "网前截击", value: "net volley, short punch motion, racket face firm, tennis racket with oval string bed" },
    { group: "进攻类", label: "高压扣杀", value: "overhead smash, non-hitting hand tracking the ball, racket high" },
    { group: "防守类", label: "低位救球", value: "low defensive pickup, one knee bent deep, racket under the ball" },
    { group: "防守类", label: "滑步回球", value: "sliding recovery shot, outside foot skidding, torso reaching" },
    { group: "防守类", label: "反手切削", value: "backhand slice, racket face open, low skimming trajectory" },
    { group: "移动类", label: "横向冲刺", value: "lateral sprint across baseline, racket trailing behind" },
    { group: "移动类", label: "急停转身", value: "hard stop and pivot, court shoes gripping, torso rotating" },
    { group: "移动类", label: "跨步接球", value: "wide lunge to reach the ball, extended racket arm" },
    { group: "庆祝类", label: "握拳庆祝", value: "fist pump after winning point, racket in other hand" },
    { group: "庆祝类", label: "举拍致意", value: "raising racket to audience, composed victory gesture" },
    { group: "特殊规则", label: "发球抛球", value: "serve ball toss, eyes up, non-hitting arm extended" },
    { group: "特殊规则", label: "底线对拉", value: "baseline rally stance, weight transferring through shot" },
    { group: "特殊规则", label: "网前小球", value: "drop shot touch, soft racket face, body leaning forward" }
  ],
  pickleball: [
    { group: "通用基础", label: "厨房线准备", value: "ready stance near the kitchen line, knees bent, paddle in front" },
    { group: "通用基础", label: "短柄球拍预备", value: "compact paddle-ready pose, elbows relaxed, quick reaction posture" },
    { group: "进攻类", label: "正手抽击", value: "forehand drive with short solid paddle, compact forward swing" },
    { group: "进攻类", label: "反手抽击", value: "backhand drive, paddle face square, small controlled swing" },
    { group: "进攻类", label: "网前截击", value: "quick volley at the kitchen line, paddle out front" },
    { group: "进攻类", label: "扣杀", value: "pickleball smash, short paddle raised, perforated ball above shoulder" },
    { group: "进攻类", label: "第三拍吊球", value: "third-shot drop, soft upward paddle motion, controlled arc" },
    { group: "防守类", label: "低位挡球", value: "low block, paddle face open, body crouched near the non-volley zone" },
    { group: "防守类", label: "反手防守", value: "backhand defensive block, compact wrist, quick recovery" },
    { group: "防守类", label: "快速回位", value: "recovering to kitchen line, small steps, paddle centered" },
    { group: "移动类", label: "小碎步横移", value: "shuffle step along kitchen line, compact footwork" },
    { group: "移动类", label: "前后移动", value: "quick forward-back movement, paddle ready, balanced torso" },
    { group: "移动类", label: "急停", value: "sudden stop before non-volley zone, controlled body brake" },
    { group: "庆祝类", label: "举拍庆祝", value: "raising pickleball paddle in celebration" },
    { group: "庆祝类", label: "队友击掌", value: "doubles high-five celebration, paddles visible" },
    { group: "特殊规则", label: "dink", value: "soft dink shot over the net, short paddle touch, kitchen line visible" },
    { group: "特殊规则", label: "drop shot", value: "soft drop shot, perforated plastic ball floating low" },
    { group: "特殊规则", label: "kitchen positioning", value: "non-volley zone positioning, feet behind kitchen line" }
  ]
};

const state = {
  style: styles[1],
  activeTab: "sport",
  galleryImages: [],
  galleryFilter: "all",
  settings: {
    provider: "codex",
    custom: {
      endpoint: "",
      apiKey: "",
      model: "gpt-image-1",
      size: "1024x1536",
      apiKeySet: false
    }
  },
  selected: {
    sport: "tennis",
    pose: poseOptions.tennis[3].value,
    attribute: {
      "族裔": "Asian",
      "性别": "androgynous athlete",
      "年龄/身份": "teen athlete, youthful sports training feel",
      "体型": "lean endurance athlete, agile and light body shape",
      "人数": "single athlete as main subject",
      "服装方向": "training outfit, breathable performance fabric",
      "表情/气质": "natural relaxed smile, lifestyle sports mood"
    },
    composition: {
      "主体裁切": "full body visible, entire silhouette readable, no cropped limbs",
      "画面比例": "vertical 3:4 aspect ratio, sports material format",
      "留白方式": "centered subject with clean surrounding negative space",
      "素材导出倾向": "clean cutout-friendly edges, simple background, complete outline"
    },
    focus: {
      "景别": "medium action shot, torso and equipment emphasized",
      "机位": "eye-level camera angle, natural documentary perspective",
      "焦段/透视": "standard lens, natural proportions, balanced subject",
      "对焦重点": "focus on muscles, hands, footwork and body mechanics",
      "运动镜头": "panning motion blur, sharp athlete with streaking background"
    },
    background: "pure white background, product material look",
    effect: {
      "动作增强": "motion trail behind limbs or equipment"
    },
    color: "realistic documentary color, natural skin tone, believable court lighting, restrained saturation"
  }
};

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentPrompt() {
  const sport = state.selected.sport;
  const attributes = selectedValues("attribute").join(", ");
  const composition = selectedValues("composition").join(", ");
  const focus = selectedValues("focus").join(", ");
  const effect = selectedValues("effect").join(", ");
  return [
    state.style.prompt,
    attributes,
    `${sport} athlete`,
    state.selected.pose,
    "accurate sport-specific body mechanics",
    composition,
    focus,
    state.selected.background,
    effect,
    state.selected.color,
    "Avoid cropped limbs, extra fingers, distorted face, wrong racket shape, wrong sports equipment, text, logo, watermark."
  ]
    .filter(Boolean)
    .join(", ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function selectedValues(dimensionId) {
  const value = state.selected[dimensionId];
  if (Array.isArray(value)) return unique(value);
  if (value && typeof value === "object") return unique(Object.values(value));
  return value ? [value] : [];
}

function optionLabel(dimensionId, value) {
  const dimension = dimensions.find((item) => item.id === dimensionId);
  const options = dimensionId === "pose" ? Object.values(poseOptions).flat() : optionsFor(dimension);
  return options.find((option) => option.value === value)?.label || value;
}

function optionLabels(dimensionId) {
  return selectedValues(dimensionId).map((item) => optionLabel(dimensionId, item));
}

function currentSummary() {
  return {
    style: state.style.label,
    sport: optionLabel("sport", state.selected.sport),
    dimensions: {
      pose: optionLabel("pose", state.selected.pose),
      attribute: optionLabels("attribute"),
      composition: optionLabels("composition"),
      focus: optionLabels("focus"),
      background: optionLabel("background", state.selected.background),
      effect: optionLabels("effect"),
      color: optionLabel("color", state.selected.color)
    }
  };
}

function parseStyleDescription(markdown) {
  const blocks = [...markdown.matchAll(/^##\s+([A-E]\s+[^\n]+)\n([\s\S]*?)(?=^##\s+[A-E]\s+|\s*$)/gm)];
  return blocks
    .map((match) => {
      const label = match[1].trim();
      const body = match[2];
      const promptMatch = body.match(/####\s+--style\s*\n+([^\n]+)/);
      const meta = styleMeta[label];
      if (!meta || !promptMatch) return null;
      return {
        label,
        ...meta,
        prompt: promptMatch[1].trim()
      };
    })
    .filter(Boolean);
}

async function loadStyleDescriptions() {
  try {
    const styleSource = new URL("./data/style-description.md", import.meta.url);
    const response = await fetch(styleSource, { cache: "no-store" });
    if (!response.ok) throw new Error("style markdown unavailable");
    const parsedStyles = parseStyleDescription(await response.text());
    if (!parsedStyles.length) throw new Error("style markdown has no styles");
    const activeStyleId = state.style?.id || styles[1]?.id;
    styles = parsedStyles;
    state.style = styles.find((style) => style.id === activeStyleId) || styles[1] || styles[0];
  } catch {
    state.style = styles.find((style) => style.id === state.style?.id) || styles[1] || styles[0];
  }
}

async function loadSettings() {
  try {
    const response = await fetch("/api/settings");
    if (!response.ok) throw new Error("settings api unavailable");
    state.settings = await response.json();
    $("#providerSelect").value = state.settings.provider || "codex";
    $("#apiEndpoint").value = state.settings.custom?.endpoint || "";
    $("#apiModel").value = state.settings.custom?.model || "gpt-image-1";
    $("#apiSize").value = state.settings.custom?.size || "1024x1536";
    $("#settingsStatus").textContent = state.settings.custom?.apiKeySet ? "已保存 API Key。" : "尚未保存 API Key。";
  } catch {
    $("#settingsStatus").textContent = "静态托管模式：API 设置需要部署后端服务。";
  }
}

async function saveSettings() {
  const body = {
    provider: $("#providerSelect").value,
    custom: {
      endpoint: $("#apiEndpoint").value.trim(),
      apiKey: $("#apiKey").value.trim(),
      model: $("#apiModel").value.trim() || "gpt-image-1",
      size: $("#apiSize").value.trim() || "1024x1536"
    }
  };
  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error("settings api unavailable");
    state.settings = await response.json();
    $("#apiKey").value = "";
    $("#settingsStatus").textContent = `已保存：${state.settings.provider === "custom" ? "我的生图 API" : "Codex CLI"}`;
  } catch {
    $("#settingsStatus").textContent = "当前是静态托管页面，不能保存 API 设置。请部署 Node 服务或 EdgeOne Functions。";
  }
}

function renderStyles() {
  $("#styleList").innerHTML = styles
    .map(
      (style) => `
        <button class="style-card ${state.style.id === style.id ? "active" : ""}" data-style="${style.id}" type="button">
          <img src="${style.cover}" alt="${style.label}" />
          <span class="style-card-copy">
            <strong>${style.label}</strong>
            <span>${style.description}</span>
          </span>
        </button>
      `
    )
    .join("");
  document.querySelectorAll("[data-style]").forEach((button) => {
    button.addEventListener("click", () => {
      state.style = styles.find((style) => style.id === button.dataset.style);
      render();
    });
  });
}

function renderTabs() {
  $("#tabs").innerHTML = dimensions
    .map(
      (dimension) => `
        <button class="tab-button ${state.activeTab === dimension.id ? "active" : ""}" data-tab="${dimension.id}" type="button">
          ${dimension.title}
        </button>
      `
    )
    .join("");
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      render();
    });
  });
}

function optionsFor(dimension) {
  if (dimension.id === "pose") return poseOptions[state.selected.sport] || [];
  return dimension.options || [];
}

function isActive(dimension, option) {
  const value = state.selected[dimension.id];
  if (dimension.type === "grouped-single" && value && typeof value === "object") {
    return value[option.group] === option.value;
  }
  return Array.isArray(value) ? value.includes(option.value) : value === option.value;
}

function toggleOption(dimension, option) {
  if (dimension.type === "single") {
    state.selected[dimension.id] = option.value;
    if (dimension.id === "sport") {
      state.selected.pose = poseOptions[option.value][0].value;
    }
    render();
    return;
  }
  if (dimension.type === "grouped-single") {
    state.selected[dimension.id] = {
      ...(state.selected[dimension.id] || {}),
      [option.group || "未分类"]: option.value
    };
    render();
    return;
  }
  const values = new Set(state.selected[dimension.id] || []);
  if (values.has(option.value)) values.delete(option.value);
  else values.add(option.value);
  state.selected[dimension.id] = [...values];
  render();
}

function groupedOptions(options) {
  const groups = new Map();
  options.forEach((option, index) => {
    const name = option.group || "未分类";
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push({ option, index });
  });
  return [...groups].map(([name, items]) => ({ name, items }));
}

function renderOptions() {
  const dimension = dimensions.find((item) => item.id === state.activeTab);
  const options = optionsFor(dimension);
  $("#tabKicker").textContent = "Dimension";
  $("#tabTitle").textContent = dimension.title;
  $("#tabHint").textContent = dimension.hint;
  $("#dimensionOptions").innerHTML = groupedOptions(options)
    .map(
      (group) => `
        <section class="option-group">
          <div class="option-group-title">
            <span>${escapeHtml(group.name)}</span>
            <small>单选</small>
          </div>
          <div class="option-group-grid">
            ${group.items
              .map(
                ({ option, index }) => `
                  <button class="option-card ${isActive(dimension, option) ? "active" : ""}" data-option="${index}" type="button">
                    <strong>${escapeHtml(option.label)}</strong>
                    <span>${escapeHtml(option.value)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleOption(dimension, options[Number(button.dataset.option)]);
    });
  });
}

function renderPrompt() {
  $("#promptPreview").value = currentPrompt();
}

async function copyPrompt() {
  await navigator.clipboard.writeText($("#promptPreview").value);
  $("#statusText").textContent = "Prompt 已复制。";
  setTimeout(() => {
    $("#statusText").textContent = "输出目录：output/images";
  }, 1600);
}

async function loadGallery() {
  try {
    const response = await fetch("/api/images");
    if (!response.ok) throw new Error("gallery api unavailable");
    const data = await response.json();
    state.galleryImages = data.images || [];
    renderGalleryFilters();
    renderGallery();
  } catch {
    state.galleryImages = [];
    renderGalleryFilters();
    $("#gallery").innerHTML = `<div class="empty">静态托管模式下无法读取生成图库。首页的维度选择和 prompt 复制仍可使用。</div>`;
  }
}

function renderGalleryFilters() {
  const stylesInGallery = unique(state.galleryImages.map((image) => image.meta?.style).filter(Boolean));
  $("#galleryFilter").innerHTML = [
    `<option value="all">全部风格</option>`,
    ...stylesInGallery.map((style) => `<option value="${escapeHtml(style)}">${escapeHtml(style)}</option>`)
  ].join("");
  if (state.galleryFilter !== "all" && !stylesInGallery.includes(state.galleryFilter)) {
    state.galleryFilter = "all";
  }
  $("#galleryFilter").value = state.galleryFilter;
}

function renderGallery() {
  const images =
    state.galleryFilter === "all"
      ? state.galleryImages
      : state.galleryImages.filter((image) => image.meta?.style === state.galleryFilter);
  if (!images.length) {
    $("#gallery").innerHTML = `<div class="empty">还没有生成图。回到首页点击「开始生图」后，图片会自动出现在这里。</div>`;
    return;
  }
  $("#gallery").innerHTML = images
    .map((image, index) => {
      const meta = image.meta || {};
      const dimensions = meta.dimensions || {};
      const chips = [
        meta.style || "未记录风格",
        meta.sport || "未记录运动",
        dimensions.pose,
        dimensions.background,
        dimensions.color
      ].filter(Boolean);
      return `
        <figure class="image-tile">
          <img src="${image.url}" alt="${image.name}" loading="lazy" />
          <figcaption class="image-meta">
            <strong>${escapeHtml(image.name)}</strong>
            <div class="chip-row">
              ${chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}
            </div>
            <div class="image-actions">
              <a href="${image.downloadUrl || image.url}" download>下载</a>
              <a href="${image.url}" target="_blank" rel="noreferrer">查看</a>
              <button class="details-button" data-detail="${index}" type="button">维度</button>
            </div>
            <div class="meta-details" data-detail-panel="${index}" hidden>
              <p>属性：${escapeHtml((dimensions.attribute || []).join(" / ") || "未记录")}</p>
              <p>构图：${escapeHtml((dimensions.composition || []).join(" / ") || "未记录")}</p>
              <p>镜头：${escapeHtml((dimensions.focus || []).join(" / ") || "未记录")}</p>
              <p>特效：${escapeHtml((dimensions.effect || []).join(" / ") || "未记录")}</p>
              <p>Provider：${escapeHtml(meta.provider || "unknown")}</p>
            </div>
          </figcaption>
        </figure>
      `;
    })
    .join("");
  document.querySelectorAll(".details-button").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.querySelector(`[data-detail-panel="${button.dataset.detail}"]`);
      panel.hidden = !panel.hidden;
    });
  });
}

function showHome() {
  $("#homeView").hidden = false;
  $("#galleryView").hidden = true;
}

function showGallery() {
  $("#homeView").hidden = true;
  $("#galleryView").hidden = false;
  loadGallery();
}

async function generate() {
  const button = $("#generateButton");
  button.disabled = true;
  $("#statusText").textContent = "已提交生成任务，正在启动 Codex。";
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: currentPrompt(), state, summary: currentSummary() })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "生成失败");
    }
    await pollJob(data.jobId);
  } catch (error) {
    $("#statusText").textContent = `生成失败：${error.message}`;
  } finally {
    button.disabled = false;
  }
}

async function pollJob(jobId) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
    const data = await response.json();
    if (data.status === "done") {
      state.galleryImages = data.gallery || data.images || [];
      renderGalleryFilters();
      renderGallery();
      $("#statusText").textContent = `生成完成：${(data.images || []).length} 张图已加载。`;
      return;
    }
    if (data.status === "error") {
      throw new Error(data.error || "生成失败");
    }
    $("#statusText").textContent = `生成中：${jobId}，已等待 ${Math.round((attempt + 1) * 2)} 秒。`;
  }
  throw new Error("生成仍在运行，请稍后点刷新图库。");
}

function render() {
  renderStyles();
  renderTabs();
  renderOptions();
  renderPrompt();
}

$("#copyPrompt").addEventListener("click", copyPrompt);
$("#generateButton").addEventListener("click", generate);
$("#refreshGallery").addEventListener("click", loadGallery);
$("#galleryRefresh").addEventListener("click", loadGallery);
$("#openGallery").addEventListener("click", showGallery);
$("#backHome").addEventListener("click", showHome);
$("#homeTitle").addEventListener("click", showHome);
$("#openApiSettings").addEventListener("click", () => $("#apiDialog").showModal());
$("#saveSettings").addEventListener("click", saveSettings);
$("#galleryFilter").addEventListener("change", () => {
  state.galleryFilter = $("#galleryFilter").value;
  renderGallery();
});

async function init() {
  await loadStyleDescriptions();
  render();
  loadSettings();
  loadGallery();
}

init();
