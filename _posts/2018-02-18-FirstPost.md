---
layout: post
title:  "Jekyll启用MathJax支持"
date:   2018-02-18 12:39:00 -0600
categories: General
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>


Jekyll 第一个博客。启用MathJax支持的方法：这里采用的是默认的minima主题。

- 单个Post启用：直接在Markdown文件中包括MathJax路径。

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

```

- 默认每个Post启用：

  - 到minima的仓库下载_layout文件夹，将所有的_layout文件夹拷到blog文件夹下。

  - 在post.html最后，加上MathJax的路径。

- 使用样例：

  - Math Block （单独一行）:

```latex
$$
E(X) = \int_{-\infty}^\infty \mathrm{xf(x)}\,\mathrm{d}x
$$
```

$$E(X) = \int_{-\infty}^\infty \mathrm{xf(x)}\,\mathrm{d}x$$

  - Inline Math （行内）:

```latex
勾股定理的表达式为 \\(a^2 + b^2 = c^2\\)
```

勾股定理的表达式为 \\(a^2 + b^2 = c^2\\)

- 参考Post设置资料：

  - [官方文档](https://jekyllrb.com/docs/extras/)

  - [Gaston Sanchez]( http://www.gastonsanchez.com/visually-enforced/opinion/2014/02/16/Mathjax-with-jekyll/)

- 非常好的Math Latex Wiki:

  - [https://en.wikibooks.org/wiki/LaTeX/Mathematics](https://en.wikibooks.org/wiki/LaTeX/Mathematics)
