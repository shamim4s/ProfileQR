async function getWasmDetails() {
    try {
        const response = await fetch("./check_url.wasm", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to fetch check_url.wasm file");

        const wasmBytes = await response.arrayBuffer();
        const wasm = await WebAssembly.instantiate(wasmBytes);
        const instance = wasm.instance;
        const memory = instance.exports.memory;
        const check = instance.exports.check;

        // Current URL SHA-256 Hash setup
        const origin = window.location.origin;
        let path = window.location.pathname;
        if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
        const currentUrl = origin + path;

        const urlBytes = new TextEncoder().encode(currentUrl);
        const hashBuffer = await crypto.subtle.digest("SHA-256", urlBytes);
        const hash = new Uint8Array(hashBuffer);

        const inputPointer = 1024;
        new Uint8Array(memory.buffer, inputPointer, 32).set(hash);

        // Run WASM check
        const result = check(inputPointer);
        if (result !== 1) {
            return { success: false, error: "URL Hash check returned 0 (Unauthorized URL)" };
        }

        // String reader helper
        function readWasmString(ptrFunc, lenFunc) {
            const ptr = ptrFunc();
            const len = lenFunc();
            const bytes = new Uint8Array(memory.buffer, ptr, len);
            return new TextDecoder().decode(bytes);
        }

        const chunks = {
            A1: readWasmString(instance.exports.A1_ptr, instance.exports.A1_len),
            A2: readWasmString(instance.exports.A2_ptr, instance.exports.A2_len),
            A3: readWasmString(instance.exports.A3_ptr, instance.exports.A3_len),
            A4: readWasmString(instance.exports.A4_ptr, instance.exports.A4_len),
            A5: readWasmString(instance.exports.A5_ptr, instance.exports.A5_len),
            A6: readWasmString(instance.exports.A6_ptr, instance.exports.A6_len),
            A7: readWasmString(instance.exports.A7_ptr, instance.exports.A7_len)
        };

        const fullToken = Object.values(chunks).join("");

        return {
            success: true,
            chunks: chunks,
            fullToken: fullToken
        };

    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Fallback compatibility wrapper
async function getWasmToken() {
    const details = await getWasmDetails();
    return details.success ? details.fullToken : null;
}