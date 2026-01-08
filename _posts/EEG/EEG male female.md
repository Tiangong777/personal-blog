---
title: 识别男女EEG的一个简单CNN
category: EEG
katex: true
published: false
hide: true
---
### 读取并聚类
包括读取，清洗，转换和聚类
#### 读取和聚类
``` python
def read(index):
    return mne.io.read_raw_brainvision('data/EEG Data D'+index+'/PSP_D'+index+'_Int_sub_Segmentation_Cognition_positive.vhdr',misc=['IO_1','IO_2'],preload=True)
def cluster(eeg_female):
    frontal_K=(eeg_female.get_data()[3]+eeg_female.get_data()[4]+eeg_female.get_data()[5]+eeg_female.get_data()[6])/4
    parietal_K=(eeg_female.get_data()[19]+eeg_female.get_data()[20])/2
    temporoparietal_K=(eeg_female.get_data()[12]+eeg_female.get_data()[13]+eeg_female.get_data()[22]+eeg_female.get_data()[23]+eeg_female.get_data()[17]+eeg_female.get_data()[18])/6
    occipital_K=(eeg_female.get_data()[24]+eeg_female.get_data()[25])/2
    temporal_E=(eeg_female.get_data()[12]+eeg_female.get_data()[13])/2
    occipitotemporal_E=(eeg_female.get_data()[22]+eeg_female.get_data()[23])/2
    central_E=(eeg_female.get_data()[14]+eeg_female.get_data()[15])/2
    temporal_left_D=(eeg_female.get_data()[1]+eeg_female.get_data()[12]+eeg_female.get_data()[30])/3
    temporal_right_D=(eeg_female.get_data()[2]+eeg_female.get_data()[13]+eeg_female.get_data()[31])/3
    central_D=(eeg_female.get_data()[16]+eeg_female.get_data()[14]+eeg_female.get_data()[15])/3
    return [frontal_K,parietal_K,temporoparietal_K,occipital_K,temporal_E,occipitotemporal_E,central_E,temporal_left_D,temporal_right_D,central_D]
```
#### 全部读取，在此只看Beta波
``` python
index = []
for i in range(4,10):
    index.append(f'0{i}')
index.append('10')
index.append('11')
for i in range(14,39):
    index.append(f'{i}')
index.remove('21')
index.remove('25')
female_data=[]
male_data=[]
for index in index:
    raw=read(index).filter(13,30)
    eeg_female=(raw.copy().pick_channels(ch_names=raw.ch_names[:int(len(raw.ch_names)/2)])).pick(picks='all',exclude=['IO_1','IO_2'])
    eeg_male = (raw.copy().pick_channels(ch_names=raw.ch_names[int(len(raw.ch_names)/2):])).pick(picks='all',exclude=['IO_1','IO_2'])
    # Beta
    fetem=cluster(eeg_female)
    tem=cluster(eeg_male)
    for i in range(10):
        female_data=[*female_data,*fetem[i].reshape((-1,1024))]
        male_data=[*male_data,*tem[i].reshape((-1,1024))]
del tem
del fetem
```
#### PCA降维
``` python
from sklearn.decomposition import PCA
pca=PCA(n_components=700)
new_female=pca.fit_transform(female_data)
new_male=pca.fit_transform(male_data)
```
#### Padding数据
``` python
def padding(female_data,male_data):
    lenth=0
    for i in range(len(female_data)):
        if len(female_data[i])>=lenth:
            lenth=len(female_data[i])
    print(f'最长为 {lenth}')
    for i in range(len(female_data)):
        length=len(female_data[i])
        if length<lenth:
            female_data[i]=np.append(female_data[i],np.zeros((1,(lenth-length))))
            male_data[i]=np.append(male_data[i],np.zeros((1,(lenth-length))))
    return female_data,male_data
```
### 生成数据
``` python
def create_train(female_data,male_data):
    female=pd.DataFrame(female_data)
    female['Label']=0
    male=pd.DataFrame(male_data)
    male['Label']=1
    train_data=pd.concat([female,male],axis=0,ignore_index=True)
    return train_data
train_data1=create_train(new_female,new_male)
train_data=train_data1.copy()
# train_data=train_data.sample(frac=1)
y =train_data['Label']
y=torch.tensor(np.array(y),dtype=torch.int32)
train_data=train_data.drop('Label',axis=1)
X=(train_data-train_data.mean())/train_data.std()
X=torch.tensor(np.array(X),dtype=torch.float32)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=2,shuffle=True)

torch_dataset = Data.TensorDataset(X_train, y_train)
train_iter=torch.utils.data.DataLoader(torch_dataset,batch_size=64)
torch_dataset = Data.TensorDataset(X_test, y_test)
test_iter=torch.utils.data.DataLoader(torch_dataset)

```
### 模型和训练
#### 模型
``` python
class Reshape(nn.Module):
    def forward(self,x):
        # return x.view(-1,1,32,32)
        return x.view(-1,1,20,35)

net=nn.Sequential(
    Reshape(),nn.Conv2d(in_channels=1,out_channels=10,kernel_size=3,padding=0),nn.BatchNorm2d(10),nn.ReLU(),
    nn.AvgPool2d(2,stride=2),
    nn.Conv2d(10,30,3),nn.BatchNorm2d(30),nn.ReLU(),
    nn.AvgPool2d(2,stride=2),nn.Flatten(),
    nn.Linear(630,256),nn.BatchNorm1d(256),nn.Dropout(0.5),nn.ReLU(),
    nn.Linear(256,128),nn.BatchNorm1d(128),nn.Dropout(0.5),nn.ReLU(),
    nn.Linear(128,64),nn.BatchNorm1d(64),nn.Dropout(0.25),nn.ReLU(),
    nn.Linear(64,32),nn.BatchNorm1d(32),nn.Dropout(0.25),nn.ReLU(),
    nn.Linear(32,2)
)
```
#### 训练
``` python
class Accumulator:
    def __init__(self, n):
        self.data = [0.0] * n

    def add(self, *args):
        self.data = [a + float(b) for a, b in zip(self.data, args)]

    def reset(self):
        self.data = [0.0] * len(self.data)

    def __getitem__(self, idx):
        return self.data[idx]

def evaluate(net,data_iter,device=None):
    if isinstance(net,torch.nn.Module):
        net.eval()
        if not device:
            device=next(iter(net.parameters())).device
    metric=Accumulator(2)
    with torch.no_grad():
        for X,y in data_iter:
            if isinstance(X,list):
                X=[x.to(device) for x in X]
            else:
                X=X.to(device)
            y=y.to(device)
            metric.add(d2l.accuracy(net(X),y),y.numel())
    return metric[0]/metric[1]

def train(net,train_iter,test_iter,num_epochs,lr,device):
    def init_weights(m):
        if type(m)==nn.Linear or type(m)==nn.Conv2d:
            nn.init.xavier_uniform_(m.weight)
    net.apply(init_weights)
    print('train on',device)
    net.to(device)
    optimizer=torch.optim.Adam(net.parameters(),lr,weight_decay=0.0001)
    loss=nn.CrossEntropyLoss()
    for epoch in range(num_epochs):
        metric=d2l.Accumulator(3)
        net.train()
        for i,(X,y) in enumerate(train_iter):
            optimizer.zero_grad()
            X,y=X.to(device),y.long().to(device)
            y_hat=net(X)
            l=loss(y_hat,y)
            l.backward()
            optimizer.step()
            with torch.no_grad():
                metric.add(l*X.shape[0],d2l.accuracy(y_hat,y),X.shape[0])
            train_l=metric[0]/metric[2]
            train_acc=metric[1]/metric[2]
        test_acc = evaluate(net, test_iter)
        print(f'loss {train_l:.3f}, train acc {train_acc:.3f}, '
              f'test acc {test_acc:.3f}')
lr, num_epochs = 0.001, 10
train(net, train_iter, test_iter, num_epochs, lr,gpu)
```
```
train on cuda:0
loss 0.693, train acc 0.573, test acc 0.621
loss 0.623, train acc 0.643, test acc 0.669
loss 0.538, train acc 0.709, test acc 0.715
loss 0.500, train acc 0.738, test acc 0.739
loss 0.480, train acc 0.750, test acc 0.748
loss 0.463, train acc 0.761, test acc 0.742
loss 0.451, train acc 0.768, test acc 0.744
loss 0.439, train acc 0.778, test acc 0.769
loss 0.426, train acc 0.785, test acc 0.754
loss 0.415, train acc 0.793, test acc 0.767
```
