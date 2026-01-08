---
title: 计算两个participants之间的PLV或者WPLI
category: EEG
katex: true
published: false
hide: true
---
### 计算流程
包括读取，清洗，转换，ICA，计算
#### 导入包
``` python
from hypyp import analyses
from hypyp import stats
import os
import mne
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from hypyp import prep
import time
import mne_icalabel
import copy
```
#### 读取数据
``` python
def readdata(self):
data_position='data/raw/'
raw=mne.io.read_raw_brainvision(data_position+self.data,preload=True)
raw = raw.filter(l_freq=1., h_freq=100.)
return raw
```
#### 重命名通道名称并且设置通道类型
``` python
channel_renaming_dict = {name: name.replace('VEOG1', 'Fp2') for name in raw.ch_names}
raw.rename_channels(channel_renaming_dict)
channel_renaming_dict = {name: name.replace('VEOG2', 'IO') for name in raw.ch_names}
raw.rename_channels(channel_renaming_dict)
channel_renaming_dict = {name: name.replace('HEOG1', 'FT9') for name in raw.ch_names}
raw.rename_channels(channel_renaming_dict)
channel_renaming_dict = {name: name.replace('HEOG2', 'FT10') for name in raw.ch_names}
raw.rename_channels(channel_renaming_dict)

raw.set_channel_types({'IO_1':'eog','IO_2':'eog'})
raw.set_channel_types({'IZ_1':'eog','IZ_2':'eog'})
```
#### 重新设置通道名字，重参考
``` python
raw_female=condition_data.copy().pick_channels(ch_names=self.raw.ch_names[:int(len(self.raw.ch_names)/2)])
raw_female_col= mne.add_reference_channels(raw_female, ref_channels=['TP10_1'],copy=True)
```
#### 保留列名
``` python
self.femalecol=raw_female_col.pick(picks='all',exclude=['IZ_1','IO_1']).info['ch_names']
raw_female=mne.add_reference_channels(raw_female, ref_channels=['TP10'])
raw_female= raw_female.set_eeg_reference(ref_channels='average')
channel_renaming_dict = {name: name.replace('_1','') for name in raw_female.ch_names}
raw_female.rename_channels(channel_renaming_dict)

raw_male = condition_data.copy().pick_channels(ch_names=self.raw.ch_names[int(len(self.raw.ch_names)/2):])
raw_male_col=mne.add_reference_channels(raw_male, ref_channels=['TP10_2'],copy=True)

self.malecol=raw_male_col.pick(picks='all',exclude=['IZ_2','IO_2']).info['ch_names']

raw_male=mne.add_reference_channels(raw_male, ref_channels=['TP10'])
raw_male= raw_male.set_eeg_reference(ref_channels='average')
channel_renaming_dict = {name: name.replace('_2','') for name in raw_male.ch_names}
raw_male.rename_channels(channel_renaming_dict)
```
#### 提取eeg信号并且设置Montage
``` python
eeg_female=raw_female.pick(picks='all',exclude=['IZ','IO'])
print(eeg_female.ch_names)
eeg_male=raw_male.pick(picks='all',exclude=['IZ','IO'])

# 设置montage
eeg_female.set_montage('standard_1020',on_missing='warn')
eeg_male.set_montage('standard_1020',on_missing='warn')
```
#### 裁剪并且提取event
``` python
def crop_raw(self,events,raw,index,verbose=False):
    cut=raw.copy()
    cut.crop(tmin=events[0][events[0][:,2]==index][0,0]/1000,tmax=events[0][events[0][:,2]==(index+10)][0,0]/1000)
    if verbose:
        cut.plot()
        plt.show()
    return cut
```
#### 进行ICA，也可以选择手动
``` python
def ICA(self,icas, epochs, verbose= False):
    cleaned_epochs_ICA = []
    for ica, epoch in zip(icas, epochs):
        ica_with_labels_fitted = mne_icalabel.label_components(epoch, ica, method="iclabel")
        ica_with_labels_component_detected = ica_with_labels_fitted["labels"]
        excluded_idx_components = [idx for idx, label in enumerate(ica_with_labels_component_detected) if label not in ["brain"]]
        cleaned_epoch_ICA = mne.Epochs.copy(epoch)
        cleaned_epoch_ICA.info['bads'] = []
        ica.apply(cleaned_epoch_ICA, exclude=excluded_idx_components)
        cleaned_epoch_ICA.info['bads'] = copy.deepcopy(epoch.info['bads'])
        cleaned_epochs_ICA.append(cleaned_epoch_ICA)
        if verbose:
            epoch.plot(title='Before', show=True)
            cleaned_epoch_ICA.plot(title='After',show=True)
    return cleaned_epochs_ICA
```
#### 计算PLV或者wpli
``` python
def cal_syn(self,eeg_female,eeg_male,freq_bands):
    epo_female = mne.make_fixed_length_epochs(eeg_female, duration=1.024, preload=True)
    epo_male = mne.make_fixed_length_epochs(eeg_male, duration=1.024, preload=True)

    mne.epochs.equalize_epoch_counts([epo_female, epo_male])

    icas = prep.ICA_fit([epo_female, epo_male],n_components=30,method='infomax',fit_params=dict(extended=True),
                random_state= 97)
    cleaned_epochs_ICA = self.ICA(icas, [epo_female, epo_male],verbose=False)
    frneg_inter = np.array([cleaned_epochs_ICA[0], cleaned_epochs_ICA[1]])
    self.frneg_inter=frneg_inter

    ch_num = len(epo_female.info['ch_names'])
    self.ch_num=ch_num
    s_r=epo_female.info['sfreq']
    complex_signal = analyses.compute_freq_bands(frneg_inter,s_r,freq_bands)
    result = analyses.compute_sync(complex_signal, mode='plv',epochs_average=True)
    theta=result[0, 0:ch_num, ch_num:2*ch_num]
    alpha=result[1, 0:ch_num, ch_num:2*ch_num]
    beta=result[2, 0:ch_num, ch_num:2*ch_num]
    gamma=result[3, 0:ch_num, ch_num:2*ch_num]
    return theta,alpha,beta,gamma
```
#### 计算
```python
def call(self):
    freq_bands = {'Theta': [4, 7],'Alpha': [8, 12],
                  'Beta': [13, 30],'Gamma': [31, 60]}
    condition_order=['RS1','positive_Interaktion','Mentalizing_positive','Kognition_bei_AngeInt','negative_Interaktion','Mentalizing_negative','Kognition_negative','RS2']

    events=mne.events_from_annotations(self.raw)
    RS1=self.crop_raw(events,self.raw,201)
    positive_Interaktion=self.crop_raw(events,self.raw,202)
    Mentalizing_positive=self.crop_raw(events,self.raw,203)
    Kognition_bei_AngeInt=self.crop_raw(events,self.raw,205)
    negative_Interaktion=self.crop_raw(events,self.raw,206)
    Mentalizing_negative=self.crop_raw(events,self.raw,207)
    Kognition_negative=self.crop_raw(events,self.raw,209)
    RS2=self.crop_raw(events,self.raw,210)

    for step,condition in enumerate(condition_order):
        epo_female,epo_male=self.preprocess(locals()[condition])
        theta,alpha,beta,gamma=self.cal_syn(epo_female,epo_male,freq_bands)
        if step==0:
            theta_flatten_value=theta.flatten().reshape((1,-1))
            alpha_flatten_value=alpha.flatten().reshape((1,-1))
            beta_flatten_value=beta.flatten().reshape((1,-1))
            gamma_flatten_value=gamma.flatten().reshape((1,-1))
        else:
            theta_flatten_value=np.hstack((theta_flatten_value,theta.flatten().reshape((1,-1))))
            alpha_flatten_value=np.hstack((alpha_flatten_value,alpha.flatten().reshape((1,-1))))
            beta_flatten_value=np.hstack((beta_flatten_value,beta.flatten().reshape((1,-1))))
            gamma_flatten_value=np.hstack((gamma_flatten_value,gamma.flatten().reshape((1,-1))))

    self.theta_flatten_value=theta_flatten_value
    self.alpha_flatten_value=alpha_flatten_value
    self.beta_flatten_value=beta_flatten_value
    self.gamma_flatten_value=gamma_flatten_value

```
#### 运行
```python
condition_order=['RS1','positive_Interaktion','Mentalizing_positive','Kognition_bei_AngeInt','negative_Interaktion','Mentalizing_negative','Kognition_negative','RS2']
theta_flatten_column=[]
alpha_flatten_column=[]
beta_flatten_column=[]
gamma_flatten_column=[]
for condition in condition_order:
        for female in femalea:
            for male in malea:
                theta_flatten_column.append(condition+' '+female+','+male+' ')
                alpha_flatten_column.append(condition+' '+female+','+male+' ')
                beta_flatten_column.append(condition+' '+female+','+male+' ')
                gamma_flatten_column.append(condition+' '+female+','+male+' ')

start=time.time()
index = ['10']
m=[]
for step,i in enumerate(index):
    locals()['D'+i]=Experiment('PSP_D'+i+'_Int.vhdr')
    locals()['D'+i].call()
    if step==0:
        df_theta=locals()['D'+i].theta_flatten_value
        df_alpha=locals()['D'+i].alpha_flatten_value
        df_beta=locals()['D'+i].beta_flatten_value
        df_gamma=locals()['D'+i].gamma_flatten_value
    else:
        df_theta= np.vstack((df_theta,locals()['D'+i].theta_flatten_value))
        df_alpha = np.vstack((df_alpha,locals()['D'+i].alpha_flatten_value))
        df_beta = np.vstack((df_beta,locals()['D'+i].beta_flatten_value))
        df_gamma = np.vstack((df_gamma,locals()['D'+i].gamma_flatten_value))
    del locals()['D'+i]
    m.append(i)
end=time.time()
```

### 导出
```python
df_theta=pd.DataFrame(df_theta)
df_alpha=pd.DataFrame(df_alpha)
df_beta=pd.DataFrame(df_beta)
df_gamma=pd.DataFrame(df_gamma)
df_theta.columns = theta_flatten_column
df_alpha.columns = alpha_flatten_column
df_beta.columns = beta_flatten_column
df_gamma.columns = gamma_flatten_column
df_theta.index=index
df_alpha.index=index
df_beta.index=index
df_gamma.index=index
writer = pd.ExcelWriter('result.xlsx')
df_theta.to_excel(writer, sheet_name='theta')
df_alpha.to_excel(writer, sheet_name='alpha')
df_beta.to_excel(writer, sheet_name='beta')
df_gamma.to_excel(writer, sheet_name='gamma')
writer.save()
```
### 聚类
```python
def cluster(band):
    data=pd.read_excel('result.xlsx',sheet_name=band)
    ch={'Frontal_K':['F3','F4','F7','F8'],'Parietal_K':['P3','P4'],'Temporoparietal_K':['T7','T8','P7','P8','CP5','CP6'],
        'Occipital_K':['O1','O2'],'Temporal_E':['T7','T8'],'Occipitotemporal_E':['P7','P8'],'Central_E':['C3','C4'],
        'Temporal_left_D':['FT9','T7','TP9'],'Temporal_right_D':['FT10','T8','TP10'],'Central_D':['Cz','C3','C4']}
    b=[]
    m=0
    for key in ch:
        for step,value in enumerate(ch[key]):
            if step==0:
                locals()[value]=data.filter(regex='.*'+value+'_1,'+value+'_2.*')
                a=locals()[value]
            else:
                locals()[value]=data.filter(regex='.*'+value+'_1,'+value+'_2.*')
                locals()[value].columns=locals()[ch[key][0]].columns
                a+=locals()[value]
            a.columns=a.columns.str.replace(value+'_1,'+value+'_2',key)
        m+=1
        a/=len(ch[key])
        if key=='Frontal_K':
            a.insert(0,data.columns[0],data['participant'])
            b=a.copy()
        else:
            b=pd.concat([b,a],axis=1)
    return b
cluster_theta=cluster('theta')
cluster_alpha=cluster('alpha')
cluster_beta=cluster('beta')
cluster_gamma=cluster('gamma')
cluster_table = pd.ExcelWriter('cluster.xlsx')
cluster_theta.to_excel(cluster_table, sheet_name='theta',index=None)
cluster_alpha.to_excel(cluster_table, sheet_name='alpha',index=None)
cluster_beta.to_excel(cluster_table, sheet_name='beta',index=None)
cluster_gamma.to_excel(cluster_table, sheet_name='gamma',index=None)
cluster_table.save()
```
