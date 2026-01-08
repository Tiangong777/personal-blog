---
title: Basics of neural networks
category: Machine learining
katex: true
published: false
hide: true
---
### Application Network
Implement a simple Multi-Layer Perceptron classifier using numpy.
#### ReLULayer
``` python
import numpy as np
from sklearn import datasets
import matplotlib.pyplot as plt

def input_gredient_for_relu(input):
    res = np.zeros_like(input, dtype=float)
    idx_greater = np.where(input > 0)
    idx_lesser_or_equal_zero = np.where(input < 0)
    res[idx_greater] = 1.0
    res[idx_lesser_or_equal_zero] = 0.0
    return res

class ReLULayer(object):
    def forward(self, input):
        self.input = input
        zeros_m = np.zeros_like(self.input)
        # Relu(x), if x > 0  Relu(x) = x else Relu(x) = 0
        relu = np.maximum(zeros_m, self.input) 
        return relu

    def backward(self, upstream_gradient):
        relu_gredient = input_gredient_for_relu(self.input)
        downstream_gradient = np.multiply(upstream_gradient, relu_gredient)
        return downstream_gradient

    def update(self, learning_rate):
        pass # ReLU is parameter-free
```
#### OutputLayer
``` python
class OutputLayer(object):
    def __init__(self, n_classes):
        self.n_classes = n_classes

    def forward(self, input):
        # remember the input for later backpropagation
        self.input = input
        # return the softmax of the input
        exp = np.exp(self.input)
        sum_row = np.sum(exp, axis=1)
        softmax = exp/sum_row[:, np.newaxis]
        return softmax

    def backward(self, predicted_posteriors, true_labels):
        downstream_gradient = predicted_posteriors 
        index = [np.arange(true_labels.size), true_labels]
        downstream_gradient[tuple(index)] -= 1 
        return downstream_gradient

    def update(self, learning_rate):
        pass 
```
#### LinearLayer
``` python
class LinearLayer(object):
    def __init__(self, n_inputs, n_outputs):
        self.n_inputs  = n_inputs
        self.n_outputs = n_outputs
        # randomly initialize weights and intercepts
        mu = 0
        sigma = 1
        B_shape = (n_outputs, n_inputs)
        self.B = np.random.normal(mu, sigma, B_shape) 
        self.b = np.random.normal(mu, sigma, n_outputs) 

    def forward(self, input):
        # remember the input for later backpropagation
        self.input = input
        # compute the scalar product of input and weights
        # (these are the preactivations for the subsequent non-linear layer)
        preactivations = (self.B @ input.T).T + self.b[np.newaxis,:] 
        return preactivations

    def backward(self, upstream_gradient):
        self.grad_b = np.mean(upstream_gradient, axis = 0) 
        self.grad_B = []
        for i in range(self.input.shape[0]):
            if i == 0:
                self.grad_B = np.outer(upstream_gradient[i], self.input[i])
            else:
                self.grad_B += np.outer(upstream_gradient[i], self.input[i])
        self.grad_B /= self.input.shape[0] 

        # compute the downstream gradient to be passed to the preceding layer
        downstream_gradient = upstream_gradient @ (self.grad_B + self.grad_b[:, np.newaxis]) 
        return downstream_gradient

    def update(self, learning_rate):
        self.B = self.B - learning_rate * self.grad_B
        self.b = self.b - learning_rate * self.grad_b
```
#### RecordEpochsError
``` python
class RecordEpochsError:
    def __init__(self):
        self.test_error = []

    def init(self, network, X_test):
        self.network = network
        self.X_test = X_test

    def record(self):
        predicted_positions = self.network.forward(self.X_test)
        predicted_classes = predicted_positions.argmax(1)
        error_rate = (np.sum(predicted_classes != Y_test) / X_test.shape[0]) * 100 
        self.test_error.append(error_rate)

record_error = RecordEpochsError()
```
#### MLP
``` python
class MLP(object):
    def __init__(self, n_features, layer_sizes):
        # constuct a multi-layer perceptron
        # with ReLU activation in the hidden layers and softmax output
        # n_features: number of inputs
        # len(layer_size): number of layers
        # layer_size[k]: number of neurons in layer k
        # (specifically: layer_sizes[-1] is the number of classes)
        self.n_layers = len(layer_sizes)
        self.layers = []

        # create interior layers (linear + ReLU)
        n_in = n_features
        for n_out in layer_sizes[:-1]:
            self.layers.append(LinearLayer(n_in, n_out))
            self.layers.append(ReLULayer())
            n_in = n_out

        # create last linear layer + output layer
        n_out = layer_sizes[-1]
        self.layers.append(LinearLayer(n_in, n_out))
        self.layers.append(OutputLayer(n_out))

    def forward(self, X):
        # X is a mini-batch of instances
        batch_size = X.shape[0]
        # flatten the other dimensions of X (in case instances are images)
        X = X.reshape(batch_size, -1)

        # compute the forward pass
        # (implicitly stores internal activations for later backpropagation)
        result = X
        for layer in self.layers:
            result = layer.forward(result)
        return result

    def backward(self, predicted_posteriors, true_classes_Y):
        # perform backpropagation w.r.t. the prediction for the latest mini-batch X
        result = self.layers[-1].backward(predicted_posteriors, true_classes_Y)
        # Go backwards for the rest of the layers
        for layer in reversed(self.layers):
            if isinstance(layer, OutputLayer):
                continue
            result = layer.backward(result)
        return result

    def update(self, X, Y, learning_rate):
        posteriors = self.forward(X)
        self.backward(posteriors, Y)
        for layer in self.layers:
            layer.update(learning_rate)

    def train(self, x, y, n_epochs, batch_size, learning_rate):
        N = len(x)
        n_batches = N // batch_size
        for i in range(n_epochs):
            # (i.e. sample mini-batches without replacement)
            permutation = np.random.permutation(N)

            for batch in range(n_batches):
                # create mini-batch
                start = batch * batch_size
                x_batch = x[permutation[start:start+batch_size]]
                y_batch = y[permutation[start:start+batch_size]]
                # perform one forward and backward pass and update network parameters
                self.update(x_batch, y_batch, learning_rate)
            record_error.record()
```
#### Run
``` python
N = 2000

X_train, Y_train = datasets.make_moons(N, noise=0.05)
X_test,  Y_test  = datasets.make_moons(N, noise=0.05)
n_features = 2
n_classes  = 2

# standardize features to be in [-1, 1]
offset  = X_train.min(axis=0)
scaling = X_train.max(axis=0) - offset
X_train = ((X_train - offset) / scaling - 0.5) * 2.0
X_test  = ((X_test  - offset) / scaling - 0.5) * 2.0

# set hyperparameters 
layer_sizes = [5, 5, n_classes]
n_epochs = 5
batch_size = 200
learning_rate = 0.05

# create network
network = MLP(n_features, layer_sizes)
record_error.init(network, X_test)
n_epochs = 50  # add epochs to see convergence status

# train
network.train(X_train, Y_train, n_epochs, batch_size, learning_rate)

# test
positions_posteriors = network.forward(X_test)
# determine class predictions from posteriors by winner-takes-all rule
predicted_classes = positions_posteriors.argmax(1) 
# compute and output the error rate of predicted_classes
error_rate = (np.sum(predicted_classes != Y_test)/X_test.shape[0]) * 100 
print("error rate:", error_rate)

print("record_error rate:", record_error.test_error)
plt.figure(figsize=(9, 4))
plt.plot(record_error.test_error, linestyle='--', label="MLP test error")
plt.legend()
plt.title("MLP test errors")
plt.xlabel("T")
plt.ylabel("Error")
plt.show()
```
```
error rate: 36.8
record_error rate: [50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 36.95, 37.15, 39.15, 39.900000000000006, 39.65, 39.0, 38.7, 38.3, 38.1, 37.9, 37.75, 37.6, 37.45, 37.3, 37.2, 37.15, 37.1, 37.2, 37.35, 37.3, 37.25, 37.25, 37.2, 37.2, 36.95, 36.95, 37.0, 36.95, 36.95, 36.95, 36.95, 36.9, 36.8, 36.75, 36.7, 36.7, 36.65, 36.7, 36.8, 36.8, 36.8]
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/2/output_2_1.png)