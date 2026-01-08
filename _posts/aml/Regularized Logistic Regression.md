---
title:  Regularized Logistic Regression
category: Machine learining
katex: true
published: false
hide: true
---
## Regularized Logistic Regression
A binary classifier that assigns a label $y_i$ ∈ {−1, 1} to a sample $X_i$ ∈ $R^D$ (a row vector) in terms of a winner-takes-all decision
$$\\widehat{y}=\\operatorname{argmax}_{k \\in\\{-1,1\\}} P\\left(y=k \\mid X_i, \\widehat{\\beta}\\right)=\\left\\{\\begin{aligned}1 & \\text { if } X_i \\widehat{\\beta}>0 \\\\-1 & \\text { if } X_i \\widehat{\\beta} \\leq 0\\end{aligned}\\right.$$
with parameter $\\widehat{\\beta}∈R^D$ (a row vector). We assume that the intercept has been absorbed into $\\widehat{\\beta}$ by appending a column of ones to the feature matrix X. The posterior probability is modelled by
the sigmoid function
$$
P\left(y=1 \mid X_i, \widehat{\beta}\right)=\sigma\left(X_i \widehat{\beta}\right)=\frac{1}{1+\exp \left(-X_i \widehat{\beta}\right)} \quad P\left(y=-1 \mid X_i, \widehat{\beta}\right)=1-\sigma\left(X_i \widehat{\beta}\right)=\sigma\left(-X_i \widehat{\beta}\right)
$$
and the optimal parameter vector $\\widehat{\\beta}$ is found by minimizing the regularized logistic loss $\mathcal{L}$(β) over
the training set
$$\\widehat{\beta}=\operatorname{argmin}_\beta \mathcal{L}(\beta) \quad \text { with } \quad \mathcal{L}(\beta)=\frac{\beta^T \beta}{2 \lambda}+\frac{1}{N} \sum_i \log \left(1+\exp \left(-y_i X_i \beta\right)\right)$$
where λ is the inverse regularization parameter (i.e. small values of λ lead to strong regularization).
###  Load the Dataset
create a reduced feature matrix X by slicing the dataset such that it only contains the instances where target[i] is 6 or 8. In addition, append a column of ones to the
resulting matrix to take care of the intercept. Create a matching vector of ground-truth labels with
$$y_i=\\left\\{\\begin{aligned} 1 & \\text { if target }[i]=6 \\\\ -1 & \\text { if target }[i]=8 \\end{aligned}\\right.$$
```python
import matplotlib.pyplot as plt
import numpy as np
from sklearn.datasets import load_digits

digits = load_digits ()
print(digits.keys())
data = digits["data"]
images = digits["images"]
target = digits ["target"]
target_names = digits["target_names"]
shuffle_indices = np.random.permutation(np.arange(len(target)))
data = data[shuffle_indices]
target =target[shuffle_indices]
print(data.shape)
print(target.shape)
fig,ax = plt.subplots(2,5)
ax = ax.flatten()
for i in range(10):
 ax[i].imshow(data[i].reshape(8, 8))
```
    dict_keys(['data', 'target', 'frame', 'feature_names', 'target_names', 'images', 'DESCR'])
    (1797, 64)
    (1797,)

![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/1/output_0_1.png)

```python
num_1, num_2 = 6, 8
mask = np.logical_or(target == num_1, target == num_2)
target = target[mask].reshape(-1,1)
data = data[mask]
data = np.column_stack((data, np.ones(data.shape[0])))
target[target == num_1] = 1
target[target == num_2] = -1
```
###  Classification with sklearn
```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
C =[0.0001,0.001,0.01,0.1,1,10,100,1000,10000]
acc=[]
for step,i in enumerate(C):
    LR_model = LogisticRegression(C=i, penalty='l2',max_iter=250,solver='liblinear')
    acc_per = cross_val_score(LR_model, data, target.reshape(-1),cv=10)
    acc.append(np.mean(acc_per))
    print(f'C={i},acc={acc[step]}')
accmaxindex=np.argsort(acc)
Lambda=C[accmaxindex[-1]]
print(f'The best C: {Lambda}, Accuracy: {acc[accmaxindex[-1]]}')
```
    C=0.0001,acc=0.9915079365079364
    C=0.001,acc=0.9943650793650793
    C=0.01,acc=0.9942857142857143
    C=0.1,acc=0.9971428571428571
    C=1,acc=0.9971428571428571
    C=10,acc=0.9971428571428571
    C=100,acc=0.9971428571428571
    C=1000,acc=0.9971428571428571
    C=10000,acc=0.9971428571428571
    The best C: 10000, Accuracy: 0.9971428571428571
### Optimization Methods
implement some basic functions:
#### sigmoid(z)
Applies the sigmoid function to every element of the array z with $\sigma(z)=\frac{1}{1+e^{-z}}$
```python
def sigmoid(z,epoch=None):
    if z[0]>=0:
        return 1/(1+np.exp(-z))
    else:
        return np.exp(z)/(1+np.exp(z))
```
#### gradient(beta, X, y)
Returns the gradient of the loss function $∇\beta\mathcal{L}(\beta)$ for the given arguments, where X and y are arbitrary subsets of the training data. That is, they contain a single random instance for stochastic gradient descent, B random instances for mini-batch gradient descent, and the full training set for standard gradient descent.
``` python
def gradient(beta, X, y,Lambda):
    N= y.shape[0]
    a=sigmoid(-y*(X@beta))*(-y)
    return (X.T@a) / N + beta/Lambda
```
#### predict(beta, X)
returns a vector with one class label $y_i$ for each row $X_i$ in $X$
``` python
def predict(X,beta):
    y_pred = X.T@beta.T
    y_pred[y_pred > 0] = 1
    y_pred[y_pred <= 0] = -1
    return y_pred
```
#### zero_one_loss(y_prediction, y_truth)
counts the fraction of wrongly classified samples.
```python
def zero_one_loss(y_pred, y):
    count=0
    y_pred=y_pred.reshape((-1,1))
    y=y.reshape((-1,1))
    for i in range(y_pred.shape[0]):
    if y_pred[i]!=y[i]:
    count+=1
    return count/y_pred.shape[0]
```
#### Record loss
```python
RECORD_LOSS = False
TRAIN_LOSS = {}
TEST_LOSS = {}
PRINT = False

def record_loss(method_name, beta, data_train, target_train, data_test, target_test):
    if method_name not in TRAIN_LOSS:
    TRAIN_LOSS[method_name] = []
    TEST_LOSS[method_name] = []
        if RECORD_LOSS:
            if PRINT:
                print("train loss = ", zero_one_loss(predict(beta, data_train), target_train),
                      "test loss = ", zero_one_loss(predict(beta, data_test), target_test))
            TRAIN_LOSS[method_name].append(zero_one_loss(predict(beta, data_train), target_train))
            TEST_LOSS[method_name].append(zero_one_loss(predict(beta, data_test), target_test))
```
###  Optimization Methods
$τ_t$ is the learning rate in iteration t. l(t) denotes the corresponding loss gradient, as returned from gradient(beta, X, y) with suitable arguments.
#### gradient descent
$\beta^{(t+1)}=\beta^{(t)}-\tau_t l^{(t)}$
(compute the gradient from the full training set)
``` python
def gradient_descent(beta,X,y,tau,Lambda):
    for epoch in range(10):
        beta-=(tau*gradient(beta,X,y,Lambda))
        record_loss("gradient_decent", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### SG (stochastic gradient)
$\quad \beta^{(t+1)}=\beta^{(t)}-\tau_t l^{(t)}$
(compute the gradient from a single random instance for every $t$ )
``` python
def stochastic_gradient_descent(beta, X, y, tau0, gamma,Lambda):
    for epoch in range(150):
        index = np.random.choice(y.shape[0],size=1,replace=False)
        tau = tau0 / (1 + gamma * epoch)
        beta -= tau * gradient(beta, X[index], y[index],Lambda)
        record_loss("stochastic_gradient_descent", beta, data_train, target_train, data_test, target
    return beta
```
#### SG minibatch
$\beta^{(t+1)}=\beta^{(t)}-\tau_t l^{(t)}$
(compute the gradient from a random mini-batch of size $B$ for every $t$ )
``` python
def sg_minibatch(beta, X, y, tau0, gamma,Lambda):
    for epoch in range(150):
        B = np.random.choice(y.shape[0], size=31, replace=False)
        tau = tau0 / (1 + gamma * epoch)
        beta -= tau * gradient(beta,X[B],y[B],Lambda)
        record_loss("sg_minibatch", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### SG momentum
$$
\begin{aligned}
& g^{(t+1)}=\mu g^{(t)}+(1-\mu) l^{(t)} \\
& \beta^{(t+1)}=\beta^{(t)}-\tau_t g^{(t+1)}
\end{aligned}
$$
(compute the gradient from a single random instance for every $t$ )
``` python
def sg_momentum(beta, X, y, tau0, mu, gamma,Lambda):
    zero = np.zeros(beta.shape)
    for epoch in range(150):
        index = np.random.choice(y.shape[0], size=1, replace=False)
        tau = tau0 / (1 + gamma * epoch)
        zero = mu * zero + (1 - mu) * gradient(beta, X[index], y[index],Lambda)
        beta -= tau * zero
        record_loss("sg_momentum", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### ADAM
$$
\\begin{aligned}& g^{(t+1)}=\\mu_1 g^{(t)}+\\left(1-\\mu_1\\right) l^{(t)} \\quad \\quad \\mu_1 \\approx 0.9 \\\\& q^{(t+1)}=\\mu_2 q^{(t)}+\\left(1-\\mu_2\\right)\\left(l^{(t)}\\right)^2 \\quad \\mu_2 \\approx 0.999 \\\\& \\tilde{g}^{(t+1)}=\\frac{g^{(t+1)}}{1-\\mu_1^{t+1}} \\quad \\tilde{q}^{(t+1)}=\\frac{q^{(t+1)}}{1-\\mu_2^{t+1}} \\quad \\text { (bias correction) } \\\\& \\beta^{(t+1)}=\\beta^{(t)}-\\frac{\\tau}{\\sqrt{\\tilde{q}^{(t+1)}}+\\epsilon} \\tilde{g}^{(t+1)} \\quad \\tau \\approx 10^{-4}, \\epsilon \\approx 10^{-8} \\\\&\\end{aligned}
$$
(compute the gradient from a single random instance for every $t$ )
``` python
def ADAM(beta, X, y,mu1, mu2, eps,tau0=0.0001):
    g = np.zeros(beta.shape)
    q = np.zeros(beta.shape)
    for epoch in range(150):
        index = np.random.choice(y.shape[0], size=1, replace=False)
        l = gradient(beta, X[index], y[index],Lambda)
        g = mu1 * g + (1 - mu1) * l
        q = mu2 * q + (1 - mu2) * (l ** 2)
        g_correction = g*(1/ (1 - mu1 ** (epoch+ 1)))
        q_correction = q*(1/ (1 - mu2 ** (epoch+ 1)))
        beta=np.add(beta, (-tau0) / (q_correction ** 0.5 + eps) * g_correction, out=beta, casting="unsafe")
        record_loss("ADAM", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### Stochastic average gradient
\\begin{array}{ll}\\text {} & \\text { initialization: } \\\\& \\forall i: g_i^{\\text {(stored })}=-y_i X_i^T \\cdot \\sigma\\left(-y_i X_i \\beta^{(0)}\\right) \\\\& g^{(0)}=\\frac{1}{N} \\sum_i g_i^{\\text {(stored) }} \\\\& \\text { iteration (choose a random instance } i \\text { for every } t) \\text { : } \\\\& g_i^{(t)}=-y_i X_i^T \\cdot \\sigma\\left(-y_i X_i \\beta^{(t)}\\right) \\quad(\\text { update gradient of instance } i) \\\\& g^{(t+1)}=g^{(t)}+\\frac{1}{N}\\left(g_i^{(t)}-g_i^{(\\text {stored })}\\right) \\\\& g_i^{(\\text {stored })}=g_i^{(t)} \\\\& \\beta^{(t+1)}=\\beta^{(t)}\\left(1-\\frac{\\tau_t}{\\lambda}\\right)-\\tau_t g^{(t+1)}\\end{array}
``` python
def stochastic_average_gradient(beta, X, y, tau0, gamma,Lambda):
    epoch=1
    gi_stored = (-y * X) * sigmoid(-y * (X@beta), epoch)
    g = np.mean(gi_stored, axis=0, keepdims=True)
    for epoch in range(150):
        tau = tau0 / (1 + gamma * epoch)
        i = np.random.choice(y.shape[0], size=1, replace=False)
        gi = -y[i] * X[i] * sigmoid(-y[i] * (X[i]@beta), epoch)
        g += (gi - gi_stored[i, :]) / y.shape[0]
        gi_stored[i, :] = gi
        beta = beta * (1 - tau / Lambda) - tau * g.T
        record_loss("stochastic_average_gradient", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### Dual coordinate ascent
\\begin{equation}\\begin{aligned}& \\text { initialization: } \\\\& \\alpha^{(0)}=\\operatorname{random}(0,1) \\\\& \\beta^{(0)}=\\frac{\\lambda}{N} \\sum_i \\alpha_i^{(0)} y_i X_i^T \\\\& \\text { iteration (choose a random instance } i \\text { for every } t \\text { ): } \\\\& f^{\\prime}=y_i X_i \\beta^{(t)}+\\log \\frac{\\alpha_i^{(t)}}{1-\\alpha_i^{(t)}}, \\quad f^{\\prime \\prime}=\\frac{\\lambda}{N} X_i X_i^T+\\frac{1}{\\alpha_i^{(t)}\\left(1-\\alpha_i^{(t)}\\right)} \\\\& \\alpha_i^{(t+1)}=\\underbrace{\\alpha_i^{(t)}-\\frac{f^{\\prime}}{f^{\\prime \\prime}}}_{\\text {clip to }[\\epsilon, 1-\\epsilon]} \\quad \\text { (update } \\alpha_i \\text { such that } 0<\\alpha_i<1) \\\\& \\beta^{(t+1)}=\\beta^{(t)}+\\frac{\\lambda}{N} y_i X_i^T\\left(\\alpha_i^{(t+1)}-\\alpha_i^{(t)}\\right) \\\\&\\end{aligned}\\end{equation}
``` python 
def dual_coordinate_ascent(X, y, Lambda,eps=1e-8):
    N = y.shape[0]
    alpha = np.random.uniform(0, 1, y.shape)
    beta = Lambda / N * (X.T@(y*alpha))
    for epoch in range(150):
        i = np.random.choice(y.shape[0], size=1, replace=False)
        f1 = y[i] *(X[i]@beta)+ np.log(alpha[i] / (1 - alpha[i]))
        f2 = Lambda / N *(X[i]@X[i].T)+ 1 / ((alpha[i]) * (1 - alpha[i]))
        alpha_old = alpha[i]
        alpha[i] = np.clip(alpha[i] - f1 / f2, eps, 1 - eps)
        beta += (alpha[i] - alpha_old) * y[i] * X[i].T * Lambda / N
        record_loss("dual_coordinate_ascent", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### Newton/Raphson

\\begin{aligned}& \\beta^{(t+1)}=\\beta^{(t)}+\\frac{\\lambda}{N} y_i X_i^T\\left(\\alpha_i^{(t+1)}-\\alpha_i^{(t)}\\right) \\\\& z^{(t)}=X \\beta^{(t)} \\text { (scores } \\quad \\tilde{y}^{(t)}=\\frac{y}{\\sigma\\left(y z^{(t)}\\right)}(\\text { weighted labels) } \\\\& W_{i i}^{(t)}=\\frac{\\lambda}{N} \\sigma\\left(z_i^{(t)}\\right) \\sigma\\left(-z_i^{(t)}\\right) \\quad\\left(W^{(t)} \\text { is a } N \\times N\\right. \\text { diagonal matrix of weights) } \\\\& \\beta^{(t+1)}=\\left(I+X^T W^{(t)} X\\right)^{-1} X^T W^{(t)}\\left(z^{(t)}+\\tilde{y}^{(t)}\\right)\\end{aligned}
``` python
def Newton_Raphson(beta, X, y,Lambda):
    for epoch in range(10):
        z = np.dot(X, beta)
        y_correction = y / sigmoid(y * z)
        W = np.diag(((sigmoid(z) * sigmoid(-z)) * Lambda / X.shape[0]).reshape(-1, ))
        beta = (np.linalg.inv(np.eye(X.shape[1]) + X.T@W@X))@X.T@W@(z + y_correction)
        record_loss("Newton_Raphson", beta, data_train, target_train, data_test, target_test)
    return beta
```
#### The scaling
$$
\tau_t=\frac{\tau_0}{1+\gamma t}
$$
###  Comparison
split the data
``` python
from sklearn.model_selection import train_test_split
data_train,data_test,target_train,target_test=train_test_split(data,target,test_size=0.3)
```
use KFold
``` python
from sklearn.model_selection import KFold
a=0
best = 200
best_tau, best_mu, best_gamma = 0, 0, 0

'''gradient_descent'''
for tau in [0.001, 0.01, 0.1]:
    beta = np.zeros((data.shape[1], 1))
    current = 0
    
    kf = KFold(n_splits=10)
    kf=kf.split(data_train)
    
    for train_index, test_index in kf:
        X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
        y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
        beta =gradient_descent(beta, X_cvtrain, y_cvtrain, tau,Lambda)
        current += zero_one_loss(predict(beta, X_valid), y_valid)
   
    if current < best:
        best = current
        best_tau = tau

'''stochastic_gradient_descent'''
for tau in [0.001, 0.01, 0.1]:
    for gamma in [0.0001, 0.001, 0.01]:
        beta = np.zeros((data.shape[1], 1))
        current = 0
        kf = KFold(n_splits=10)
        kf=kf.split(data_train)
        for train_index, test_index in kf:
            X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
            y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
            beta =stochastic_gradient_descent(beta, X_cvtrain, y_cvtrain, tau,gamma,Lambda)
            current += zero_one_loss(predict(beta, X_valid), y_valid)
        if current < best:
            best = current
            best_tau = tau
            best_gamma = gamma

'''sg_minibatch'''
for tau in [0.001, 0.01, 0.1]:
    for mu in [0.1, 0.2, 0.5]:
        for gamma in [0.0001, 0.001, 0.01]:
            beta = np.zeros((data.shape[1], 1))
            current = 0
            kf = KFold(n_splits=10)
            kf=kf.split(data_train)
            for train_index, test_index in kf:
                X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
                y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
                beta =sg_minibatch(beta, X_cvtrain, y_cvtrain, tau,gamma,Lambda)
                current += zero_one_loss(predict(beta, X_valid), y_valid)
            if current < best:
                best = current
                best_tau = tau
                best_gamma = gamma

'''sg_momentum'''
for tau in [0.001, 0.01, 0.1]:
    for mu in [0.1, 0.2, 0.5]:
        for gamma in [0.0001, 0.001, 0.01]:
            beta = np.zeros((data.shape[1], 1))
            current = 0
            kf = KFold(n_splits=10)
            kf=kf.split(data_train)
            for train_index, test_index in kf:
                X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
                y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
                beta =sg_momentum(beta, X_cvtrain, y_cvtrain,tau,mu,gamma,Lambda)
                current += zero_one_loss(predict(beta, X_valid), y_valid)
            if current < best:
                best = current
                best_tau = tau
                best_mu = mu
                best_gamma = gamma

'''ADAM'''
tau0=0.0001
mu1=0.9
mu2=0.999
eps=1e-8
for mu in [0.1, 0.2, 0.5]:
    for gamma in [0.0001, 0.001, 0.01]:
        beta = np.zeros((data.shape[1], 1))
        current = 0
        kf = KFold(n_splits=10)
        kf=kf.split(data_train)
        for train_index, test_index in kf:
            X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
            y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
            beta =ADAM(beta, X_cvtrain,y_cvtrain,Lambda,mu1,mu2,eps)
            current += zero_one_loss(predict(beta, X_valid), y_valid)
        if current < best:
            best = current
            best_mu = mu
            best_gamma = gamma

'''stochastic_average_gradient'''
for tau in [0.001, 0.01, 0.1]:
    for gamma in [0.0001, 0.001, 0.01]:
        beta = np.zeros((data.shape[1], 1))
        current = 0
        kf = KFold(n_splits=10)
        kf=kf.split(data_train)
        for train_index, test_index in kf:
            X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
            y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
            beta =stochastic_average_gradient(beta, X_cvtrain, y_cvtrain, tau,gamma,Lambda)
            current += zero_one_loss(predict(beta, X_valid), y_valid)
        if current < best:
            best = current
            best_tau = tau
            best_gamma = gamma


'''dual_coordinate_ascent'''
current = 0
kf = KFold(n_splits=10)
kf=kf.split(data_train)
for train_index, test_index in kf:
    X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
    y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
    beta =dual_coordinate_ascent(X_cvtrain, y_cvtrain,Lambda)
    current += zero_one_loss(predict(beta, X_valid), y_valid)
if current < best:
    best = current


'''Newton_Raphson'''
beta = np.zeros((data.shape[1], 1))
current = 0
kf = KFold(n_splits=10)
kf=kf.split(data_train)
for train_index, test_index in kf:
    X_cvtrain, X_valid = data_train[train_index], data_train[test_index]
    y_cvtrain, y_valid = target_train[train_index], target_train[test_index]
    beta =Newton_Raphson(beta, X_cvtrain, y_cvtrain,Lambda)
    current += zero_one_loss(predict(beta, X_valid), y_valid)
if current < best:
    best = current

```
### Speed
``` python
TRAIN_LOSS.clear()
TEST_LOSS.clear()
RECORD_LOSS = True
PRINT = False
Lambda = 1
# print("data_train shape = ", data_train.shape, "target_train shape = ", target_train.shape)
beta = np.zeros((data.shape[1],1))
gradient_descent(beta, data_train, target_train, 0.01,Lambda)
beta = np.zeros((data.shape[1],1))
stochastic_gradient_descent(beta, data_train, target_train, 0.001, 0.01,Lambda)
beta = np.zeros((data.shape[1],1))
sg_minibatch(beta, data_train, target_train, 0.001, 0.0001,Lambda)
beta = np.zeros((data.shape[1],1))
sg_momentum(beta, data_train, target_train, 0.001, 0, 0.0001,Lambda)
beta = np.zeros((data.shape[1],1))
ADAM(beta, data_train, target_train,0.9, 0.999, 1e-08,tau0=0.0001)
beta = np.zeros((data.shape[1],1))
stochastic_average_gradient(beta, data_train, target_train, 0.001, 0.0001,Lambda)
beta = np.zeros((data.shape[1],1))
dual_coordinate_ascent(data_train, target_train, Lambda,1e-8)
beta = np.zeros((data.shape[1],1))
Newton_Raphson(beta, data_train, target_train,Lambda)

fig,ax = plt.subplots(8,1, figsize=(18, 30))
for i, key in enumerate(TRAIN_LOSS.keys()):
    ax[i].plot(TRAIN_LOSS[key], linestyle='--', label=key + "_train")
    ax[i].plot(TEST_LOSS[key], linestyle=':', label=key + "_test")
    ax[i].legend()
    ax[i].set_title("Train and Test Loss for " + key)
    ax[i].set_xlabel("T")
    ax[i].set_ylabel("Error")
    
fig.tight_layout()
plt.show()
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/1/output_14_0.png)