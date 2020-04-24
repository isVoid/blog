---
layout: post
title: Pointer Generator Network
date: '2020-04-23 20:30'
published: true
version: 1.0
---

<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

This article introduces the Pointer Generator Network and Coverage Mechanism.
After the seminal paper from Sutzkever in 2014 and Bahdanau in 2015, before Transformer
shook the ground in 2017, See et. el. introduced an improvement to the attention mechanism.

## Baseline seq2seq with attention
This paper follows the vanilla seq2seq with attention mechanism. On the encoder side
the model used bidirectional LSTM. On the decoder side, the model used a unidirectional
LSTM.

The attention mechanism is essentally a small linear layer that sits between the encoder
hidden states and the decoders states, telling the decoders which part of the input
sequence it should look at:

$$
e^t_i=v^Ttanh(W_hh_i+W_ss_t+b_{attn}) \\
a^t=softmax(e^t)
$$

Vector $$e$$ contains the scores of the attention, computed by a linear combination
between encoder hidden state $$h$$ and decoder state $$s_t$$. $$v$$, $$W_h$$, $$W_s$$
and $$b_{attn}$$ are trainable parameters. Normalizing this score yields the attention
distribution $$a^t$$.

Then we perform a linear combination of encoder hiddent states with the distribution,
this yields the context information of the current output. Dubbed as "context vector"
$$h_t^c$$

$$
h_t^c=\sum_ia_i^th_i
$$

Combine this with the output state, we have the probability distribution over
the vocabularies at this time-step $$P_{vocab}$$.

$$
P_{vocab}=softmax(V'(V[s_t, h^c_t]+b)+b')
$$

For given word w, the probability that it will happen at time-step t is
$$P(w)=P_{vocab}(w)$$.

The loss at time-step t is negative log likelihood of target word $$w^{target}_t$$:
$$loss_t=-logP(w^{target}_t)$$

The total loss is the summation loss of all time-steps: $$\frac{1}{T}\sum_{t=0}^Tloss_t$$

## Pointer Generator Network
One problem of such model is that these models does not generate words that's not
in the dictionary, even though it exists in the source sequence. In old models,
they are often treated as \<UNK\> tokens, decoders will spit \<UNK\> if that word
should be in the output sequence. This happens frequently, especially when the
text is about a subject of rare name.

For one thing, regular vocabularies often has embeddings pretrained from a much
larger database. They make up the main block of the sentence. On the other hand,
special words do take up an important position in the output sequence, especially
if they are the subjects. To determine when to generate words from the dictionary
as opposed to when to use source tokens, the authors designed a "generation
probability" $$p_{gen}$$:

$$
p_{gen}=\sigma(w^T_hh^c_t+w^T_ss_t+w^T_xx_t+b_{ptr})
$$

We see this takes into account of the context, the decoder state, as well as the
input token of current time-step. Next the distribution of vocabularies is augmented
as:

$$
P(w)=p_{gen}P_{vocab}(w)+(1-p_{gen})\sum_{i:w_i=w}a_i^t
$$

The distribution is now defined on "extended vocabularies". Which is the union
of words in the original dictionary and the input tokens. The first part defines
the distribution of generation, the second part is the distribution on input tokens.
Notice if some token does not show up in the dictionary, $$P_{vocab}$$ is 0. Similarly,
if some token does not show up in source text, $$\sum_{i:w_i=w}$$ is 0.

## Coverage Mechanism
Another problem with seq2seq is that the outputs tends to repeat itself. To take
that into account, the author proposed the converage vector $$c^t$$:

$$
c^t=sum^{t-1}_{t'=0}a^{t'}
$$

This is the accumulated attention probability distribution of input sequence over
all previous time-steps. Coverage vector shows if some part of the input sequence
is not being attended to in the output. This will affect the attention distribution:

$$
e^t_i=v^Ttanh(W_hh_i+W_ss_t+w_cc^t_i+b_{attn})
$$

Besides, a penalize term for repetition, "coverage loss" is defined:

$$
covloss_t=\sum_imin(a^t_i, c^t_i)
$$

If the current output of attention distribution is the same as history accumulated
distribution, this loss is at maximal. The final loss is a weighted combination:

$$
loss_t=-logP(w^{target}_t)+\lambda covloss_t
$$

## Paper and Code
[1] Abigail See, Peter J.Liu, Christopher D. Manning, Get To The Point: Summarization with Pointer-Generator Networks
[https://arxiv.org/abs/1704.04368](https://arxiv.org/abs/1704.04368)

[2] Clean re-production code: [https://github.com/lipiji/neural-summ-cnndm-pytorch](https://github.com/lipiji/neural-summ-cnndm-pytorch)
