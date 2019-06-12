---
layout: post
title:  "279: Perfect Squares"
date:   2019-05-17 10:52 +0800
categories: Leetcode
published: true
---

Given a natural number n, find the *minimum* number of perfect square numbers that sums up to n.

ex1: 12 = 4 + 4 + 4
ans: 3

ex2: 13 = 9 + 4
ans: 2

We call the result `minSq[n]`.

## Naive (BST):
For a number n, we need to divide the number into 2 parts, and recursively test whether
if each part is a perfect square number. Since 1 is a perfect square number, essentially
we need to test every possible combination of n. Take 6 for example:
```
6=0+6
6=1+5 -> 1=...  =>  1
      ->  5=0+5   
          5=1+4 -> 1=...=>  1
                -> 4=0+4=> 1
                   4=1+3-> ... =>  5
                   4=2+2
          5=2+3

6=2+4 -> 2=... =>  2
      -> 4=0+4 =>  1
      -> 4=1+3
      -> 4=2+2  
6=3+3
```
`->` means next recurse, `=>` means the result of that branch. We see that some computation were done more than once. Such as finding minSq[4] was done twice when splitting `6=1+1+4` and `6=2+4`.

## Observation:
We thus record the previous result. From the observation above, if we record `minSq[0]` till `minSq[n-1]`, when splitting n, we don't need to recurse, instead we look up from the `minSq` table, since a split of n is always less than n.

```c++
//112ms 46.53%
//15.2MB 18.13%
int numSquares(int n) {
    vector<int> nsq = {0, 1, 2, 3};

    for (int i = 4; i <= n; i++) {
        nsq.push_back(i);
        int j = 1;
        int k = j * j;
        while (k <= i) {
            nsq[i] = min(nsq[i], 1+nsq[i-k]); //Keep the minimum number.
            j++;
            k = j*j;
        }
    }

    return nsq[n];
}
```

## Langrange Four Sqaure Theorem

>A natural number can be written as sum of 4 perfect square numbers.

Thus for given n, the answer can only be 1, 2, 3, 4. (0 as addend not counted)
Case 1: n is a perfect square number
Case 2: the lesser root is less than sqrt(n), find it first than test the other half.
Case 4: ![Legendre Three Square Theorem](https://en.wikipedia.org/wiki/Legendre%27s_three-square_theorem)
Case 3: Default


```c++
//Lagrange
//4ms 99.53%
//8.2MB 93.56%
bool isSquared(int n) {
    int k = floor(sqrt(n));
    return k * k == n;
}
int numSquares(int n) {
    //1
    int k = floor(sqrt(n));
    if (k*k == n) return 1;

    //2
    for (int i = 1; i <= k; i++) {
        if (isSquared(n - i*i)) return 2;
    }

    //4
    //https://en.wikipedia.org/wiki/Legendre%27s_three-square_theorem
    while (n % 4 == 0)
        n = n / 4;
    if ((n - 7) % 8 == 0)
        return 4;

    return 3;
}
```
