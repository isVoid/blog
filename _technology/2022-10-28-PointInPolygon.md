---
layout: post
title: Fast Point in Polygon (PiP) Primitive 
date: '2022-10-28 18:00:00'
published: true
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

Point in polygon test is one of the most fundamental building block in ray tracing.
Given a point on a surface and a vertices array representing a polygon,
is the point in the polygon? It also has wide application in GIS systems, forming
one of the sustrates of spatial joins.

Implementing the algorithm efficiently is crucial as ray-tracing is perpetually
computation hungry. [Eric Heines](https://en.wikipedia.org/wiki/Eric_Haines)
gave one efficient implementation in Graphics Gem [online source](https://erich.realtimerendering.com/ptinpoly/).

```C
int CrossingsMultiplyTest(double pgon[][2], int numverts, double point[2])
{
    int j, yflag0, yflag1, inside_flag;
    double ty, tx, *vtx0, *vtx1;

    tx = point[X];
    ty = point[Y];

    vtx0 = pgon[numverts - 1];
    yflag0 = (vtx0[Y] > ty);
    vtx1 = pgon[0];

    inside_flag = 0;
    for (j = numverts + 1; --j; ) {

        yflag1 = (vtx1[Y] > ty);
        if (yflag0 != yflag1) {
            if (((vtx1[Y] - ty) * (vtx0[X] - vtx1[X]) >
                (vtx1[X] - tx) * (vtx0[Y] - vtx1[Y])) == yflag1) {
                inside_flag = !inside_flag;
            }
        }

        yflag0 = yflag1;
        vtx0 = vtx1;
        vtx1 += 2;
    }

    return(inside_flag);
}
```

At first glance, part of the algorithm does look familiar, the inner-most `if`
clause seems to be doing some handedness test by computing the determinent.
But there are also many parts that's alien, what is `yflag`s?

## Back to Basics

Let's derive the ray-crossings test. 
Step 1 is to check if the test point is with the y range of the segment. 
Set test point $$(t_x, t_y)$$, segment as $$(a_x, a_y)$$ -> $$(b_x, b_y)$$.
This is equivalent to checking:

$$
a_y<t_y<b_y \space \lor \space b_y<t_y<a_y
$$

From the test, we know that $$yflag0 \iff t_y>a_y$$, $$yflag1 \iff t_y>by$$. By writing a truth table
between the relationship of `yflags` and our target:

```
                ty > ay    ty > by   ay<ty<by or by<ty<ay   ty>ay != ty>by
ty < ay < by       F          F               F                   F
ty < by < ay       F          F               F                   F
ay < by < ty       T          T               F                   F
by < ay < ty       T          T               F                   F
ay < ty < by       T          F               T                   T
by < ty < ay       F          T               T                   T
```

We thus proved that the checking `yflag0 != yflag1` is equivalent to checking
that `ty` is in the y range of the segment.

Note that in the discussion above, I have confounded boudnary conditions by omitting
`=` sign in the truth table. Boudnary condition for this point in polygon algorithm
is not gaurenteed to start with, so we tend to not discuss case when a point falls
right on the boundary of the y range. In ray-tracing cases there is an infinitestimally
small probability for the point to fall exactly on the boundary.

Step 2 is ray-segment intersection.

The ray is extending to the right direction of x axis, parallel to x axis.
Set ray and segment equations:

$$
A_1x+B_1y=C_1 \\
A_2x+B_2y=C_2
$$

set
$$
rise = b_y-a_y \\
run = b_x-a_x
$$

then
$$
A_1 = 0 \\
B_1 = 1 \\
C_1 = t_y \\
A_2 = rise \\
B_2 = -run \\
C_2 = rise\cdot a_x-run\cdot a_y \\
$$

x coordinate of the intersection is:

$$
x' = \frac{
\det\begin{bmatrix}
B_1 & C_1 \\
B_2 & C_2 \\
\end{bmatrix}}{
\det\begin{bmatrix}
A_1 & B_1 \\
A_2 & B_2 \\
\end{bmatrix}
} = \frac{
\det\begin{bmatrix}
B_1 & C_1 \\
B_2 & C_2 \\
\end{bmatrix}}{
\det\begin{bmatrix}
A_1 & B_1 \\
A_2 & B_2 \\
\end{bmatrix}
}=\frac{run\cdot a_y + (rise\cdot a_x - run \cdot a_y)}{rise}
$$

Ray and segment have 1 intersection iff
$$
tx < x' \iff tx < \frac{run\cdot a_y + (rise\cdot a_x - run \cdot a_y)}{rise} 
$$

Since division is expensive to compute, depending on the sign of rise, this can
be further reduced to:

$$
tx < x' \iff  
(rise > 0 \land tx \cdot rise < run\cdot a_y + (rise\cdot a_x - run \cdot a_y)) \lor \\
(rise < 0 \land rise > run\cdot a_y + (rise\cdot a_x - run \cdot a_y))
$$

However, the `or` predicate can introduce a branching in the code. In GPU kernel,
branching introduces divergence and could reduce performance.

Notice that the sign of $$rise$$ and the direction of the comparator is correlated.

Given $$rise>0$$ is `true`, we expect $$tx \cdot rise < run\cdot a_y + (rise\cdot a_x - run \cdot a_y)$$
to be `true`. And the second half of the predicate basically flips the direction of the comparator
at the same time. Still ignoring the equal case, we can quasi-transcribe the second half as
"given $$rise>0$$ is `false`, we expect $$tx \cdot rise < run\cdot a_y + (rise\cdot a_x - run \cdot a_y)$$
to be `false`". That is, both inequaility should be `true` or `false` at the same time. This leads to the
simplified form of the ray-crossings test:

$$
tx < x' \iff tx \cdot rise < run\cdot a_y + (rise\cdot a_x - run \cdot a_y) == rise > 0
$$

$$rise>0$$ is the `yflag1` we used previously, replacing it results in the finalized form.

## cuSpatial Implementation

cuSpatial impelements this fast point-in-polygon primitive and is available as
both C++ and Python API. A more advanced version utilized quadtree to index the 
points and filters out the qualified points before performing point in polygon
test and is able to perform 1.3M+ points in 27 ROI in the matter of ~1ms ([source](https://medium.com/rapids-ai/releasing-cuspatial-to-accelerate-geospatial-and-spatiotemporal-processing-b686d8b32a9source)).
To know more about cuspatial, see [documentation](https://docs.rapids.ai/api/cuspatial/stable/) to get started.
