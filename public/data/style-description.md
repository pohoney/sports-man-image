# 风格参考配置

每次生成先让用户选择风格。风格参考只负责 `--style`，不要从本文件提取姿势、人物属性、背景、特效、色彩、焦点、视角、景深或构图默认值；这些参数必须从 `Asset/dimensions/` 确认。

下方「场景化示例」只用于说明风格如何和 dimensions 组合，不作为默认值。实际生图时，如果用户没有特别说明，以用户定义的 dimensions 为准，仅加载对应风格下的 `--style` prompt。

## A 写实摄影风

### 视觉特征

- 高细节、高清晰度、专业运动摄影质感
- 真实光影、自然肤色、肌肉线条清晰可见
- 景深效果突出主体，背景适度虚化

### 色彩特点

- 主色调：自然肤色 + 运动服品牌色
- 饱和度：中高饱和度，色彩鲜明但不刺眼
- 对比度：中高对比度，明暗层次丰富

### 质感描述

- 画面质感：专业单反相机拍摄质感，RAW 后期处理风格
- 纹理特征：皮肤毛孔、汗水、服装纤维细节清晰可见
- 光影风格：自然光或专业体育场馆灯光，侧光或逆光勾勒轮廓

### 适用场景

- 最适合的运动项目：所有运动项目
- 最适合的设计用途：海报、宣传册、社交媒体、品牌官网

### Prompt 关键词

#### --style
realistic photography, professional sports photography, high detail, natural lighting, shallow depth of field, bokeh, athletic physique, sweat droplets, dynamic action shot, professional camera quality

### 参考图清单

- `reference-images/ref_01.png` - 篮球运动员跳投
- `reference-images/ref_02.png` - 网球运动员挥拍
- `reference-images/ref_03.png` - 匹克球运动员接球

---

## B 复古艺术纪实摄影

### 视觉特征

- 高速运动模糊摄影，模拟胶片慢门效果
- 复古体育摄影美学，1970 年代温网经典风格
- 极简高调光线，过曝纯白背景
- 决定性瞬间捕捉，动感对角线构图
- 面部柔焦与肢体极致动态模糊形成虚实对比

### 色彩特点

- 主色调：高对比黑白（black and white）
- 饱和度：去色处理，仅保留灰阶层次
- 对比度：极高对比度，纯白背景衬托深色主体

### 质感描述

- 画面质感：模拟胶片颗粒质感，复古体育杂志印刷风格
- 纹理特征：胶片颗粒感明显，运动拖影柔和过渡
- 光影风格：高调过曝背景 + 侧逆光勾勒人物轮廓

### 适用场景

- 最适合的运动项目：网球、田径、游泳等强调速度感的运动
- 最适合的设计用途：体育杂志封面、复古品牌宣传、艺术展览海报

### Prompt 关键词

#### --style
high-speed motion blur photography, retro sports photography aesthetic, simulated film style, grainy film texture, 1970s sports fashion, classic tournament style, minimalist high-key lighting

### 场景化示例（网球专项，仅供参考）

#### --pose
powerful forehand swing, dynamic moment capture, decisive moment photography, dynamic diagonal composition, athletic motion frozen in time

#### --attributes
male tennis player, all-white tennis outfit, headband and wristbands, athletic energy and determination, focused competitive expression

#### --focus
isolated subject on pure white background, high-key studio setting, subject-only cutout style with extreme motion blur

#### --background
overexposed pure white background, infinite white backdrop, clean studio void, no environmental distraction

#### --effect
extreme motion blur on racket and limbs, clear motion trajectory trails, soft focus on face, speed and power visualization, ghosting effect on moving parts, sharp-to-blur transition

#### --color
high contrast black and white, monochrome grayscale, pure white background with dark subject silhouette

---

## C 胶片动能抓拍

### 视觉特征

- 复古模拟胶片体育摄影美学，1970 年代编辑风格
- 粗粝胶片质感，故意失焦的动能细节特写
- 荷兰角（倾斜透视）构图，广角镜头畸变
- 聚焦肢体、鞋履、球拍、球等功能细节，而非全身清晰度
- 原始、未修饰的纪实感

### 色彩特点

- 主色调：复古柯达 Portra 色彩分级
- 饱和度：高对比青橙交织，饱和的球场绿和深邃天空蓝
- 对比度：褪色阴影黑，温暖阳光高光，怀旧模拟色调范围

### 质感描述

- 画面质感：粗粝胶片纹理，重模拟胶片颗粒，微妙漏光
- 纹理特征：极端线性和径向运动模糊，变焦爆发条纹，肢体和球拍上的重影运动轨迹
- 光影风格：harsh directional sunlight with deep cast shadows，强烈方向性阳光与深投射阴影

### 适用场景

- 最适合的运动项目：网球、田径、游泳等强调速度感和细节的运动
- 最适合的设计用途：体育杂志封面、复古品牌宣传、艺术展览海报、运动纪录片

### Prompt 关键词

#### --style
retro analog sports photography aesthetic, 1970s editorial vibe, gritty film texture, intentional macro close-up focus on kinetic details, limbs, footwear, racket, ball, motion blur rather than full-body clarity, high-speed capture aesthetic, raw and unpolished documentary feel

### 场景化示例（网球专项，仅供参考）

#### --pose
mid-action athletic explosion, powerful swing or rapid footwork, body twisted in kinetic exertion, dynamic weight transfer, limbs extended in high-velocity motion

#### --attributes
young athletic figure, vintage 70s or 80s tennis apparel, crisp white polo and shorts, retro leather sneakers with high socks, sweat-glistened skin, intense competitive focus

#### --focus
extreme close-up and fragmented framing, Dutch angle tilted perspective, wide-angle lens distortion, shallow depth of field isolating motion points, low-angle or high-angle dynamic shots

#### --background
abstracted court geometry, stretched white boundary lines, blurred stadium or solid color-block backdrop, deep blue sky, green hard court, minimal environmental noise to emphasize subject motion

#### --effect
extreme linear and radial motion blur, zoom burst streaks, ghosting motion trails on limbs and racket, heavy analog film grain, subtle light leaks, harsh directional sunlight with deep cast shadows

#### --color
vintage Kodak Portra color grading, high-contrast teal and orange interplay, saturated court greens and deep sky blues, faded shadow blacks, warm sunlight highlights, nostalgic analog tonal range

---

## D 高速摇摄

### 视觉特征

- 高速运动模糊摄影，复古体育摄影美学
- 模拟胶片风格，颗粒感胶片纹理
- 选择性对焦：面部和躯干清晰，四肢运动模糊
- 动态摇摄摄影技术，电影感体育编辑风格
- 主体孤立，背景抽象化

### 色彩特点

- 主色调：蓝色球场表面，白色边界线
- 饱和度：自然肤色带阳光温暖感，干净白色服装
- 对比度：清晰色彩分离，主体与背景强烈对比

### 质感描述

- 画面质感：模拟胶片颗粒质感，复古体育杂志印刷风格
- 纹理特征：球拍和四肢极端运动模糊，清晰运动轨迹条纹，面部柔焦
- 光影风格：高调工作室般光线在球场上，主体中心对焦，周围极端运动模糊

### 适用场景

- 最适合的运动项目：网球、田径、赛车等强调速度感的运动
- 最适合的设计用途：体育杂志封面、运动品牌广告、速度感宣传海报

### Prompt 关键词

#### --style
high-speed motion blur photography, retro sports photography aesthetic, simulated film style, grainy film texture, minimalist high-key lighting, selective focus on face and torso with motion-blurred extremities, dynamic panning photography technique, cinematic sports editorial vibe

### 场景化示例（网球专项，仅供参考）

#### --pose
powerful forehand swing or rapid sprint lunge, dynamic moment capture, decisive moment photography, dynamic diagonal composition, athletic motion frozen in time, weight shifted forward in aggressive stance

#### --attributes
professional tennis athlete, all-white classic tennis outfit, visor or cap, wristbands and sweatbands, athletic energy and determination, focused competitive expression, sun-kissed skin

#### --focus
isolated subject with abstracted background, high-key studio-like lighting on court, subject-centric focus with extreme motion blur on surroundings, shallow depth of field blending into speed streaks

#### --background
abstracted tennis court surface, stretched boundary lines, minimalist void background, clean environmental gradient, no distracting crowd or stadium details

#### --effect
extreme motion blur on racket and limbs, clear motion trajectory trails, soft focus on face, speed and power visualization, ghosting effect on moving parts, sharp-to-blur transition, horizontal speed lines, light streaks from racket movement

#### --color
blue tennis court surface, white boundary lines, natural skin tones with sun-kissed warmth, clean white apparel, crisp color separation

### 参考图清单

- `high-speed-panning-photography-preview.png` - 高速摇摄风格预览

---

## E 戏剧性肖像

### 视觉特征

- 低调工作室体育摄影，戏剧性明暗对比美学
- 电影感运动员肖像风格，高对比剪影强调
- 极简工作室构图，聚焦形态和光影游戏
- 专业时尚体育编辑风格，受控边缘光
- 紧密构图聚焦主体细节

### 色彩特点

- 主色调：低调单色调色板，深黑和灰
- 饱和度：高对比黑白，设备上的选择性色彩强调
- 对比度：情绪化暗调与清晰高光，电影感色彩分级

### 质感描述

- 画面质感：工作室肖像摄影技术，精确细节捕捉
- 纹理特征：戏剧性边缘光和背光光辉，深阴影雕刻，高对比色调范围
- 光影风格：剪影定义，情绪化氛围张力，清晰边缘光，静态肖像捕捉（无运动模糊）

### 适用场景

- 最适合的运动项目：所有运动项目（适合展现运动员个人形象）
- 最适合的设计用途：运动员个人海报、品牌代言宣传、体育杂志人物专访、纪录片海报

### Prompt 关键词

#### --style
low-key studio sports photography, dramatic chiaroscuro lighting aesthetic, cinematic athletic portrait style, high-contrast silhouette emphasis, minimalist studio composition, focus on form and shadow play, professional fashion-sports editorial vibe, studio portrait photography technique with controlled rim lighting, tight framing on subject details, low-key exposure control

### 场景化示例（网球专项，仅供参考）

#### --pose
static athletic stance, holding tennis racket in ready or resting position, profile or three-quarter view, confident and poised posture, subtle tension in arms and grip, focused gaze over shoulder

#### --attributes
male or female tennis athlete, dark performance athletic wear, baseball cap or visor or headband, holding professional tennis racket, sometimes holding tennis ball or wearing sweat towel, intense and determined facial expression, sculpted athletic physique

#### --focus
sharp focus on subject face and racket strings, studio portrait depth of field, clear separation between lit edges and shadowed areas, precise detail capture on equipment and facial features

#### --background
plain studio backdrop, smooth gradient gray to dark tones, minimalist seamless background, zero environmental distractions, high-contrast negative space

#### --effect
dramatic rim and backlight glow, deep shadow carving, high-contrast tonal range, silhouette definition, moody atmospheric tension, crisp edge lighting, static portrait capture, no motion blur

#### --color
low-key monochrome palette, deep blacks and grays, selective color accents on equipment, high-contrast black and white, moody dark tones with crisp highlights, cinematic color grading

### 参考图清单

- `cinematic-sports-portrait-preview.png` - 戏剧性肖像风格预览
