import numpy as np

print (np.__version__)

# Creazione di un array NumPy
arr = np.array([1, 2, 3, 4, 5])

# Operazioni matematiche sull'array
print("Array originale:", arr)
print("Array + 10:", arr + 10)
print("Array * 2:", arr * 2)

# Calcolo di statistiche
print("Media:", np.mean(arr))
print("Somma:", np.sum(arr))
print("Deviazione standard:", np.std(arr))

# Creazione di una matrice 2x3
matrix = np.array([[1, 2, 3], [4, 5, 6]])
print("Matrice 2x3:\n", matrix)

# Reshaping dell'array
reshaped = arr.reshape(5, 1)
print("Array reshaped:\n", reshaped)

# Generazione di numeri casuali
random_arr = np.random.rand(3, 3)
print("Matrice casuale 3x3:\n", random_arr)
