// Performance Monitor for Molstar CDN Optimization
console.log('🚀 Performance monitoring active');

const startTime = performance.now();

// Monitor Molstar CDN loading
const checkMolstar = setInterval(() => {
    if (window.PDBeMolstarPlugin) {
        const loadTime = performance.now() - startTime;
        console.log(`⚛️ Molstar CDN loaded: ${loadTime.toFixed(2)}ms`);
        clearInterval(checkMolstar);
    }
}, 50);

setTimeout(() => clearInterval(checkMolstar), 10000);
