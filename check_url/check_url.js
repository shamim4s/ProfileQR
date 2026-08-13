(async () => {
    const loading = document.getElementById("loading");
    const app = document.getElementById("app");
    const unauthorized = document.getElementById("unauthorized");

    function deny() {
        loading.style.display = "none";
        app.style.display = "none";
        unauthorized.style.display = "block";
    }

    function allow() {
        loading.style.display = "none";
        unauthorized.style.display = "none";
        app.style.display = "block";
    }

    try {
        let wasm;

        /*
         * Try streaming compilation first.
         * If the server does not provide the correct WASM MIME type,
         * fall back to ArrayBuffer loading.
         */
        try {
            wasm = await WebAssembly.instantiateStreaming(
                fetch("./check_url.wasm", {
                    cache: "no-store"
                })
            );
        } catch (e) {
            const response = await fetch("./check_url.wasm", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("WASM file could not be loaded");
            }

            const bytes = await response.arrayBuffer();

            wasm = await WebAssembly.instantiate(bytes);
        }

        const instance = wasm.instance;
        const memory = instance.exports.memory;
        const check = instance.exports.check;

        if (!memory || !check) {
            throw new Error("Invalid WASM module");
        }

        /*
         * Only the CURRENT URL is supplied to WASM.
         *
         * The expected/authorized URL is stored inside the WASM.
         */
        const currentUrl =
            window.location.origin +
            window.location.pathname;

        const encoder = new TextEncoder();
        const bytes = encoder.encode(currentUrl);

        /*
         * WASM memory starts with the application's internal
         * expected URL, so use a safe area after it.
         */
        const ptr = 512;

        new Uint8Array(memory.buffer, ptr, bytes.length)
            .set(bytes);

        const result = check(ptr, bytes.length);

        if (result === 1) {
            allow();
        } else {
            deny();
        }

    } catch (error) {
        console.error(error);
        deny();
    }
})();