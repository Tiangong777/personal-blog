---
title: Householder tridiagonalization algorithm
category: Algorithm
katex: true
published: false
hide: true
---
### 普适算法
```python
import numpy as np

def HouseHolder_Tridigonal(matrix):
    n = matrix.shape[0]
    v = np.zeros((n, 1))
    print('original matrix is:')
    print(matrix)
    
    for i in range(1, n - 1):
        r = 0
        for l in range(i, n):
            r += matrix[i - 1, l] ** 2
        r = r ** 0.5
        if r * matrix[i - 1, i] > 0:
            r = -r
        h = -1.0 / (r * r - r * matrix[i - 1, i])
        v[:] = 0
        v[i, 0] = matrix[i - 1, i] - r
        for l in range(i + 2, n + 1):
            v[l - 1, 0] = matrix[i - 1, l - 1]
        
        p = np.dot(v, np.transpose(v)) * h
        for l in range(1, n + 1):
            p[l - 1, l - 1] += 1.0
        
        a1 = np.dot(p, matrix)
        matrix = np.dot(a1, p)
    
    print('Main diagonal:')
    for i in range(1, n + 1):
        print(f'{matrix[i - 1, i - 1]}')
    
    print('Subdiagonal:')
    for i in range(2, n + 1):
        print(f'{matrix[i - 2, i - 1]}')
    
    print(matrix)

input_matrix = np.array([[1, 2, 3],
                         [4, 5, 6],
                         [7, 8, 9]])

HouseHolder_Tridigonal(input_matrix)
```
### 加速QR分解
```python
def HouseHolder(matrix,tri):
    rows = matrix.shape[1]
    Q = np.eye(rows)
    R = np.copy(matrix)
    for row in range(rows-1):
        a = np.linalg.norm(R[row:,row])
        e = np.zeros((rows- row))
        e[0] = 1.0
        num = R[row:,row] -a*e
        u = num / np.linalg.norm(num)
        H = np.eye((rows))
        if tri==False:
            H[row:, row:] = np.eye((rows-row))- 2*u.reshape(-1, 1).dot(u.reshape(1, -1))
        else:
            u=u[:2]
            H[row:row+2, row:row+2] = np.eye(2)- 2*u.reshape(-1, 1).dot(u.reshape(1, -1))
        R = H.dot(R)
        Q = Q.dot(H)
    return Q, R
```
当计算 $$I - 2\omega\omega^T $$的时候，我们只需要第一第二个元素，所以直接选取u[u:2]

