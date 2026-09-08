export type PlaceId = 'home' | 'research' | 'papers' | 'journey' | 'play' | 'contact';
export const places: {id: PlaceId; name: string; zh: string; subtitle: string; x: number; z: number; radius: number; color: string}[] = [
  {id:'home',name:'Moonrise Cove',zh:'月出海湾',subtitle:'Meet Yixu',x:0,z:0,radius:13,color:'#dfbfb0'},
  {id:'research',name:'Curiosity Station',zh:'好奇心研究站',subtitle:'Research & collaborators',x:-48,z:-39,radius:15,color:'#a9d788'},
  {id:'papers',name:'The Idea Archive',zh:'灵感档案馆',subtitle:'Papers & discoveries',x:43,z:-52,radius:14,color:'#bcb1de'},
  {id:'journey',name:'Memory Lighthouse',zh:'记忆灯塔',subtitle:'Education & milestones',x:66,z:29,radius:13,color:'#f5cf8b'},
  {id:'play',name:'Wonder Reef',zh:'奇想珊瑚礁',subtitle:'Games & life beyond research',x:8,z:69,radius:12,color:'#efadbc'},
  {id:'contact',name:'Postcard Island',zh:'明信片小岛',subtitle:'Say hello',x:-63,z:42,radius:12,color:'#91d4c7'},
];
export const papers = [
 {title:'GUI Agents for Continual Game Generation',authors:'Yixu Huang*, Bo Li*, Na Li*, Zhe Wang, et al.',venue:'EMNLP 2026 Findings',badge:'Poster',image:'play2code-overview.png',summary:'Can playing a game help an agent build a better one? PlaytestArena brings together 200 game-generation tasks across eight genres. Play2Code connects coding and playtesting through shared memory and continual feedback.',links:[['Paper','https://arxiv.org/abs/2605.28258'],['Project','https://continual-game-generation.vercel.app/']]},
 {title:'Learning Adaptive Reasoning Paths for Efficient Visual Reasoning',authors:'Yixu Huang, Tinghui Zhu, Muhao Chen',venue:'arXiv 2026',badge:'Preprint',image:'avr-figure1.png',summary:'AVR separates visual perception, logical reasoning, and answer application. FS-GRPO teaches models to choose efficient reasoning formats while preserving correctness, reducing token usage by 50–90% across VQA benchmarks.',links:[['Paper','https://arxiv.org/abs/2604.14568'],['Code','https://github.com/RunRiotComeOn/AVR']]},
 {title:'ACE: Self-Evolving LLM Coding Framework via Adversarial Unit Test Generation and Preference Optimization',authors:'Yixu Huang, Xinglei Yu, Zhongyu Wei',venue:'ICLR 2026 Workshop RSI',badge:'Spotlight',image:'ace-pipeline.png',summary:'When verifiers stop challenging a growing solver, feedback saturates. ACE uses an adversary to generate execution-based challenges, improving coding accuracy, generalization, and inference efficiency.',links:[['Paper','https://arxiv.org/abs/2605.16299'],['GitHub','https://github.com/RunRiotComeOn']]},
];
export const labs = [
 {name:'University of Illinois Urbana-Champaign',short:'UIUC',lab:'TRAIS Lab',year:'2026',logo:'uiuc-logo.svg',people:[['Prof. Jiaqi W. Ma','https://jiaqima.github.io/']],detail:'Continual learning for agentic systems: reasoning, memory, and decision-making that adapt over time.'},
 {name:'University of California, Davis',short:'UC Davis',lab:'LUKA Lab',year:'2026',logo:'uc-davis-logo.svg',people:[['Prof. Muhao Chen','https://muhaochen.github.io/'],['Tinghui Zhu','https://darthzhu.github.io/']],detail:'Advised by Prof. Muhao Chen, working closely with Tinghui Zhu.'},
 {name:'Fudan University',short:'Fudan',lab:'DISC Lab',year:'2025',logo:'fudan-logo.svg',people:[['Prof. Zhongyu Wei','http://www.fudan-disc.com/people/zywei']],detail:'Research at DISC Lab, advised by Prof. Zhongyu Wei.'},
];
export const awards = [
 ['2024','First-class Scholarship','Fudan University · Top 5%'],
 ['2025','Second Prize','China Undergraduate Mathematical Contest in Modeling'],
 ['2024','Outstanding Student Award','Fudan University · Top 5%'],
 ['2025',"Dean’s Honor List",'College of Engineering, UC Davis · Top 8%'],
];
export const socials = [
 ['Email','mailto:yixuhuang23@m.fudan.edu.cn'],
 ['Google Scholar','https://scholar.google.com/citations?user=ZBJHQB0AAAAJ&hl=en&oi=sra'],
 ['GitHub','https://github.com/RunRiotComeOn'],
 ['Itch.io','https://yxsophie.itch.io'],
 ['X','https://x.com/YixuHuang342'],
];
export const racePoints = [
 [-21,23],[-35,8],[-35,-14],[-15,-29],[12,-32],[33,-20],[42,2],[32,25],[10,35],[-10,31],
];
export const pearlPoints = [
 [-17,12],[-26,-6],[-28,-34],[-61,-14],[-16,-61],[18,-56],[49,-28],[66,-3],[87,39],[43,55],[19,49],[-12,73],[-30,55],[-58,22],[-80,52],[-78,-48],[66,-76],[6,97],
];
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
