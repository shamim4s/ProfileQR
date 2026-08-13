(async () => {

    const loading =
        document.getElementById("loading");

    const app =
        document.getElementById("app");

    const unauthorized =
        document.getElementById("unauthorized");

    const protectedData =
        document.getElementById("protectedData");


    function allow(data) {

        if (loading) {
            loading.style.display = "none";
        }

        if (unauthorized) {
            unauthorized.style.display = "none";
        }

        if (app) {
            app.style.display = "block";
        }

        /*
         * Show data received from WASM
         */

        if (protectedData) {
            protectedData.textContent = data;
        }
    }


    function deny() {

        if (loading) {
            loading.style.display = "none";
        }

        if (app) {
            app.style.display = "none";
        }

        if (unauthorized) {
            unauthorized.style.display = "block";
        }
    }


    try {

        // =====================================================
        // Load WASM
        // =====================================================

        const response =
            await fetch("./check_url.wasm", {
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                "Could not load check_url.wasm"
            );
        }


        const wasmBytes =
            await response.arrayBuffer();


        const wasm =
            await WebAssembly.instantiate(
                wasmBytes
            );


        const instance =
            wasm.instance;


        const memory =
            instance.exports.memory;


        const check =
            instance.exports.check;


        const getDataPtr =
            instance.exports.get_data_ptr;


        const getDataLen =
            instance.exports.get_data_len;


        if (
            !memory ||
            !check ||
            !getDataPtr ||
            !getDataLen
        ) {
            throw new Error(
                "Invalid WASM module"
            );
        }


        // =====================================================
        // Build current URL
        // =====================================================

        const origin =
            window.location.origin;


        let path =
            window.location.pathname;


        /*
         * Normalize trailing slash
         *
         * /ProfileQR
         * /ProfileQR/
         *
         * become the same URL
         */

        if (
            path.length > 1 &&
            path.endsWith("/")
        ) {
            path =
                path.slice(0, -1);
        }


        const currentUrl =
            origin + path;


        // =====================================================
        // SHA-256
        // =====================================================

        const encoder =
            new TextEncoder();


        const urlBytes =
            encoder.encode(currentUrl);


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                urlBytes
            );


        const hash =
            new Uint8Array(hashBuffer);


        // =====================================================
        // Put hash into WASM memory
        // =====================================================

        const inputPointer = 1024;


        new Uint8Array(
            memory.buffer,
            inputPointer,
            32
        ).set(hash);


        // =====================================================
        // Check URL
        // =====================================================

        const result =
            check(inputPointer);


        // =====================================================
        // URL MATCH
        // =====================================================

        if (result === 1) {

            /*
             * Get protected data location
             */

            const dataPtr =
                getDataPtr();


            /*
             * Get protected data length
             */

            const dataLen =
                getDataLen();


            /*
             * Read data directly from WASM memory
             */

            const bytes =
                new Uint8Array(
                    memory.buffer,
                    dataPtr,
                    dataLen
                );


            /*
             * Convert WASM bytes to text
             */

            const data =
                new TextDecoder().decode(bytes);


            /*
             * Send WASM data to HTML
             */

            allow(data);

        } else {

            // URL doesn't match
            deny();

        }

    } catch (error) {

        console.error(
            "URL check failed:",
            error
        );

        deny();

    }

})();