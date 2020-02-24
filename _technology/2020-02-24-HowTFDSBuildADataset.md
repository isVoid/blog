---
layout: post
title: How TFDS build a dataset - A Survey Study Using XSUM as an Example
date: '2020-02-24 15-45 -0400'
published: true
version: 1.1
---

**Tensorflow Dataset** defines a unified wrapper for all kinds of dataset handling. Traditionally, to process a dataset, one needs to download a dataset, process them into the type that works for tensorflow.
TFDS provides a simple method `tfds.load()` and directly returns a `tf.data.Dataset` object.

The key component in `tfds.load` to build a dataset is `DatasetBuilder`. A `DatasetBuilder` has 3 important elements:
- `info`: this includes feature names, types, shapes, and other metadata
- `download_and_prepare`:  download and write to disk
- `as_dataset`, build input pipeline to with tf.Data.Dataset
  - Construct a tf.data.Dataset, returns a dictionary of tf.data.Dataset. Example: `{'test': Dataset, 'train', Dataset, ...}`, keyed by splits.
  - Each tf.data.Dataset has list tuples: `[(tf.Tensor('text'), tf.Tensor(1))]`

Typical usage of a dataset bulider:
```python
  mnist_builder = tfds.builder("mnist")
  mnist_info = mnist_builder.info
  mnist_builder.download_and_prepare()
  datasets = mnist_builder.as_dataset()
  train_dataset, test_dataset = datasets["train"], datasets["test"]
```

One should implement these `DatasetBuilder` functions. Specifically, a `DatasetBuilder` base class defines these abstrctmethods in the DatasetBuilder base class:

```python
  @abc.abstractmethod
  def _info(self):
    """Construct the DatasetInfo object. See `DatasetInfo` for details.

    Warning: This function is only called once and the result is cached for all
    following .info() calls.

    Returns:
      dataset_info: (DatasetInfo) The dataset information
    """
    raise NotImplementedError

  @abc.abstractmethod
  def _download_and_prepare(self, dl_manager, download_config=None):
    """Downloads and prepares dataset for reading.

    This is the internal implementation to overwrite called when user calls
    `download_and_prepare`. It should download all required data and generate
    the pre-processed datasets files.

    Args:
      dl_manager: (DownloadManager) `DownloadManager` used to download and cache
        data.
      download_config: `DownloadConfig`, Additional options.
    """
    raise NotImplementedError

  @abc.abstractmethod
  def _as_dataset(
      self, split, decoders=None, read_config=None, shuffle_files=False):
    """Constructs a `tf.data.Dataset`.

    This is the internal implementation to overwrite called when user calls
    `as_dataset`. It should read the pre-processed datasets files and generate
    the `tf.data.Dataset` object.

    Args:
      split: `tfds.Split` which subset of the data to read.
      decoders: Nested structure of `Decoder` object to customize the dataset
        decoding.
      read_config: `tfds.ReadConfig`
      shuffle_files: `bool`, whether to shuffle the input files. Optional,
        defaults to `False`.

    Returns:
      `tf.data.Dataset`
    """
    raise NotImplementedError
```

Note that if in the derived dataset class, `NotImplementedError` will raise if any of them are not implemented.

For a specific dataset, such as XSUM, one doesn’t have to implement everything from scratch, as there are other more concrete classes inheriting from the base class that have part of the functions implemented. In XSUM example, it is derived from a `GeneratorBasedBuilder`.

A `GeneratorBasedBuilder` is inherited from `FileAdapterBuilder`, which inherits from `DatasetBuilder`. Let’s look at them one by one:

## FileAdapterBuilder
A `FileAdapterBuilder` assumes the dataset is saved in some kind of file, and follows some splits, such as train/valid/test split.

So `FileAdapterBuilder` relies on `tfds.data.file_format_adapter`, which is simply a wrapper for reading and writing tfrecords. FileAdapterBuilder also implements the `_download_and_prepare` method and the `_as_dataset` method, in which:

`_download_and_prepare` requires two functions to be implemented in an actual dataset: `_split_generators` and `_prepare_split`.

`_split_generators` generates a list of `tfds.core.SplitGenerator`. A `SplitGenerator` defines how to generate a split and what split split it is. For example:

```
[tfds.core.SplitGenerator(name=TRAIN, gen_kwargs={‘File’: ‘xsum.train.zip’})]
```
will call `_generate_examples(files=’xsum.train.zip’)` to generate the train split for the dataset.

`_prepare_split` use the split_generators to actually generate the splits, it can also do other preprocessing the the split using kwargs** from download_and_prepare. `_as_dataset()` wraps some details for tfrecord handling and fileio. In sum, a `FileAdapterBuilder` requires `_split_generator` and `_prepare_splits` to be implemented in subclass.

## GeneratorBasedBuilder
A `GeneratorBasedBuilder` assumes the dataset is based on `SplitGenerator`. It implements `_prepare_split`. A dataset is downloaded via `_prepare_example` where `_prepare_example` is a python generator function. It generates a pair `(key, example)`. An `example` is a dictionary of `<feature_name, feature_value>`. Note that the items in the dictionary should be processed to “ready to write to disk” state.

A subclass of GeneratorBasedBuilder should implement an `_info()`, a `_prepare_example()` and a `_split_generators()`.

With these in mind, let’s look at a specific example, the Xsum dataset:

## XSUM

XSUM dataset is collected by the University of Edinburgh. It contains ~220K BBC news articles, where each has one liner of summary written by a professional editor and a paragraph of the news. The repo provides scripts to download the raw html files from links in the wayback machine. And provides a parsing script to process the html file into the following format:

Filename: `[0-9]{8}.data` \
```
[XSUM]URL[XSUM]
<one-liner url>

[XSUM]INTRODUCTION[XSUM]
<introductory sentence extracted from BBC site>

[XSUM]RESTBODY[XSUM]
<The actual news paragraph, can have many lines\>
```

`tfds.summarization.Xsum` class inherites `GenearatorBasedClass`. So it needs to implement the three functions: `_info()`, `_prepare_example()` and `_split_generators()`.

`_info()` is simple, it returns a `tfds.core.DatasetInfo()` instance.

Prerequisite to `_split_generators()` is that user should manually download the data and place it into the tfds.core.Download.manual_dir directory. In `_split_generators()`, dl_manager simply extract the dataset and return a SplitGenerator pointing to the extraction path.

`_generate_examples` is the key processing function that processes the file provided by the University of Edinburgh. It returns a UID for the example and a dictionray with `_DOCUMENT` and `_SUMMARY` keys.

Here is the pseudocode how tensorflow handles the dataset:
```
For each file:
	For each line in file:
		If the line is in _REMOVE_LINE, discard the line
		Else add the line into the read text
	Segment read text with delimiter [XUM]
	Take the 6th segment as the _DOCUMENT and 4th segment as _SUMMARY. Use the current file count as UID.
  Log to logger if the file is missing.
```
Note that `_REMOVE_LINE` is defined as
```python
_REMOVE_LINES = set([
    "Share this with\n", "Email\n", "Facebook\n", "Messenger\n", "Twitter\n",
    "Pinterest\n", "WhatsApp\n", "Linkedin\n", "LinkedIn\n", "Copy this link\n",
    "These are external links and will open in a new window\n"
])
```
Since some of the article will contain some text links to social media in the beginning.
