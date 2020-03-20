---
layout: post
title: Fairseq Distributed Training Notes
date: '2020-03-19 18:00 -0400'
published: true
---

Fairseq distributed training is largely built on top of the distributed training feature provided by [Pytorch](https://pytorch.org/tutorials/intermediate/dist_tuto.html). A couple important notes from their tutorial that will be useful:
1. The example provided in the tuorial is data-parallelism. It splits the training data to several different partitions and perform forward/backward pass independently on different machines, and average the gradients to update the parameter.
2. `init_process_group()` defines the communication mechanisms for the processes to communicate. Can either specify `store` (dictionary of running instances) or `init_method` (address to find master process) to initialize.

## distributed_utils.py
Under the root of `Fairseq` there is a file called distributed_utils, which defines interfaces to setup distributed training.
```python
# Check if rank is 0
def is_master(args):...
# Dynamically compute distributed arguments if available from environment
# Such as slurm envinronment variables
def infer_init_method(args):...
# Create processes
def distributed_init(args):...
# Get process rank, world size, process group
def get_rank():...
def get_world_size():...
def get_default_group():...
# For meaning of all_reduce/gather, see Pytorch tutorial
def all_reduce(tensor, group=None):...
def all_gather_list(data, group=None, max_size=16384):...
def all_reduce_dict(
    data: Mapping[str, Any],
    device,
    group=None,
) -> Dict[str, Any]:...
```

## fairseq_cli::train.py
This method is the entry point for training a model using fairseq command line tools. The entry function is `cli_main()`. This method mainly determines the distributed training scheme according to arguments, in particular. Three distributed training scheme are possible:
- Multi nodes, multi gpu training
- Single node, multi gpu training
- Single node, single gpu training
Note that CPU training is not possible in fairseq.

the logics are written in pseudo-code as follows:
```python
# Dynamically compute arguments for distribution init method
distributed_utils.infer_init_method(args)
if args.distributed_init_method is not None:
  # Multi node, multi-gpu training
  if args.cuda.device_count() > 1 and not args.distributed_no_spawn:
    # Torch method that spawns processes
    torch.multiprocessing.spawn(distributed_main, args, ndevices)
  else:
    distributed_main(args)
elif args.distributed_world_size > 1:
  # Perform multi-gpu, single node training
  init_method = "tcp://localhost"
  torch.multiprocessing.spawn(distributed_main, args, ndevices)
else:
  # Single node, single gpu training
  main(args)
```

`Distributed_main` is a wrapper for main in a distributed training scenario. The first argument is the rank of the process. It will passed to main via `arg.distributed_rank`. The rank will also be used to set `devices_id` in the cluster. At the start of `main()`, the following codes are used to setup:

```python
if torch.cuda.is_available() and not args.cpu:
  torch.cuda.set_device(args.device_id)
if init_distributed:
  args.distributed_rank = distributed_utils.distributed_init(args)
```
Remember in `main()` only a single process is running in syncchronized mode. The first line defines which gpu device the process has access to, the second line defines where to find the master process.

The data partition part is largely handled by different iterator classes.
