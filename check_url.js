/**
 * Loads and verifies check_url.wasm.
 * Returns the reconstructed token string if URL matches, or null if it fails/missing.
 */
async function getWasmToken() {
    try {
        const response = await fetch("./check_url.wasm", { cache: "no-store" });
        if (!response.ok) {
            throw new Error("Unable to load WASM file");
        }

        const wasmBytes = await response.arrayBuffer();
        const wasm = await WebAssembly.instantiate(wasmBytes);
        const instance = wasm.instance;
        const memory = instance.exports.memory;
        const check = instance.exports.check;

        // Build current URL
        const origin = window.location.origin;
        let path = window.location.pathname;
        if (path.length > 1 && path.endsWith("/")) {
            path = path.slice(0, -1);
        }
        const currentUrl = origin + path;

        // SHA-256 Hash of current URL
        const urlBytes = new TextEncoder().encode(currentUrl);
        const hashBuffer = await crypto.subtle.digest("SHA-256", urlBytes);
        const hash = new Uint8Array(hashBuffer);

        // Put hash into WASM memory
        const inputPointer = 1024;
        new Uint8Array(memory.buffer, inputPointer, 32).set(hash);

        // Run check function
        const result = check(inputPointer);
        if (result !== 1) {
            console.warn("WASM URL check failed.");
            return null;
        }

        // Helper to read WASM string parts
        function readWasmString(ptrFunction, lenFunction) {
            const ptr = ptrFunction();
            const len = lenFunction();
            const bytes = new Uint8Array(memory.buffer, ptr, len);
            return new TextDecoder().decode(bytes);
        }

        // Reconstruct token chunks A1 - A7
        const A1 = readWasmString(instance.exports.A1_ptr, instance.exports.A1_len);
        const A2 = readWasmString(instance.exports.A2_ptr, instance.exports.A2_len);
        const A3 = readWasmString(instance.exports.A3_ptr, instance.exports.A3_len);
        const A4 = readWasmString(instance.exports.A4_ptr, instance.exports.A4_len);
        const A5 = readWasmString(instance.exports.A5_ptr, instance.exports.A5_len);
        const A6 = readWasmString(instance.exports.A6_ptr, instance.exports.A6_len);
        const A7 = readWasmString(instance.exports.A7_ptr, instance.exports.A7_len);

        // Return completed token
        return "github_pat_"+A1 + A2 + A3 + A4 + A5 + A6 + A7;

    } catch (error) {
        console.error("check_url.js Error:", error);
        return null;
    }
}