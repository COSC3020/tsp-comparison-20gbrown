//code.j

const fs = require('fs');

function generateRandomDistanceMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.random() * 100;
        }
    }
    return matrix;
}

function measureExecutionTime(func, iterations = 1000) {
    const startTime = new Date();
    for (let i = 0; i < iterations; i++) {
        func();
    }
    const endTime = new Date();
    const executionTime = (endTime - startTime) / iterations;
    return { result: func(), executionTime };
}

function logTourInfo(city, result, algorithm) {
    console.log(`${algorithm} - Tour length starting from city ${city}:`, result);
}

function tsp_hk(distance_matrix) {
    console.log('Input Matrix:', distance_matrix);
    const n = distance_matrix.length;
    if (n <= 1) {
        return 0;
    }

    const memo = new Map();

    function heldKarp(cities, start) {
        if (cities.length === 1) {
            return distance_matrix[start][cities[0]];
        }
    
        // Sort the cities array
        const sortedCities = cities.slice().sort((a, b) => a - b);
    
        const key = `${sortedCities.join(",")}-${start}`;
        if (memo.has(key)) {
            return memo.get(key);
        }
    
        const subCities = sortedCities.filter(city => city !== start);
    
        const tourLengths = subCities.map(city => {
            const length = heldKarp(subCities, city) + distance_matrix[start][city];
            return length;
        });
    
        let minLength = Math.min(...tourLengths);
    
        // Check if the minimum length is still Infinity
        if (minLength === Infinity) {
            minLength = 0; // Set to 0 if it's Infinity
        }

        if (key === undefined) {
            console.log("Key is undefined:", sortedCities, start);
        }
    
        memo.set(key, minLength);
        return minLength;
    }

    let minTourLength = Infinity;
    let executionTime = 0;

    for (let startCity = 1; startCity < n; startCity++) {
        const { result, executionTime: cityExecutionTime } = measureExecutionTime(() =>
            heldKarp([...Array(n).keys()].filter(city => city !== startCity), startCity)
        );

        logTourInfo(startCity, result, "Held-Karp");
        minTourLength = Math.min(minTourLength, result);
        executionTime += cityExecutionTime;
    }

    console.log("Final Held-Karp minTourLength:", minTourLength);
    return { minTourLength, executionTime };
}

function tsp_ls(distance_matrix) {
    const len = distance_matrix.length;

    // Make and randomize the route
    let route = Array.from({ length: len }, (_, i) => i);
    route = genRandomRoute(route);

    // Track the number of iterations without improvement
    let noImprovementCount = 0;
    const maxNoImprovement = 1000;

    while (noImprovementCount < maxNoImprovement) {
        let betterRoute = false;

        for (let i = 0; i < len - 1; i++) {
            for (let k = i + 1; k < len; k++) {
                const newRoute = twoOptSwap(route, i, k);
                const newLength = routeDist(newRoute);

                if (newLength < routeDist(route)) {
                    route = newRoute;
                    betterRoute = true;
                    noImprovementCount = 0; // Reset the count on improvement
                }
            }
        }

        // Increment the count if no improvement is found
        if (!betterRoute) {
            noImprovementCount++;
        }
    }

    // Function that gets the distance of a route
    function routeDist(route) {
        let distance = 0;
        for (let i = 0; i < len - 1; i++) {
            distance += distance_matrix[route[i]][route[i + 1]];
        }
        return distance;
    }

    const { result, executionTime } = measureExecutionTime(() => routeDist(route));
    logTourInfo("N/A", result, "Local Search"); // Log final tour length in Local Search

    return { routeDist: result, executionTime };
}

// To get a randomized/shuffled list
function genRandomRoute(route) {
    let currentIndex = route.length;
    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [route[currentIndex], route[randomIndex]] = [route[randomIndex], route[currentIndex]];
    }
    return route;
}

function twoOptSwap(route, i, k) {
    // Get the part of the list to reverse (line 3 in the pseudocode)
    const swap = route.slice(i, k + 1);
    // Reverse it
    swap.reverse();
    // Make the new list with the reversed part in the middle
    const newRoute = route.slice(0, i).concat(swap).concat(route.slice(k + 1)); // (Lines 1-4 in the pseudocode
    return newRoute;
}

const inputSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const heldKarpResults = [];
const localSearchResults = [];

for (const size of inputSizes) {
    const distanceMatrix = generateRandomDistanceMatrix(size);

    const heldKarpResult = tsp_hk(distanceMatrix);
    heldKarpResults.push({ size, ...heldKarpResult });

    const localSearchResult = tsp_ls(distanceMatrix);
    localSearchResults.push({ size, ...localSearchResult });
}

console.log("Held-Karp Results:", heldKarpResults);
console.log("Local Search Results:", localSearchResults);


