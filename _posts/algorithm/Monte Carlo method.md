---
title: 蒙特卡洛计算阴影面积
category: Algorithm
published: false
hide: true
---
### some packages and input
```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
```
### Data
```python
width = 4
height = 4
num_samples = 100000000
x_samples = np.random.uniform(0, width, num_samples)
y_samples = np.random.uniform(0, height, num_samples)
within_x = x_samples <= 1.6
within_line = y_samples >= 0.5 * x_samples
within_semicircle = (x_samples - 4)**2 + (y_samples - 4)**2 >= 4**2
within_region = np.logical_and(np.logical_and(within_x, within_line), within_semicircle)
```
### Plot
```python
fig, ax = plt.subplots()
ax.set_aspect('equal')
rectangle = patches.Rectangle((0, 0), 8, 4, linewidth=1, edgecolor='r', facecolor='none')
ax.add_patch(rectangle)
semicircle = patches.Arc((4, 4), 8, 8, theta1=180, theta2=360, linewidth=1, edgecolor='b')
ax.add_patch(semicircle)
ax.plot([0, 8], [0, 4], color='g')
ax.scatter(x_samples[within_region], y_samples[within_region], color='orange', s=0.1, alpha=0.1)
ax.set_xlim(0, 9)
ax.set_ylim(0, 5)
ax.grid(True)
plt.show()
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/algorithm/MonteCarlo/output_2_0.png)
### Calculate
```python
proportion_within_region = np.sum(within_region) / num_samples
total_area = width * height
estimated_area = proportion_within_region * total_area
print("Estimated area:", estimated_area)
```
```
Estimated area: 2.18104944
```