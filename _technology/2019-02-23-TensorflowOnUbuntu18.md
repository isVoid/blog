---
layout: post
title:  "Tensorflow on Ubuntu 18"
date:   2019-02-23 19:00:00 +0100
categories: Machine Learning
published: true
---

# Installation of Tensorflow-GPU on Ubuntu 18

## System Initial Setup:
1. Install with Ubuntu 18.04.2 LTS with *minumum* setup.
2. Use "Software & Updates" -> Additional Drivers to install nvidia-driver-390 (proprietary, tested)
3. Restart

## Install Cuda-toolkit
First, run:
```shell
# Add NVIDIA package repository
sudo apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub
wget http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/cuda-repo-ubuntu1604_9.1.85-1_amd64.deb
sudo apt install ./cuda-repo-ubuntu1604_9.1.85-1_amd64.deb
wget http://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1604/x86_64/nvidia-machine-learning-repo-ubuntu1604_1.0.0-1_amd64.deb
sudo apt install ./nvidia-machine-learning-repo-ubuntu1604_1.0.0-1_amd64.deb
sudo apt update

# Install CUDA and tools. Include optional NCCL 2.x
sudo apt install cuda9.0 cuda-cublas-9-0 cuda-cufft-9-0 cuda-curand-9-0 \
    cuda-cusolver-9-0 cuda-cusparse-9-0 libcudnn7=7.2.1.38-1+cuda9.0 \
    libnccl2=2.2.13-1+cuda9.0 cuda-command-line-tools-9-0

# Optional: Install the TensorRT runtime (must be after CUDA install)
sudo apt update
sudo apt install libnvinfer4=4.1.2-1+cuda9.0
```

The code above installs:
- CUDA® Toolkit —TensorFlow supports CUDA 9.0.
- CUPTI ships with the CUDA Toolkit.
- cuDNN SDK (>= 7.2)
- NCCL 2.2 for multiple GPU support.
- TensorRT 4.0 to improve latency and throughput for inference on some models.

Second, add CUPTI to PATH:
```shell
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda/extras/CUPTI/lib64
```

## Check Python Environment
```
python3 --version
pip3 --version
virtualenv --version
```

On minimum Ubuntu 18.04.2 LTS, python3 is preinstalled. To install pip3:
```shell
# Install distutils
sudo apt-get install python3-distutils
# Download get-pip.py and install
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python3 get-pip.py
```

To install virtualenv (recommended), use system package manager. PS: Official guide discourages using `sudo pip` to install.
```shell
sudo apt install virtualenv
```

Check Python Environment.
```shell
python3 --version
pip3 --version
virtualenv --version
```

## Create a Virtual Environment
Using virtualenv allows user to independently manage all pip packages with respect to certain setup. For example, the dependence tree built for Tensorflow may differ from that used for pyTorch. Worse still, both Tensorflow and pyTorch may depend on the same package, but different version. Thus installing both under the same pip package environement will cause confliction. Ubuntu system also depends on certain pip packages, which is another good reason to separate your python package with the system environment.

To install a new virtualenv, locate a path where the environment should be installed, say, `~/venv/`:
```shell
# install virtual env with system pre installed packages
# using python3, install under ~/venv folder.
virtualenv --system-site-pakcages -p python3 ~/venv
```

Enter this virtual environement (for bash):
```bash
# This line needs to be run everytime a new terminal is setup
source ~/venv/bin/activate
```

## Install Tensorflow GPU
It is an one-liner:
```shell
pip install --upgrade tensorflow-gpu
```

## Test Tensorflow-gpu
```shell
python -c "import tensorflow as tf; tf.enable_eager_execution(); print(tf.reduce_sum(tf.random_normal([1000, 1000])))"
```
Under GPU environement, this line should print all existing gpu devices found.
