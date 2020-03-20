---
layout: post
title: Fairseq Transformer, BART (II)
date: '2020-03-19 11:00 -0400'
published: true
version: 1.0
---

This is a 2 part tutorial for the Fairseq model BART. In the first part I have
walked through the details how a Transformer model is built. Please refer to [part 1](http://yinghaowang.xyz/technology/2020-03-14-FairseqTransformer.html).

A BART class is, in essence, a FairseqTransformer class. The difference only lies
in the arguments that were used to construct the model. Since this part is relatively
straightforward, I will postpone diving into its details till the end of this article.

For now, I will discuss how a BART model is actually loaded if you follow BART
[Official Doc](https://github.com/pytorch/fairseq/tree/master/examples/bart).

## Pytorch Hub
Bart model is loaded via Pytorch Hub. Pytorch hub allows researchers to host their
models in their own github repository. Researchers should define a `hubconf.py` at
the root of their github repository to define how torch hub can retrieve their model
definition and pretrained weights.

When the user calls `load` method, he needs to pass in `github` and `model` arguments.
The former defines which github repository to look, the latter defines which `model`
it should retrieve. The `model` argument specifies the function name defined in
`hubconf.py` to call from.

Fairseq's hubconf.py defines the following routines that registers some functions to
for user's to retrieve model from:
```python
for _model_type, _cls in MODEL_REGISTRY.items():
    for model_name in _cls.hub_models().keys():
        globals()[model_name] = functools.partial(
            _cls.from_pretrained,
            model_name,
        )
```
It loop over all `MODEL_REGISTRY` to retrieve all name and model class. For each model class, it retrieve the URLs to available pretrained models using the `hub_models` method. What `hub_models` return is a dictionary, the keys are the name to the model and the entries are the URLs to the pretrained model. Fairseq will add those keys as the names of the global function list, mapping them to a partial function: with model path fixed to the retrieved pretrained model.

## BARTModel::from_pretrained
`BartModel.from_pretrained` actually calls `hub_utils.from_pretrained()` to return a dictionary with three key-value items: ‘args’ ‘task’ ‘models’. It uses the `checkpoint_utils::load_model_ememble_and_task()` method. This is the function that builds the model and load state dict to the model. Remember that BartModel is a nn.module in nature, calling `load_state_dict` will load pretrained weights to the model. The loaded model is then returned to help construct a BARTHubInterface instance.

A closer examination sees that the parameters for building the model is also saved to the checkpoint file, after loading with `checkpoin_utils::load_check_point_to_cpu()` method, it will return a state dictionary, in which the `args` key corresponds to the arguments that used to rebuild the model, the `model` key corresponds to the dictionary that contains the trained weights.

An important side note is that the task that bart utilizes is defined in those `args`, which is a `Task::denoising` task, we will look at this class later.

## BARTHubInterface
A `BARTHubinterface` is eventually what a `torch.hub.load()` returns, the interface provides a few useful methods that helps user to use the model.

```python
class BARTHubInterface(nn.Module):
    # Save user defined arguments, task and model are setup in from_pretrained
    def __init__(self, args, task, model):
    @property
    def device(self):...
    # encode a sentence/sentence pair to bpe encoding, returns a long tensor
    def encode(self, sentence: str, *addl_sentences, no_separator=True) -> torch.LongTensor:...
    # decode bpe encodings back to a normal sentence, returns a string
    def decode(self, tokens: torch.LongTensor):...
    # convert input tokens to proper encodings
    def _build_sample(self, src_tokens: List[torch.LongTensor]):...
    # The function that performs summarization task
    # See below discussion
    def sample(self, sentences: List[str], beam: int = 1, verbose: bool = False, **kwargs) -> str:...
    # utilized by sample
    def generate(self, tokens: List[torch.LongTensor], beam: int = 5, verbose: bool = False, **kwargs) -> torch.LongTensor:...
    # Bart has a special head used for sentence classification, the default is
    # defined in model.py::BARTClassificationHead, can add user defined head
    def register_classification_head(
        self, name: str, num_classes: int = None, embedding_size: int = None, **kwargs
    ):...
    # Interface used for sentence level classification. It uses the output from the
    # classification head (which are the logits) and pass through a log_softmax.
    def predict(self, head: str, tokens: torch.LongTensor, return_logits: bool = False):...
```
A `sample` method is devided in three steps: `encode`, `generate`, `decode`. The `genreate` methods calls the `build_generator` method that's defined in the `DenosingTask`, which inherits
from `FairseqTask`. `build_generator` method returns a `SequenceGenerator` class, which takes a source token sequence and perform “translation”. A translation involves many special token handling (BOS, EOS), paddings, masks, model feed forward and word search.

## BARTModel
The `BARTModel` is a `Transformer` class. Besides the aforementioned `hub_models()`, `from_pretrained()` and `register_classification_head()` method and other support methods. It defines a (quite trivial) `forward` method: It simply passes the input tokens through the encoder and decoders. Bart may support sentence classification task, thus user may define whether to use sentence classification head or not, or even pass in a custom defined head.

Some important BART parameters includes: it has 12 `TransformerEncoderLayer` and `TransformerDeocderLayer` respectively. Each of them has 16 attention heads. The input
dimensions are 1024 and hidden layers are 4096. They both does not adopt `LayerDrop`, aka prob is 0. Dropout used at attension layer is 0.1. Activation function is `GELU`. Optimization
is ADAM, with parameter `adam_betas='(0.9, 0.999)', adam_eps=1e-06`. I have host the complete
parameter set and model definition [here](https://gist.github.com/isVoid/2a5cff80b9efcb294822d4e765eab99a).
