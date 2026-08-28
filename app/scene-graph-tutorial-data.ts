import type { DetailedLectureTutorial, DetailedSlideBeat } from "./detailed-tutorial-data";

const book = (chapter: string, section: string, href: string, bridge: string) => ({ chapter, section, href, bridge });
const b = (page: number, title: string, change: string, explanation: string | string[], inspect: string[], extra: Partial<Omit<DetailedSlideBeat, "page" | "title" | "change" | "explanation" | "inspect">> = {}): DetailedSlideBeat => ({ page, title, change, explanation: Array.isArray(explanation) ? explanation : [explanation], inspect, ...extra });

export const sceneGraphs: DetailedLectureTutorial = {
  pdf: "17scene-graph.pdf",
  pageCount: 23,
  estimatedTime: "约 2.5-3 小时（含矩阵与重挂接练习）",
  question: "怎样让场景的数据结构直接表达‘属于谁、跟着谁移动、哪些几何被共享’，而不是维护一长串互不相关的世界矩阵？",
  opening: [
    "场景图不是“把对象放进一棵树”这么简单。它把建模意图变成结构：父子关系表示共同运动，根到叶路径表示坐标变换链，多条路径指向同一节点表示实例共享。结构选对后，一次编辑自然传播；结构选错时，程序只能同步修改大量矩阵。",
    "本讲用一栋房子的门和六扇窗反复对照平铺列表、分组树和带实例的 DAG。阅读每张图时同时追踪两件事：左侧图结构中哪个节点被高亮，右侧房屋中哪些像素随之改变。",
  ],
  outcomes: [
    "从场景语义设计 group/object 层级，而不是从绘制顺序机械建树",
    "按列向量约定计算 M_world(child)=M_world(parent)M_local(child)",
    "区分资源、节点、实例路径与一次场景出现，并解释树为何扩展为 DAG",
    "实现携带累计变换的深度优先遍历，并检测共享图中的环",
    "在 grouping、ungrouping、reparenting 时保持对象世界姿态不变",
    "说明场景图与空间加速结构、透明排序等渲染结构为什么不能混为一谈",
  ],
  runningExample: {
    title: "贯穿例子：房屋、门组与共享窗户",
    description: "房屋由墙、屋顶、门和六个相同窗户组成。先给每个图元独立世界矩阵，再把门的部件放入 DoorGroup，最后让六个 WindowInstance 共享同一 WindowGeometry。每次编辑都数需要修改的节点数量。",
    code: "House\n├─ DoorGroup (M_door)\n│  ├─ panel  ├─ frame  └─ knob\n└─ WindowInstance × 6\n   └─ shared WindowGeometry\nM_world = M_parent_world · M_local",
  },
  chapters: [
    {
      id: "flat-list-to-groups",
      title: "平铺列表能画出来，却表达不了一起编辑",
      pages: "1-8",
      purpose: "从房屋动画精确观察扁平变换的同步成本，再用 group 把结构意图写进数据。",
      beats: [
        b(1, "标题页：Scene Graphs", "细分曲面之后，课程转向组织整个场景。", "网格回答一个对象内部怎样连接；场景图回答许多对象、变换与共享资源怎样组织。它是建模语义结构，不只是渲染时的对象数组。", ["graph 强调节点与边", "后续会从 tree 扩展到 DAG"], { pause: "为太阳—地球—月球和汽车—车轮各画一棵你直觉中的层级树。" }),
        b(2, "最小表示：图元 + 每对象变换", "页面给出方形、圆形等规范图元及其变换后组合。", "只保存少数 canonical primitives 也能构造复杂图形：椭圆是圆经过缩放，斜矩形是方形经过仿射变换。每个对象记录从局部坐标到当前父/世界坐标的变换。", ["左侧 T1…T4 对应规范图元", "右侧每个形状由变换后的点构成"], { textbook: book("教材第 7 章", "7.3 仿射变换", "/book/7/", "齐次矩阵把旋转、缩放和平移统一成可复合的单次矩阵乘法。") }),
        b(3, "扁平房屋第 1 帧：18 个独立对象", "简单图元示例扩展为房屋及一长串 T1…T18。", "扁平列表足够渲染：依次取 geometry 与 world transform 就能画完整房屋。但它没有记录门由哪些部件组成、六扇窗是否同类。", ["列表只编码“有哪些对象”", "右图视觉结构尚未进入数据结构"]),
        b(4, "扁平房屋第 2 帧：移动门要改 8 个变换", "T3…T10 与门周围区域同时加灰色高亮。", "这帧把扁平模型的编辑成本可视化：移动整扇门必须对门框、门板、窗格、旋钮、台阶等多个独立世界矩阵应用同一附加变换。漏改一个就会把门撕裂。", ["高亮覆盖连续一段列表项", "房屋右侧只有门整体被选中"], { pause: "若新世界编辑变换为 E，每个门部件原世界矩阵为 W_i，应把 W_i 更新为 E W_i 还是 W_i E？按列向量约定解释。" }),
        b(5, "Group：把一组对象当作一个对象", "动画例子暂停，页面正式引入 group 节点与树。", "group 包含成员引用；内部节点是组，叶节点是可绘制对象，边表示 membership。关键不是树形好看，而是父变换自动作用于整棵子树。", ["每个树节点只有一个父亲时是 tree", "叶节点仍可拥有自己的局部变换"]),
        b(6, "分组房屋第 1 帧：数据结构反映门和窗", "扁平列表变成含 DoorGroup 与 WindowGroup 的层级，尚未选择节点。", "同一房屋现在按语义组织：门部件共享一个父节点，窗格也形成可复用的小结构。局部矩阵只描述相对父组的位置。", ["左侧括号表示组成员", "右图外观与第 3 页完全相同"]),
        b(7, "分组房屋第 2 帧：一次修改 DoorGroup", "只高亮门组根 TA，右侧仍选中整扇门。", "与第 4 页对照：效果相同，但现在只改一个组矩阵。遍历时 TA 与每个后代的局部矩阵相乘，所有部件自然一起移动。", ["高亮从 8 个叶变成 1 个父节点", "子节点局部布局没有改变"], { formula: "W_leaf=W_house·M_door·M_leaf" }),
        b(8, "Illustrator demo：组是编辑界面的一部分", "房屋图换成 Adobe Illustrator 操作提示。", "分组同时服务数据和交互：普通选择移动整组，进入组内部才编辑子节点。PDF 不包含现场演示，但这页的学习任务是体验选择层级如何对应树节点。", ["group creates transformation hierarchy", "selecting inside group edits internal nodes"], { textbook: book("教材第 12 章", "12.2 场景几何图形", "/book/12/", "教材用铰接摆说明下部局部坐标系如何随上部坐标系一起移动。") }),
      ],
      checkpoint: "比较第 4 页和第 7 页：完成同一次门编辑分别修改多少个矩阵？用根到叶矩阵乘积解释为什么外观一致。",
    },
    {
      id: "tree-paths-and-instances",
      title: "从树到 DAG：路径才代表一次场景出现",
      pages: "9-18",
      purpose: "把层级矩阵链连接到教材坐标变换，再用窗户动画区分实例变换与共享几何编辑。",
      beats: [
        b(9, "最简单的 Scene Graph 是树", "页面给出名称定义和一棵抽象树。", "在树中每节点恰有一个父亲，所以根到节点路径唯一，世界矩阵也唯一。叶通常对应场景对象，内部节点负责分组或状态。", ["root 没有父节点", "每条边都有明确方向"]),
        b(10, "真实层级：卧室不是按绘制顺序组织", "抽象树换成床、储物区、门组、窗组的卧室资产树。", "这张学生作品展示语义层级：Bedroom 下包含 sleeping area、storage、door set、window group；更深处才是床架、床垫、枕头等叶。红色 Shelf group 说明任何层都可继续分组。", ["同类功能形成子树", "层级深度来自建模语义而非几何大小"]),
        b(11, "根到叶矩阵乘积就是 frame-to-world", "页面把 transform hierarchy 与坐标系语言连接起来。", "每个局部矩阵把子坐标表达转到父坐标；沿路径反复换坐标，最终得到世界矩阵。按本项目列向量约定，父矩阵写在左边。", ["组变换作用于所有后代", "对象已有局部变换，因此需要 concatenate"], { formula: "M_world(node)=M_world(parent)·M_local(node)", textbook: book("教材第 7 章", "7.1.5 组合；7.5 坐标变换", "/book/7/", "教材强调 RSv 先应用 S 再应用 R，并把 frame-to-canonical 看作逐级坐标变换。"), example: { title: "三级链", lines: ["House 平移到世界：H", "DoorGroup 相对 House：D", "Knob 相对 DoorGroup：K", "旋钮局部点 p 的世界位置：p_w=H·D·K·p"] } }),
        b(12, "两种扩展：parenting 与 instancing", "树规则旁新增“任意对象可有孩子”和“同一对象可有多个父”。", "parenting 让每个对象也能充当组；instancing 则让一个资源被多个父/变换引用。前者仍可保持树，后者会把结构变成有向无环图。", ["实例共享表示成本", "每次出现仍有自己的变换"]),
        b(13, "实例的最小定义", "页面单独强调 object may belong to more than one group。", "实例不是复制几何数据。多个引用指向同一节点或资源，每条父边提供不同局部变换；改资源会影响所有实例，改某条边的变换只影响一次出现。", ["linked copies 共享身份", "transform different in each case"]),
        b(14, "窗户实例动画第 1 帧：六条路径引用同一窗组", "房屋层级重画为六个实例变换 TB…TF 指向同一 WindowGroup。", "这页是共享结构总览。右侧六扇窗外观相同；左侧不是复制六套窗格节点，而是六条不同路径汇入同一子图。", ["多个父边指向同一括号子树", "每条路径对应一个房屋中的窗户"]),
        b(15, "窗户实例动画第 2 帧：改一个实例位置", "高亮 TC 与中上窗的灰色选择框。", "只编辑 TC 这条实例路径的变换，因此只移动/选中一扇窗。共享 WindowGeometry 没有改变，其它五次出现保持原样。", ["高亮位于父侧实例变换", "右图只有一扇窗被选择"]),
        b(16, "窗户实例动画第 3 帧：改共享叶节点", "高亮共享子图内 T13，六扇窗对应部件全部变深。", "这次编辑的是所有路径共同到达的几何/局部部件，所以六个实例同步变化。第 15→16 页精确区分“实例属性”和“共享资源属性”。", ["高亮从 TC 移到共享子图", "所有窗户同一部件一起改变"], { pause: "材质颜色应放在共享资源还是实例节点？分别写出“所有窗同色”和“每扇窗可不同色”两种需求的数据设计。" }),
        b(17, "森林：实例化的规模收益", "示意图换成大量树木的写实场景。", "森林可以让少量树模型通过不同平移、旋转、缩放重复出现，大幅减少内存。为避免机械重复，可逐实例保存变换、材质参数或随机种子，但树网格仍共享。", ["大量对象形态相似", "实例化节省几何表示而非 draw call 必然为零"]),
        b(18, "有实例后，树变成 DAG", "页面正式给出 directed acyclic graph 与多路径语义。", "一个共享节点有多个父，因此不再有唯一 world transform；根到叶的每条路径才是一场景实例。必须禁止直接或间接包含自身，否则遍历会无限递归、世界矩阵无定义。", ["DAG 允许汇合", "acyclic 禁止回边", "缓存 world matrix 时必须按实例路径而非共享节点身份"], { formula: "scene occurrence = (root→leaf path, accumulated transform)" }),
      ],
      checkpoint: "解释资源、节点、父边、实例路径和场景出现的区别；说明为什么共享节点不能只缓存一个 world matrix。",
    },
    {
      id: "implementation-and-editing",
      title: "遍历与编辑：让结构改变但画面不跳",
      pages: "19-23",
      purpose: "从课件伪代码实现变换累积，并推导 group、ungroup、reparent 的保持世界姿态公式。",
      beats: [
        b(19, "统一接口：Shape 叶节点各自实现 draw", "DAG 概念转为 Square、Circle 继承 Shape 的伪代码。", "多态让遍历者把 primitive 与 group 都当作 Shape；叶节点只负责在规范局部坐标画单位几何，不应知道自己处于房屋哪一层。", ["abstract Shape 定义共同协议", "Square/Circle 不保存祖先状态"]),
        b(20, "遍历第 1 帧：把累计变换传给叶", "draw() 增加 Transform t_c 参数。", "t_c 是 canonical/world 累计矩阵。叶节点用它变换单位几何；递归参数而非全局矩阵栈让实现更易测试、并行和重入。", ["叶只读取累计矩阵", "不要在兄弟节点间泄漏状态"]),
        b(21, "遍历第 2 帧：Group 递归连接矩阵", "页面新增 Group.draw 并对每个 member 调用 m.draw(t_c*t)。", "组先把父累计矩阵与自己的局部矩阵相乘，再把结果传给所有孩子。若局部变换实际存于成员边上，乘法应在遍历该边时进行；无论布局如何，根到叶顺序必须一致。", ["遍历每个 member", "父在左、子在右（列向量）", "DAG 遍历还要做路径级 cycle guard"], { formula: "visit(node,W_p): W=W_p·L_node; for child: visit(child,W); leaf: draw(W)", example: { title: "可测试的递归", lines: ["根以单位矩阵 I 开始", "进入节点只计算新 W，不修改父 W", "兄弟共享同一个父 W", "DAG 中同一资源可被不同 W 多次访问"] } }),
        b(22, "编辑操作：结构变了，世界位置可以不变", "伪代码换成 editing、world transform、group/ungroup、reparent 列表。", ["Grouping 插入 identity 父节点即可不移动孩子。Ungroup 删除组 G 时，把 G 的局部矩阵左乘到每个孩子：L'_child=L_G L_child。", "Reparent 到新父 P_new 时，先保存节点旧世界矩阵 W_old，再设 L'_node=W_newParent^{-1}W_old；这样新路径累积后仍回到 W_old。"], ["先算世界矩阵再改结构", "矩阵乘法次序不可交换", "DAG 下编辑共享节点前要明确是改实例边还是共享资源"], { formula: "L' = W_{newParent}^{-1} W_{oldNode}", pause: "一个节点旧世界矩阵为 W，重挂到世界矩阵为 P 的父节点下。证明 P(P⁻¹W)=W。" }),
        b(23, "设计空间：变换、相机、灯光和状态都可成为节点", "最后一页列出 transforms 放置位置、tree/DAG 与属性节点。", "场景图没有唯一类层级：变换可在节点或边，相机和灯可参与层级，属性节点可让整棵子树变绿。但逻辑场景图不等于渲染排序或空间加速结构；透明物体常需另建排序列表，光追常另建 BVH。", ["节点状态可能向子树继承", "tree 简单但不能共享", "DAG 共享但编辑和缓存更复杂"], { textbook: book("教材第 12 章", "12.2.1 光栅矩阵栈；12.2.2 光追实例", "/book/12/", "教材分别说明光栅遍历怎样 push/pop 矩阵，以及光追怎样把射线逆变换到共享对象空间。"), pause: "为一辆车设计逻辑场景图，再单独列出透明玻璃排序数据和碰撞/BVH 数据。说明三者为什么不应强行合成一棵树。" }),
      ],
      checkpoint: "写出递归 traversal；再分别推导 ungroup 与 reparent 的局部矩阵更新，使编辑前后所有叶节点世界矩阵不变。",
    },
  ],
  synthesis: [
    "扁平列表能渲染，却把结构化编辑变成多矩阵同步问题；group 用一个父变换表达共同运动。",
    "局部矩阵描述节点相对父坐标，世界矩阵是根到节点路径上所有矩阵按顺序的乘积。",
    "树中节点只有一条根路径；实例让多个父引用同一资源，结构变成 DAG，一次场景出现由路径而非叶节点单独标识。",
    "改实例边只影响一次出现；改共享子图会传播到所有实例。资源属性和实例属性必须按产品需求分层。",
    "遍历把累计矩阵作为参数向下传；共享资源可以在不同累计矩阵下被多次绘制。",
    "group、ungroup、reparent 都可在不移动画面的情况下完成，关键是保存旧 world 并求新 local。",
    "场景图表达语义与变换；渲染排序、BVH、碰撞和资源缓存通常是从它派生的其它结构。",
  ],
  finalPractice: "实现 SceneGraphLab：先用扁平列表搭房屋，再重构为 House→DoorGroup 与 6 个 WindowInstance→共享 WindowGeometry。提供节点/边变换可视化、根到叶矩阵面包屑、实例与共享资源不同颜色、cycle 检测，以及 group/ungroup/reparent 操作。自动测试应验证：门组一次移动等价于扁平版逐部件移动；六条实例路径得到六个 world matrix；编辑共享窗格影响六次出现；reparent 前后 world matrix 相同；DAG 中同一资源不缓存唯一 world matrix；非法环被拒绝。",
};
