---
title: Traveling Salesman Problem
category: Algorithm
published: false
hide: true
---
### The problem
A traveling salesman plans to do business in several cities. He needs to find a route that allows him to depart from a certain city, visit every other city exactly once, and eventually return to the starting city. Additionally, he wishes to identify a route with the shortest total length (or total cost).
### Build Model
```python
np.random.seed(222)
number=8 #number of cities
coordinates = np.random.uniform(0, 10, size=(number, 2))
dist_matrix = cdist(coordinates, coordinates)
dist_matrix
```
    array([[0.        , 3.11249132, 7.03075737, 5.17244686, 4.49434858,
            6.13553994, 4.43119882, 2.19873717],
           [3.11249132, 0.        , 9.28521103, 4.35978405, 3.79822776,
            5.55726409, 7.53027518, 4.03821865],
           [7.03075737, 9.28521103, 0.        , 7.24893139, 7.06316278,
            6.99526055, 6.05705346, 8.7087241 ],
           [5.17244686, 4.35978405, 7.24893139, 0.        , 0.68112825,
            1.19921388, 8.69979158, 7.22181111],
           [4.49434858, 3.79822776, 7.06316278, 0.68112825, 0.        ,
            1.79858401, 8.10531237, 6.54136163],
           [6.13553994, 5.55726409, 6.99526055, 1.19921388, 1.79858401,
            0.        , 9.29830755, 8.25452782],
           [4.43119882, 7.53027518, 6.05705346, 8.69979158, 8.10531237,
            9.29830755, 0.        , 4.42854949],
           [2.19873717, 4.03821865, 8.7087241 , 7.22181111, 6.54136163,
            8.25452782, 4.42854949, 0.        ]])
```python
plt.scatter(coordinates[:, 0], coordinates[:, 1])
plt.xlim(0, 10)
plt.ylim(0, 10)
plt.grid(True)
plt.show()
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/algorithm/TSP/output_2_0.png)
### Solution
#### Exhaustive method
```python
def total_distance(route, dist_matrix):
    total = 0
    route = np.append(route, route[0])
    for i in range(len(route) - 1):
        total += dist_matrix[route[i], route[i+1]]
    return total

def Exhaustive(dist_matrix):
    n = dist_matrix.shape[0]
    min_dist = float('inf')
    best_route = None
    for route in permutations(range(n)):
        route = np.array(route)
        route_dist = total_distance(route, dist_matrix)
        if route_dist < min_dist:
            min_dist = route_dist
            best_route = route
    return best_route, min_dist
shortest_route,shortest_distance=Exhaustive(dist_matrix)

print("The shortest route is:", shortest_route)
print("The shortest distance is:", shortest_distance)
```
    The shortest route is: [0 7 6 2 5 3 4 1]
    The shortest distance is: 28.470661865225075

```python
plot_oeder(np.array([shortest_route]),coordinates)
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/algorithm/TSP/output_15_0.png)
#### Genetic Algorithm
##### Generate Population
```python
def generate_pop(pop_size,gene_num):
    permutations = np.empty((pop_size, number), dtype=int)
    for i in range(pop_size):
        permutations[i] = np.random.permutation(gene_num)
    return permutations
```
##### fitness function
```python
def get_fitness(pred):
    return 1 / pred
```
##### get distance
```python
def calculate_distance(population,dist_matrix,pop_size):
    total_distances = np.empty(pop_size)
    for i in range(pop_size):
        total_distances[i] = np.sum(dist_matrix[population[i, :-1], population[i, 1:]])
        total_distances[i] += dist_matrix[population[i, -1], population[i, 0]]
    return total_distances
```
##### Chromosomal crossover
```python
def order_crossover(parent1, parent2):
    size = len(parent1)
    # select two citys randomly
    idx1, idx2 = np.sort(np.random.choice(range(size), 2, replace=False))
    offspring1, offspring2 = [None]*size, [None]*size
    # exchange the position
    offspring1[idx1:idx2] ,offspring2[idx1:idx2]= parent1[idx1:idx2],parent2[idx1:idx2]
    # fill the remained city into gene
    for offspring, parent in zip((offspring1, offspring2), (parent2, parent1)):
        if None in offspring:
            for i in range(size):
                if offspring[i] is None:
                    for gene in parent:
                        if gene not in offspring:
                            offspring[i] = gene
                            break
    return offspring1, offspring2
def recombine_population(population, recombination_rate):
    new_population = []
    population_size = len(population)
    for i in range(0, population_size, 2):
        if np.random.rand() < recombination_rate:
            parent1 = population[i]
            parent2 = population[i+1]
            offspring1, offspring2 = order_crossover(parent1, parent2)
            new_population.extend([offspring1, offspring2])
        else:
            new_population.extend([population[i], population[i+1]])
    return np.array(new_population)
```
##### Mutation
```python
def mutate_individual(individual, mutation_rate):
    if np.random.rand() < mutation_rate:
        # select two citys randomly
        idx1, idx2 = np.random.choice(len(individual), 2, replace=False)
        # exchange the position
        individual[idx1], individual[idx2] = individual[idx2], individual[idx1]
    return individual

def mutate_population(population, mutation_rate):
    return np.array([mutate_individual(ind, mutation_rate) for ind in population])
```
##### Configure
```python
pop_size=1000
gene_num=number
recombination_rate=0.8
mutation_rate=0.2
pop=generate_pop(pop_size,gene_num)
```
##### Run
```python
for j in range(100):
    total_distances = calculate_distance(pop,dist_matrix,pop_size)
    fitness=get_fitness(total_distances)
    # natural selection
    idx = np.random.choice(np.arange(pop_size), size=pop_size, replace=True, p=fitness/fitness.sum())
    pop = pop[idx]
    pop=recombine_population(pop,recombination_rate)
    pop=mutate_population(pop,mutation_rate)
order=pop[np.argmin(calculate_distance(pop,dist_matrix,pop_size))].reshape(1,-1)
distance=calculate_distance(order,dist_matrix,1)
print(order)
print(distance)
```
    [[4 3 5 2 6 7 0 1]]
    [28.47066187]
```python
plot_order(order, coordinates)
```
![png](https://website-1302841369.cos.eu-frankfurt.myqcloud.com/algorithm/TSP/output_13_0.png)