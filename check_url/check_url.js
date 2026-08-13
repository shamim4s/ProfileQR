(async () => {

    const loading =
        document.getElementById("loading");

    const app =
        document.getElementById("app");

    const unauthorized =
        document.getElementById("unauthorized");

    const protectedData =
        document.getElementById("protectedData");


    function deny() {

        if (loading)
            loading.style.display = "none";

        if (app)
            app.style.display = "none";

        if (unauthorized)
            unauthorized.style.display = "block";
    }


    function allow(DATA) {

        if (loading)
            loading.style.display = "none";

        if (unauthorized)
            unauthorized.style.display = "none";

        if (app)
            app.style.display = "block";


        /*
         * Your final value
         */

        const result =
            "test_string_" + DATA;


        if (protectedData) {
            protectedData.textContent = result;
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
                "Unable to load WASM"
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


        // =====================================================
        // Build current URL
        // =====================================================

        const origin =
            window.location.origin;

        let path =
            window.location.pathname;


        /*
         * Remove trailing slash
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

        const urlBytes =
            new TextEncoder().encode(
                currentUrl
            );


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                urlBytes
            );


        const hash =
            new Uint8Array(hashBuffer);


        // =====================================================
        // Put hash into WASM
        // =====================================================

        const inputPointer =
            1024;


        new Uint8Array(
            memory.buffer,
            inputPointer,
            32
        ).set(hash);


        // =====================================================
        // CHECK URL
        // =====================================================

        const result =
            check(inputPointer);


        // =====================================================
        // URL DOES NOT MATCH
        // =====================================================

        if (result !== 1) {

            deny();

            return;
        }


        // =====================================================
        // URL MATCHED
        //
        // Now retrieve A1-A7 from WASM
        // =====================================================

        function readWasmString(
            ptrFunction,
            lenFunction
        ) {

            const ptr =
                ptrFunction();

            const len =
                lenFunction();


            const bytes =
                new Uint8Array(
                    memory.buffer,
                    ptr,
                    len
                );


            return new TextDecoder()
                .decode(bytes);
        }


        const A1 =
            readWasmString(
                instance.exports.A1_ptr,
                instance.exports.A1_len
            );


        const A2 =
            readWasmString(
                instance.exports.A2_ptr,
                instance.exports.A2_len
            );


        const A3 =
            readWasmString(
                instance.exports.A3_ptr,
                instance.exports.A3_len
            );


        const A4 =
            readWasmString(
                instance.exports.A4_ptr,
                instance.exports.A4_len
            );


        const A5 =
            readWasmString(
                instance.exports.A5_ptr,
                instance.exports.A5_len
            );


        const A6 =
            readWasmString(
                instance.exports.A6_ptr,
                instance.exports.A6_len
            );


        const A7 =
            readWasmString(
                instance.exports.A7_ptr,
                instance.exports.A7_len
            );


        // =====================================================
        // Reconstruct DATA
        // =====================================================

        const DATA =
            A1 +
            A2 +
            A3 +
            A4 +
            A5 +
            A6 +
            A7;


        // =====================================================
        // Send to HTML
        // =====================================================

        allow(DATA);


    } catch (error) {

        console.error(
            "Authorization error:",
            error
        );

        deny();
    }

})();