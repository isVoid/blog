---
layout: post
title:  "贝叶斯推理（二）"
date:   2018-02-18 17:32:00 -0600
categories: CS Math Probability Bayesian
published: false
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

>这个笔记来自我跟UCSC的Coursera课程Bayesian Statistics的笔记。工科学生通常本科阶段讲的统计学不会特别深入，特别是概率学与推理部分讲得比较少，这个课程是作为本科统计很好的延伸。


### 贝叶斯定理：

$$
P(A|B) = \frac{P(A\cap B)}{P(B)} = \frac{P(B|A)P(A)}{P(B)}
$$

第一个等式是条件概率的公式，后面是贝叶斯定理。A, B是两个随机事件。假如说A，B的先验概率（古典概率）比较易得，那么我们可以通过贝叶斯定理来获得A的后验概率。
