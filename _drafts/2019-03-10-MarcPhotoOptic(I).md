---
layout: post
title:  "Optics(I)"
date:   2019-03-10 10:30:00 +0100
categories: Photography
published: true
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

光学（I）

Way to compare image quality:
Contrasts.
Sharpness.
Chromatic Abberations.

Physical vs geometrical optics
Light can be modeled as traveling waves.
The perpendiculars to these waves can be drawn as rays.
diffraction causes the rays to bend.

When light passes thorugh a small slit (hole):
if the hole is small, it belongs in wave optics.
if the hole is large, it belongs in geometrical optics.

Geometrical optics assumes:
- \\(\lambda \rightarrow 0\\) (wavelength in relevant to slit size is 0)
- no diffraction
- rays propagate in straight line (rectlinear propagation)

Snell's law of refraction:
As the wave change speed at an interface, the direction also changes.

"The refraction angle ratio equals to the inversely proportional to speed of light ratio."

$$
\frac{sin\theta_i}{sin\theta_t}=\frac{n_t}{n_i}
$$

Refractive Indices = \\(\frac{c}{Material Speed of light}\\)
air: 1.0
water: 1.33
glass: 1.5-1.8

Hyperboloidal optics focus all parallel lights to one point, but vert difficult
to make.

Spherical optics are easier to make, but for rays to the very edge they do not
focus to the same point.

Approximation doing lens analysis:
- Geometrical optics instead of physical optics
- Spherical optics instead of hyperboloidal optics
- Thin lens representation
- Paraxial approximation

Gaussian lens formula (based on assumptions above):
$$
\frac{1}{S_o}+\frac{1}{s_i}=\frac{1}{f}
$$

These 3 parameter + sensor size determines FOV.
1:1 Imaging
So = f is the minimum object distance.
