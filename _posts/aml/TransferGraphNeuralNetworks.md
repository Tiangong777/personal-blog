---
title: AML project-Transfer Graph Neural Networks
category: Machine learining
katex: true
published: false
hide: true
---
### Abstract
Corona virus pandemic, which is first outbreak in late 2019, has caused huge economic losses and cost many lives all over the world. It is clear that human mobility is a main reason to its spread and asynchronous outbreaks across countries. In this paper our main work is to explore the impact of population movement on the spread of COVID-19. We mainly utilize confirmed cases reports and population mobility data from 4 European countries to train and test our proposed methods. In order to learn potential connection between population movement and the growth of infection rate in different regions, we build a sub-GNN model which is MPNN and combine it with LSTM model to predict new cases in the future. Then we use transfer learning to generalize the model in the data of different countries and regions, and get more accurate prediction results. In the experiment, we also applied several baseline methods for comparative analysis, and found that the transfer learning sub-GNN can still maintain high accuracy in medium and long-term prediction. Through our results we will be able to forecast the trend of the spread of COVID-19 in different countries. Therefore we provide useful data for decision maker to decide whether to open or close border travel restrictions and other anti-epidemic policies to prevent a real outbreak of epidemics among people.
### Introduction
Corona virus pandemic, also, Covid-19, first outbreak in late 2019. Almost no one could imagine the Covid-19 pandemic would continue to strike all over the world till today for almost 2 years. Due to it is highly infectious, it now has spread to all over the world, and has infected at least 226 millions people and caused over 4.6 millions deaths. Many governments of different countries underestimated how highly infectious it is and its severity despite some governments took strict lockdown policies at early stage. Till now although the vaccination rate grows fast, it still has caused a severe impact on global economy and taken many lives, therefore accurate predictions of new cases becomes more and more important in the next days to help governments take countermeasures towards Covid-19 pandemic on balancing the medical resources and the economic progress.

The main ways of virus spread is by human direct or indirect contacts, owing to one fact that people's mobility, all of us are moving from a location to another in most of time. Therefore, doing the research on tracing people's mobility might make sense. Facebook have the records of users' location at different times and we assume that these data could be meaningful and representative. This project is based on this hypothesis, to study and predict the new cases of COVID-19.

Our main works are summarized as follows:

- We study researches on epidemic, especially on COVID-19.
- We take Transfer Graph Neural Networks for Pandemic Forecasting as reference, build a model for learning the spreading of COVID-19 in a country via the country's graph based on MPNN.
- We add LSTM model to MPNN, to solve the dependency problem of long time-series data.
- We transfer a disease spreading model based on MAML from countries where the outbreak has been stabilized, to another country where the COVID spreading is still at its early stage.
- We evaluate baseline methods and the transfer learning MPNN method by comparing predictions with ground truth. Combined with the complex situation of COVID-19 epidemic spreading in the real world, we analyze the performance, pros and cons of each method.
### Related Work
A lot of researches show that many reasons can accelerate the spread of Covid-19 virus. Sometimes weather and season can fluctuate the spreading rate of Covid-19 and the peak of infections usually emerges during winter times. Fresh and frozen food can also contain Corona virus and then become the source to infect people. In addition, human mobility is the highly agreed reason that make the Corona virus spread all over the world. The more individuals move out from one area to others or move inside an area, the higher the likelihood that individuals in the destination district are threatened by the infection. This is a notable perception.

With the booming of machine learning and AI in data science in recent years, more and more researchers focus on studying the spread of epidemics through artificial intelligence techniques. A new survey shows that artificial intelligence and big data can help people to control the Covid-19 spread situation and inspires further studies to prevent scattered outbreaks of Covid-19. They build a SEIR model derived from the principles of infectious epidemics and data science. They use Bayesian optimization method to train the parameters. By evaluating the data form Bern, Switzerland under their SEIR model, they get results of the infectious rate related social activities. They also proposed a Bayesian method but use fewer data. They collect the deaths data from 11 European countries to evaluate the time-varying reproduction number. Their results illustrate that human interventions have significant influence on the spread of disease, policies like lockdowns can reduce the infectious rate.

Most studies tend to utilize the time-series based models to make predictions about Covid-19 pandemic situations. Such studies like LSTM applied to predict new cases of pandemic are now widely used in the research. Long Short Term Memory networks – usually just called “LSTMs” – are a special kind of RNN(Recurrent Neural Network) model, capable of learning long-term dependencies. They were introduced in 1997, and were refined and popularized by many people in following work. They work tremendously well on a large variety of problems, and are now widely used in pandemic analysis.

Besides, researchers also make use of ARIMA(Auto Regressive Integrated Moving Average) model to analyze and predict pandemic. The ARIMA model was developed in the 1970s as an attempt to describe changes on the time series using a mathematical approach.

There is also a widely used time series data forecasting third-party library Prophet. Prophet is open source software contributed by Facebook Data Science team.

The time-series GNN are now recognized as an effective method on analyzing the epidemics trends. They first creatively apply neural networks on graph structure data and form an abstract GNN model. In recent studies GNN models demonstrates superior performance in many classical graph based tasks. Graphs are the most naturally mathematical representations for a wide range of real-world data in many aspects such as biology, finance, traffic, internet, chemistry, computer science. Many classical NP-hard problems are represented by graphs like shortest path problem, travel salesperson problem, min-cost problem, graph matching problem. Utilizing the GNN model can make many complex problems trained by classical neural network layers. The GNN model is based on the information propagation mechanism. Each node updates its own node state by exchanging information with each other until it reaches a stable value. The output of GNN is to calculate the output at each node according to the current node state.

Graph Convolutional Networks (GCNs) are an efficient variant of Convolutional Neural Networks (CNNs) and the most important networks of GNN. Recently, GCNs have achieved significant results in various application areas, including social networks, applied chemistry, natural language processing and computer vision. Recently, since GNNs are widely used in analyzing and predicting COVID, GCN become a relatively new technique in detection of COVID.

Transfer learning aims at transferring the shared knowledge from one task to other related tasks. Usually, the accomplishment of transfer learning is based on certain assumptions. For example, they assume that related tasks should share some (hyper-)parameters. By discovering the shared (hyper-) parameters, the knowledge can be transferred across tasks. If these assumptions fail to be satisfied, however, the transfer may be unsuccessful.

Model-Agnostic Meta-Learning(MAML) is a class of meta-learning algorithms. They propose a Model-Agnostic (model-independent) method, which now is already a very important model in academia, and can be compatible with any model that uses gradient descent algorithms and can be applied to a variety of tasks, including classification, regression, and even reinforcement learning. Since COVID-19, because of lack of data, MAML appears to be a good method to analyze new areas' COVID situation based on transferring knowledge from the areas that have already been analyzed.
### Methodology
#### Graph Neural Network
A graph neural network (GNN) is a class of neural networks for processing data represented by graph data structures.
The graph refer to graphs in graph theory. It is a graph consisting of two component, vertices(or nodes) and edges. A graph $G$ can be well described by the set of vertices $V$ and edged $E$ it contains.
The edges of a graph can be either undirected or directed, depending on whether there exist directional dependencies between vertices.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure1.png)

The earliest graph neural network originated from Franco's paper \upcite{14}, and its theoretical basis is Banach's Fixed Point Theorem. A typical application of GNN is node classification. In the node classification problem setup, given a graph $G$, each node $v$ has its own feature $x_v$ and a true label $t_v$. The main learning goal of GNN is to represent each node with a vector $h_v$, which is called embedding hidden state and contains the information of its neighborhood. In specific, GNN is realized by iteratively updating the hidden state of all nodes. At time $t + 1$, the hidden state of node $v$ is updated as follows:

\begin{align}
h_v^{t+1} = f(x_v, x_{co[v]}, h^t_{ne[v]}, x_{ne[v]})
\end{align}

where $x_{co[v]}$ represents the features of the edges connecting with node $v$, $h^t_{ne[v]}$ denotes the embedding hidden state of the neighboring nodes of node $v$ at time $t$, and $x_{ne[v]}$ denotes the features of the neighboring nodes of node $v$. The function $f$ is the transition function that projects these inputs onto a vector space and function $f$ is valid for all nodes. Then, applying Banach Fixed Point Theorem, we could get a unique solution for $h_v$ and rewrite the above equation as a global update function which updates state of all nodes:

\begin{align}
H^{t+1} = F(H^t, X)
\end{align}

where $H$ and $X$ denote the concatenation of all $h$ and $x$, and such update can be referred to as \textit{message passing} or \textit{neighborhood aggregation}.

Then the output of the GNN is computed by passing the state $h_v$ as well as the node feature $x_v$ to an output function $g$.

\begin{align}
o_v = g(h_v, x_v)
\end{align}

Both functions $f$ and $g$ can be represented by feed-forward fully-connected Neural Networks. Finally, assuming that there are a total of $p$ supervision nodes, the model loss can be formalized as

\begin{align}
loss = \sum_{i=1}^p (t_i - o_i)
\end{align}

which can be optimized via gradient descent.
#### Graph Convolutional Network
Graph Convolutional Network (GCN) is the most important GNN and the most commonly used architecture in real-life applications. GCN generalize the operation of \texttit{convolution} from grid data to graph data. Instead of having a 2-D array as input, GCN takes a graph as an input.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure2.png)
The main idea of GCN is to generate a node $v$'s representation by aggregating its own features $x_v$ and neighbors' features $x_u$. Any graph convolutional layer can be written as a nonlinear function, general formula of graph convolution is

\begin{align}
H^{l+1} = f(H^l, A)
\end{align}

where $H^0 = X$ is the input of the first layer, $X\in R^{N*D}$, $N$ is the number of nodes of a graph, $D$ is the dimension of the feature vector of each node, $A$ is the adjacency matrix, and different choices of $f$ result in different variants of models. But there are two problems with this method, one is not considering the influence of the node itself on itself; the other is the adjacency matrix $A$ is not normalized, which may cause problems when extracting graph features. For example, nodes with many neighbor nodes tend to have greater influence. Therefore we often have the following formula of propagation rule in graph convolutional layer:

\begin{align}
H^{l+1} = \sigma(\tilde{D}^{-\frac{1}{2}} \tilde{A} \tilde{D}^{-\frac{1}{2}} H^l W^l)
\end{align}

where $\tilde{A} = A + I_N$, $\tilde{D}$ is degree matrix of $\tilde{A}$, $\tilde{D}_{ii} = \sum_{j} \tilde{A}_{ij}$, and $\tilde{D}^{-\frac{1}{2}} \tilde{A} \tilde{D}^{-\frac{1}{2}}$ is actually adjacency matrix $A$ after normalization. $W^l$ is the matrix of trainable parameters of layer $l$, anf $\sigma$ is non-linear activation function.
#### Message Passing Neural Network
Message Passing Neural Network(MPNN) is a powerful framework for GNN and is considered one of the most generic GNN architectures. Before the model was standardized into a single MPNN framework, different variants had been published by several independent researchers. Gilmer, J et al.\upcite{27} abstracts the commonalities of existing models and proposes them into the MPNN framework. This type of architecture was especially popular in chemistry to help predict the properties of molecules.

The input to a MPNN is an undirected graph $G$ with node features $x_v$ and edge features $e_{vw}$. MPNN operates in two phases. First is a \texttit{message passing} phase, which propagates information across the graph in order to build a neural representation of the whole graph.

\begin{gather}
m_v^{t+1} = \sum_{w \in N(v)} M_t (h_v^t, h_w^t, e_{vw})
\end{gather}

which is a sum of all messages $M_t$ obtained from the neighbours. $M_t$ is an arbitrary function that depends on hidden states $h_v^t, h_w^t$ and edges $e_{vw}$ of the neighbouring nodes $v,w$, and function $M_t$ is actually the transition function $f$ in GNN.

Then we update the hidden state of the node $v_t$:

\begin{gather}
h_v^{t+1} = U_t (h_v^t, m_v^{t+1})
\end{gather}

where function $U_t$ is actually the output function $g$ in GNN. Simply speaking, the hidden state of the node $v_t$ is obtained by updating the old hidden state with the newly obtained message. And we repeat this \textit{message passing} algorithm for a specified number of times. After that, we could either perform node-level predictions, or reach the second phase of MPNN, which is called \textit{readout} phase, where we could use a \textit{readout} function $R$ with learnable parameters to perform graph-level predictions, and the second phase of MPNN is the main difference from GNN.

\begin{gather}
\hat{y} = R(\{h_v^T|v \in G\})
\end{gather}

In this phase, we extract all newly update hidden states and create a final feature vector describing the whole graph.

In our work of \textbf{MPNN}, we use the following \textit{message passing} or \textit{neighborhood aggregation} scheme:

\begin{align}
H^{i+1} = f(\tilde{A} H^i W^{i+1})
\end{align}

where $H^0 = X$ is the input of the first layer, $X\in R^{N*D}$, $N$ is the number of nodes of a graph, $D$ is the dimension of the feature vector of each node, $W^i$ is the matrix of trainable parameters of layer i, and function $f$ is a non-linear activation function, in our case is ReLU. To consider the two main problems of GCN which is talked about in last section, we following  Kipf and Welling\upcite{18}, we normalize the adjacency matrix $A$ such that the sum of the weights of the incoming edges of each node is equala to 1, and use matrix $\tilde{A}$ instead of matrix $A$.

We represent each country as a graph $G$, and the above model 3.3.4 is applied to all graphs $G^{(1)},...,G^{(T)}$. Given a model with $K$ neighborhood aggregation layers, the matrix $\tilde{A}$ and $H^0,...,H^K$ are specific to a single graph, while the weight matrices $W^1,...W^K$ are shared across all graphs. We concatenate the matrices $H^0,...,H^K$ horizontally, we utilize skip connections from each layer to the output layer which consists of a sequence of fully-connected layers. Finally, we choose the mean squared error as loss function:

\begin{align}
\mathcal{L} = \frac{1}{nT} \sum_{t=1}^{T} \sum_{v \in V} (y_v^{(t+1)} - \hat{y}_v^{(t+1)})^2
\end{align}

where $y_v^{(t+1)}$ denotes the reported number of cases for region $v$ at day $t+1$ and $\hat{y}_v^{(t+1)}$ denotes the predicted number of cases.
#### Long Short-Term Memory
Long short-term memory (LSTM) is an artificial recurrent neural network (RNN) architecture\upcite{28}.

Recurrent neural networks (RNN) are a class of neural networks that are helpful in modeling sequence data. Derived from feed-forward networks, RNNs exhibit similar behavior to how human brains function. But unlike standard feed-forward neural networks, LSTM or RNN has feedback connections.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure3.png)
In a feed-forward neural network, the information only moves in one direction, from the input layer, through the hidden layers, to the output layer. Feed-forward neural networks have no memory of the input they received, and it only considers the current input. It can’t remember anything about what happened in the past except its training. But in a RNN the information cycles through a loop. When it makes a decision, it considers the current input and also what it has learned from the inputs it received previously.

But there are two major problems of RNN, exploding gradients or vanishing gradients which are caused by long-term dependency problem of inputs. Therefore, Long short-term memory (LSTM) is explicitly designed to avoid the long-term dependency problem. Long Short-Term Memory (LSTM) networks are an extension of RNN that extend the memory. The units of a LSTM are used as building units for the layers of a RNN, often called a LSTM network.

LSTM enables RNN to remember inputs over a long period of time because LSTM contains information in a memory. This memory can be seen as a gated cell, which means the cell decides whether or not to store or delete information during training, based on the importance it assigns to the information. The assigning of importance happens through weights, which are learned by the training. In a LSTM there are three gates: input, forget and output gate. These gates determine whether or not to let new input in (input gate), delete the information that is unimportant (forget gate), or let it impact the output at the current timestep (output gate). The gates in an LSTM contain sigmoid activations, which squish values between 0 and 1. The sigmoid activations are to update or forget data by multiplying by 1 or 0, causing values to be "kept" or be “forgotten”. Then the problematic issues of exploding gradients and vanishing gradients are solved through LSTM because it keeps the gradients steep enough, which keeps the training relatively short and the accuracy high.

\textbf{MPNN+LSTM} \hspace{5mm}In our work, given a sequence of graphs  $G^{(1)},...,G^{(T)}$, we could obtain a sequence of representations $H^{(1)},...,H^{(T)}$, then we could combine our MPNN with LSTM by feeding these representations into LSTM so that we could capture the long range dependencies in these graphs. We use a stack of two LSTM layers. The new representations of the regions correspond to the hidden state of the last time step of the second LSTM layer. These representations are then passed on to an output layer. The framework of MPNN+LSTM archtecture sees below figure.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure5.png)
#### Transfer Learning Based on MAML
Transfer learning (TL) is a research problem in machine learning that focuses on storing knowledge gained while solving one problem and applying it to a different but related problem\upcite{29}. Two common transfer learning approaches are Develop Model Approach and Pre-trained Model Approach. The difference between these two methods is that Develop Model Approach needs to train a model from a related predictive modeling problem with an abundance of data, but Pre-trained Model Approach is that a pre-trained model needs to be chosen from the pool of candidate models. After having the appropriate model, transfer learning then reuse the model and tune the model to fit and achieve the new task.

Model-Agnostic Meta-Learning(MAML)\upcite{23}, is a model and task-agnostic algorithm for meta-learning that trains a model’s parameters such that a small number of gradient updates will lead to fast learning on a new task. Meta-learning, also known as “learning to learn”, intends to design models that can learn new skills or adapt to new environments rapidly with a few training examples. Model-agnostic means that MAML is a more like a framework that provides a meta-learner for training base-learner.

In general machine learning problems, we train model parameters in the data set $D_{train}$, and test the model performance in $D_{test}$. In MAML problem setting, we deal with Meta-sets $\delta$. For each data set $D \in \delta$, $D$ is divided into $D_{train}$ and $D_{test}$, just like general machine learning problems. At the same time, Meta-sets $\delta$ is divided into multiple Meta-sets $\delta_{meta-train}$, $\delta_{meta-val}$, $\delta_{meta-test}$. Our goal is to train a "learning process" on $\delta_{meta-train}$. The process inputs a $D_{train}$ and outputs a learner(e.g. classifier), which can achieve good fitness on the corresponding $D_{test}$.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure6.jpg)
The goal of MAML is to find parameters $\theta$ that are sensitive to the tasks by changing the direction of the gradient descent , and subtle changes to these parameters can cause great changes in the loss function. Therefore, when there are a small amount of training data, the gradient descent of these parameters can make the loss drop quickly and achieve a good fine-tune effect.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure4.png)
Algorithm of MAML is shown below, the number of outer loop is specified by the hyperparameter \textit{metatrain\_iterations}. For each outer loop, sample the number of \textit{meta\_batch\_size} tasks  from the $\delta_{meta-train}$ as a batch (general machine learning tasks a batch is K samples, here is K tasks). For each inner loop, a $\theta_i^\prime$ is calculated separately for each task and the corresponding \textit{loss} is calculted at the same time.
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/Figure7.png)
\textbf{MPNN+TL} \hspace{5mm}In our work, a model trained in the whole cycle of the epidemic can capture patterns of its different phases, which is missing from a new model working in a country at the start of its infection. Therefore to incorporate past knowledge from models running in other countries, we employ a transfer learning method based on Model-Agnostic Meta-Learning(MAML). In specific, our Meta train set $M_{tr} = D^{(1)}, ..., D^{(P)}$, denotes the data sets of $p$ countries that we could use to obtain a set of parameters $\theta$. Then these learnt parameters can be used to initilize model or the countries left out in the Meta test set $M_{te}$. And for each dataset $D^{(k)}, k \in {1,...p}$(each country) is divided into different training sets of increasing size. For each combination of these two, we train a different model. Then the set of tasks for a country $k$ is
$D^{(k)}={(Tr_{i,j}^{(k)}, Te_{i,j}^{(k)}): 14 \geq i \geq T_{max}, 1 \geq j \geq dt}$

where $(Tr_{i,j}^{(k)}, Te_{i,j}^{(k)})$ is a dataset (including train and test set) associated with country $k$, in which the train set comprises of the first $i$ days of the data and the task is to predict the number of cases in the $j$-th day ahead."

The basic idea of this statement and formulas is that for each country, there is a set of tasks that include different sizes of training sets and corresponding test sets. The training set consists of the first $i$ days of the data, and the task is to predict the number of cases in the $j$-th day ahead.
In the MAML algorithm, $\theta$ is randomly initialized and undergoes gradient descent steps during the MAML training phase. The algorithm of MPNN combined with MAML is shown below.

In each task, we minimize the loss on the task's train set for a specific $\theta_t$, as shown on line 3-5 of the algorithm. Then, we use the emerging $\theta_t$ to compute the gradient with respect to $\theta$ in the task's test set as shown on line 6 of the algorithm. The standard update includes the gradient of $\theta_t$ and $\theta$, which is the hessian matrix, as illustrated below.
![jpg](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/aml/graphnetwork/chapter3/公式.jpg)

We drop the term that contains the hessian, because it was shown to have insignificant contribution in practice. Finally we train $\theta$ on the train set of $M_{te}$ and test on its test set, as shown on lines 7-10 and 11 in the algorithm).
#### ARIMA
ARIMA, short for ‘Auto Regressive Integrated Moving Average’ is actually a class of models that ‘explains’ a given time series based on its own past values, that is, its own lags and the lagged forecast errors, so that equation can be used to forecast future values. In model ARIMA(p, d, q), p denotes the number of lag observations included in the model, also called the lag order. d is the number of times that the raw observations are differenced, also called the degree of differencing, q denotes The size of the moving average window, also called the order of moving average.

To apply ARIMA model for forecasting, we plug in time series data for the variable of interest. First we need to specify the appropriate number of lags or amount of differencing to be applied to the data and check for stationarity. Then we output the results, which are often interpreted similarly to that of a multiple linear regression model.


