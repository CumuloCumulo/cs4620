"use client";

import { useState } from "react";

const questions = [
  ["我完全没有图形学基础，可以学习吗？", "可以。Part 0 专门补齐向量、矩阵、射线参数方程和概率直觉。遇到数学时按需补齐，不需要先完整学完一本线性代数教材。"],
  ["课程需要多长时间？", "标准路线是 12 周，每周 8-10 小时；如果同时工作或上学，可以把每周内容拆成两周，按 20-24 周完成。"],
  ["为什么是 7 个作业，但只有 6 份书面部分？", "原站共有 Mesh、Ray 1、Manipulators、Shaders、Splines、Animation、Ray 2 七个作业单元和七个编程项目。Mesh 页面明确说明只有编程练习，所以可核实的 Written Part 是六份。"],
  ["必须使用原来的 Java 框架吗？", "不必须。历史框架有 2018 年的依赖。你可以保留题目算法与验收要求，使用熟悉的 Java、C++、Python 或 JavaScript 重做；OpenGL/GLSL 项目仍建议使用图形 API。"],
  ["讲义有一千多页，需要逐页翻译吗？", "不需要。先看每节的目标和完成检查，再浏览图与标题，最后精读与目标直接相关的公式。图形学课件高度依赖图示，机械逐句翻译反而容易失去主线。"],
  ["在哪里查看原始课件？", "每节正文都有“打开原始讲义”入口，链接到 Cornell 官方公开 PDF。作业项目页也保留原始题目链接。"],
  ["怎样判断自己真正学会了？", "你应该能关掉课件画出概念图、手算一个小案例、实现最小实验，并解释一个边界情况。网站中的完成检查就是这一标准。"],
];

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="faq-list">{questions.map(([question, answer], index) => <section key={question}><button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><b>{open === index ? "−" : "+"}</b></button>{open === index && <p>{answer}</p>}</section>)}</div>;
}

