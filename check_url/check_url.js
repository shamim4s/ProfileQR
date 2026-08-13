(async () => {
    const loading = document.getElementById("loading");
    const app = document.getElementById("app");
    const unauthorized = document.getElementById("unauthorized");

    function allow() {
        if (loading) loading.style.display = "none";
        if (unauthorized) unauthorized.style.display = "none";
        if (app) app.style.display = "block";
    }

    function deny() {
        if (loading) loading.style.display = "none";
        if (app) app.style.display = "none";
        if (unauthorized) unauthorized.style.display = "block";
    }

    try {
        // Load WASM
        const response = await fetch("./check_url.wasm", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load check_url.wasm");
        }

        const wasmBytes = await response.arrayBuffer();

        const wasm = await WebAssembly.instantiate(wasmBytes);

        const instance = wasm.instance;

        const memory = instance.exports.memory;
        const check = instance.exports.check;

        if (!memory || !check) {
            throw new Error("Invalid WASM module");
        }

        /*
         * Build the URL that we want to verify.
         *
         * Example:
         *
         * https://shamim4s.github.io/ProfileQR
         *
         * The URL itself is NEVER placed inside this script.
         */

        const origin = window.location.origin;

        let path = window.location.pathname;

        // Remove trailing slash
        if (path.length > 1 && path.endsWith("/")) {
            path = path.slice(0, -1);
        }

        const currentUrl = origin + path;

        /*
         * SHA-256
         */
        const encoder = new TextEncoder();

        const urlBytes = encoder.encode(currentUrl);

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            urlBytes
        );

        const hash = new Uint8Array(hashBuffer);

        /*
         * Copy the 32-byte SHA-256 hash
         * into WASM memory.
         *
         * 1024 is the memory location used for input.
         */

        const inputPointer = 1024;

        const wasmMemory =
            new Uint8Array(
                memory.buffer,
                inputPointer,
                32
            );

        wasmMemory.set(hash);

        /*
         * Ask WASM to compare:
         *
         * current URL hash
         *          vs
         * stored authorized hash
         */

        const result = check(inputPointer);

        if (result === 1) {
            allow();
        } else {
            deny();
        }

    } catch (error) {
        console.error("URL check failed:", error);
        deny();
    }
})();