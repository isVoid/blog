---
layout: post
title:  "20ValidParenthesis"
date:   2019-01-19 13:06:00 +0400
categories: Leetcode
published: true
---

First Submission:
```c++
#include <iostream>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<int> pStack;

        for (int i = 0; i < s.length(); i++) {
            char cur = s[i];
            if (cur == '(')
                pStack.push(1);
            else if (cur == '[')
                pStack.push(2);
            else if (cur == '{')
                pStack.push(3);
            else if (cur == ')' && !pStack.empty() && pStack.top() == 1)
                pStack.pop();
            else if (cur == ']' && !pStack.empty() && pStack.top() == 2)
                pStack.pop();
            else if (cur == '}' && !pStack.empty() && pStack.top() == 3)
                pStack.pop();
            else
                pStack.push(-1);
        }

        if (pStack.empty()) {
            return true;
        }
        else {
            return false;
        }
            
    }
};

int main() {

    Solution s;
    string in = ")";
    cout << in << " " << s.isValid(in) << endl;

    return 0;
}
```