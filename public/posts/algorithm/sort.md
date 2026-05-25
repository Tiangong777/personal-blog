---
title: Classic Sort
category: Algorithm
published: false
hide: true
---
### some packages and input
```python
import random
import time
import sys
import os
import psutil
import time
import matplotlib.pyplot as plt
def memory_usage():
    # 返回整个python进程的内存使用量
    process = psutil.Process(os.getpid())
    return process.memory_info().rss
    
numbers = [random.randint(-20000,20000) for _ in range(30000)]
```
### Sort
#### SelectSort
```python
def SelectSort(numbers):
    n=len(numbers)
    for i in range(n):
        min=i
        for j in range(i+1,n):
            if numbers[min]>=numbers[j]:
                numbers[min],numbers[j]=numbers[j],numbers[min]
    return numbers
```
#### BubbleSort
```python
def BubbleSort(numbers):
    n=len(numbers)
    for j in range(n-1):
        for i in range(j,n-1):
            if numbers[i]>numbers[i+1]:
                numbers[i],numbers[i+1]=numbers[i+1],numbers[i]
    return numbers
```
#### InsertSort
```python
def InsertSort(numbers):
    n=len(numbers)
    for i in range(1,n):
        tem=numbers[i]
        j=i-1
        while j>=0 and tem<numbers[j]:
            numbers[j+1]=numbers[j]
            j-=1
        numbers[j+1]=tem
    return numbers
```
#### MergeSort
```python
def merge_sort(numbers):
    if len(numbers) <= 1:
        return numbers

    mid = len(numbers) // 2
    left_half = merge_sort(numbers[:mid])
    right_half = merge_sort(numbers[mid:])

    return merge(left_half, right_half)

def merge(left, right):
    merged = []
    left_index = 0
    right_index = 0
    while left_index < len(left) and right_index < len(right):
        if left[left_index] < right[right_index]:
            merged.append(left[left_index])
            left_index += 1
        else:
            merged.append(right[right_index])
            right_index += 1
    merged += left[left_index:]
    merged += right[right_index:]
    return merged
```
#### CountSort
```python
def count_sort(numbers):
    minN=min(numbers)
    numbers=[x-minN for x in numbers]
    bucket = [0]*(max(numbers)+1)
    for num in numbers:
        bucket[num] += 1
    sorted_array = []
    for i in range(len(bucket)):
        if bucket[i] > 0:
            sorted_array += [i]*bucket[i]
    return [x+minN for x in sorted_array]
```
#### BucketSort
```python
def bucket_sort(numbers):
    min_num = min(numbers)
    max_num = max(numbers)
    bucket_range = (max_num-min_num) / len(numbers)
    count_list = [ [] for _ in range(len(numbers) + 1)]
    for i in numbers:
        count_list[int((i-min_num)//bucket_range)].append(i)
    numbers.clear()
    for i in count_list:
        for j in sorted(i):
            numbers.append(j)

    return numbers
```
#### Radixsort
```python
def radixsort(numbers):
    def rs(seq):
        base=1
        try:
            maxn=max(seq)
        except:
            return []
        while base<maxn:
            bucket=[[] for _ in range(10)]
            for num in seq:
                index=num//base %10
                bucket[index].append(num)
            l=0
            for index in range(10):
                for v in bucket[index]:
                    seq[l]=v
                    l+=1
            base*=10
        return seq
    pos=[]
    neg=[]
    for i in numbers:
        if i<=0:
            neg.append(i)
        else:
            pos.append(i)
    list1=rs(pos)
    list2=rs([-num for num in neg])
    return [-num for num in list2][::-1]+list1
```
#### QuickSort
```python
def QuickSort(numbers,start=0,end=len(numbers)-1):
    def QuickSortInside(seq,start,end):
        pick=random.randint(start,end)
        seq[start],seq[pick]=seq[pick],seq[start]
        flag=start
        cusor=start+1
        for i in range(start+1,end+1):
            if seq[i]<=seq[flag]:
                seq[i],seq[cusor]=seq[cusor],seq[i]
                cusor+=1
        seq[flag],seq[cusor-1]=seq[cusor-1],seq[flag]
        flag=cusor-1
        # print(seq[flag],seq[start:flag],seq[flag+1:end+1])
        return flag

    if start>=end:
        return
    flag=QuickSortInside(numbers,start,end)
    QuickSort(numbers,start,flag-1)
    QuickSort(numbers,flag+1,end)
    return numbers
```
#### ShellSort
```python
def shell_sort(numbers):
    size = len(numbers)
    gap = size // 2

    while gap > 0:
        for i in range(gap, size):
            temp = numbers[i]
            j = i
            while j >= gap and numbers[j - gap] > temp:
                numbers[j] = numbers[j - gap]
                j -= gap
            numbers[j] = temp
        gap //= 2
    return numbers
```
#### HeapSort
```python
def heap_sort(numbers):
    def heapify(seq, n, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2

        if left < n and seq[i] < seq[left]:
            largest = left

        if right < n and seq[largest] < seq[right]:
            largest = right
        if largest != i:
            seq[i], seq[largest] = seq[largest], seq[i]
            heapify(seq, n, largest)
        return seq
    n = len(numbers)
    for i in range(n // 2 - 1, -1, -1):
        heapify(numbers, n, i)
    for i in range(n - 1, 0, -1):
        numbers[i], numbers[0] = numbers[0], numbers[i]  # swap
        heapify(numbers, i, 0)
    return numbers
```
### Performance
```python
def measure(function, numbers):
    start_time = time.time()
    start_mem = memory_usage()
    function(numbers)
    run_time = time.time() - start_time
    mem_usage = memory_usage() - start_mem
    return run_time, mem_usage
sorting_algorithms = [SelectSort, BubbleSort, InsertSort, merge_sort, count_sort, bucket_sort, radixsort, QuickSort, shell_sort, heap_sort]
names = ['SelectSort', 'BubbleSort', 'InsertSort', 'merge_sort', 'count_sort', 'bucket_sort', 'radixsort', 'QuickSort', 'shell_sort', 'heap_sort']
times = []
memories = []
for sort in sorting_algorithms:
    time_elapsed, memory_used = measure(sort, numbers)
    times.append(time_elapsed)
    memories.append(memory_used)
    
plt.figure(figsize=(10,5))
plt.bar(names, times)
plt.ylabel('Time (seconds)')
plt.title('Time taken by sorting algorithms')
plt.show()

plt.figure(figsize=(10,5))
plt.bar(names, memories)
plt.ylabel('Memory (KB)')
plt.title('Memory used by sorting algorithms')
plt.show()
```