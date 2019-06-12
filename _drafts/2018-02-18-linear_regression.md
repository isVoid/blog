---
layout: post
title:  "机器学习笔记（一） 线性回归"
date:   2018-02-18 13:22:00 -0600
categories: CS Math
published: false
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

> 这系列是一组我在Coursera上学习机器学习时总结的一些笔记。由于涉及到Coursera的Honor Code, 我尽量使用我自己的语言来总结。论证过程中如有疏忽与缺漏，请不吝指正。

给定一组数据\\({(x_1, y_1), (x_2, y_2), ..., (x_m, y_m)}\\)，我们用一个模型来预测这组数据的趋势，这个模型用\\(\theta\\)来参数化。那么这个模型可以用这条式子来表述：
$$
\hat{y} = f(x, \theta)
$$

最简单的是一个两参数的模型：\\(f(x, \theta) = \theta_1x + \theta_2\\)，这是一个线性模型。

为了用一个量衡量这个模型的好坏，我们用均方误差来计算这个模型在已知数据上的表现：

$$
J(\theta) = \frac{1}{2m}\sum_{i=0}^{m}(f(x_i,\theta) - y_i)^2 = \frac{1}{2m}\sum_{i=0}^{m}(\theta_1 x_i + \theta_2 - y_i)^2
$$

为了能最后算出\\(\theta = argmin(J(\theta))\\)的值，我们有两种方法：直接用公式，或者用梯度下降。

梯度下降法：先对\\(J(\theta)\\)求各个\\(\theta\\)方向上的偏导：

$$
\frac{dJ}{d\theta_0} = \frac{1}{m}\sum_{i=0}^{m}(\theta_1 x_i + \theta_2 - y_i)\\

\frac{dJ}{d\theta_1} = \frac{1}{m}\sum_{i=0}^{m}x_i(\theta_1 x_i + \theta_2 - y_i)
$$

之后更新各个\\(\theta\\)的值：

$$
\theta_i = \theta_i + \alpha * \frac{\partial J}{\partial\theta_i}
$$

公式法：

令
$$
\mathbf{x} =
 \begin{bmatrix}
  x_1 & 1 \\
  x_2 & 1 \\
  \cdots & \\
  x_m & 1
 \end{bmatrix}
$$
,\\(\boldsymbol{\theta} = (\theta_1, \theta_2)^T\\) 和
$$\mathbf{y}=
\begin{bmatrix}
 y_1 \\
 y_2 \\
 \cdots & \\
 y_m
\end{bmatrix}
$$， 我们可以表示\\(J(\theta) = \frac{1}{2m}(\mathbf{x}\boldsymbol{\theta} - \mathbf{y})^T(\mathbf{x}\boldsymbol{\theta} - \mathbf{y})\\)

根据我们的对导数的认识，对函数进行求导并取导数为0可以求极值。对\\(\theta\\)的偏导求0：

$$
\frac{\partial J}{\partial \boldsymbol{\theta}} = 2\mathbf{x}^T\mathbf{x}\boldsymbol{\theta}-2\mathbf{x}^T\mathbf{y} = 0
$$

得到：

$$
\boldsymbol{\theta} = (\mathbf{x}^T\mathbf{x})^{-1}\mathbf{x}^T\mathbf{y}
$$

参考资料：

\\(\frac{\partial J}{\partial \boldsymbol{\theta}}\\) 求导过程：[https://eli.thegreenplace.net/2014/derivation-of-the-normal-equation-for-linear-regression](https://eli.thegreenplace.net/2014/derivation-of-the-normal-equation-for-linear-regression)
