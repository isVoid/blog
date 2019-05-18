---
layout: post
title:  "309: Best Time to Buy and Sell Stock with Cooldown"
date:   2019-05-18 17:48 +0800
categories: Leetcode
published: true
---

Say you have an array for which the ith element is the price of a given stock on day i.

Design an algorithm to find the maximum profit. You may complete as many transactions as you like (ie, buy one and sell one share of the stock multiple times) with the following restrictions:

You may not engage in multiple transactions at the same time (ie, you must sell the stock before you buy again).
After you sell your stock, you cannot buy stock on next day. (ie, cooldown 1 day)

## Dp method

(Source from leetcode)

This is a "stage-decision problem". For each stage, each decision, we create an array to record the maximum profit. Specifically:

```
dp1[n] to record max profit on day n if we rest on day n.
dp2[n] to record max profit on day n if we buy on day n.
dp3[n] to record max profit on day n if we sell on day n.
```

### Base Case
```
If we rest on day 0, we have 0 profit. dp1[0] = 0.
If we buy on day 0, we spend the price. dp2[0] = -price[0].
We cannot sell on day 0. dp3[0] = 0
```

### Transition
```
dp1[n]: if we rest on day n, our max profit of this day comes from the maximum of previous day. dp1[n] = max{dp1[n-1], dp2[n-1], dp3[n-1]}.
dp2[n]: if we buy on day n, then we cannot sell on day n-1 due to the cooldown constraint. Neither we can buy on day n-1 due to restriction on double buy. Therefore dp2[n] = dp1[n] - price[n].
dp3[n]: if we sell on day n, the max profit comes from the max buy profit of all previous days plus today's price. dp3[n] = max{dp2[0], ..., dp2[n-1]} + price[n].
```

## Code

```c++
//0ms 100.0%
//9.1MB 57.00%
int maxProfit(vector<int>& prices) {
    if (prices.size() == 0) return 0;

    vector<int> dp1;    //rest
    vector<int> dp2;    //buy
    vector<int> dp3;    //sell

    int maxBought = -prices[0];

    dp1.push_back(0);
    dp2.push_back(-prices[0]);
    dp3.push_back(0);

    for (int i = 1; i < prices.size(); i++) {
        dp1.push_back(max(max(dp1[i-1], dp2[i-1]), dp3[i-1]));
        dp2.push_back(dp1[i-1] - prices[i]);
        dp3.push_back(maxBought + prices[i]);

        if (dp2[i] > maxBought) maxBought = dp2[i];
    }

    return max(max(dp1[dp1.size()-1], dp2[dp2.size()-1]), dp3[dp3.size()-1]);
}
```
