(module

    ;; One page of WebAssembly memory
    (memory (export "memory") 1)

    ;; The authorized URL is stored INSIDE WASM.
    ;;
    ;; This is intentionally not placed in check_url.js.
    (data (i32.const 0)
        "https://shamim4s.github.io/ProfileQR"
    )

    ;; ---------------------------------------------------------
    ;; check(ptr, len)
    ;;
    ;; Returns:
    ;;   1 = authorized
    ;;   0 = unauthorized
    ;; ---------------------------------------------------------
    (func (export "check")
        (param $ptr i32)
        (param $len i32)
        (result i32)

        (local $i i32)
        (local $a i32)
        (local $b i32)

        ;; Valid URL lengths:
        ;;
        ;; /ProfileQR
        ;; /ProfileQR/
        ;;
        ;; Base URL length = 36
        ;;
        ;; Reject anything shorter than 36
        (if
            (i32.lt_u
                (local.get $len)
                (i32.const 36)
            )
            (then
                (return (i32.const 0))
            )
        )

        ;; Reject anything longer than 37
        (if
            (i32.gt_u
                (local.get $len)
                (i32.const 37)
            )
            (then
                (return (i32.const 0))
            )
        )

        ;; Compare the first 36 bytes
        (local.set $i (i32.const 0))

        (block $finished

            (loop $compare

                ;; If i >= 36, comparison is finished
                (br_if $finished
                    (i32.ge_u
                        (local.get $i)
                        (i32.const 36)
                    )
                )

                ;; Load byte from supplied URL
                (local.set $a
                    (i32.load8_u
                        (i32.add
                            (local.get $ptr)
                            (local.get $i)
                        )
                    )
                )

                ;; Load byte from authorized URL in WASM
                (local.set $b
                    (i32.load8_u
                        (local.get $i)
                    )
                )

                ;; If different -> unauthorized
                (if
                    (i32.ne
                        (local.get $a)
                        (local.get $b)
                    )
                    (then
                        (return (i32.const 0))
                    )
                )

                ;; i++
                (local.set $i
                    (i32.add
                        (local.get $i)
                        (i32.const 1)
                    )
                )

                (br $compare)
            )
        )

        ;; If exactly 36 characters:
        ;; https://shamim4s.github.io/ProfileQR
        (if
            (i32.eq
                (local.get $len)
                (i32.const 36)
            )
            (then
                (return (i32.const 1))
            )
        )

        ;; If length is 37, allow a final "/"
        (if
            (i32.eq
                (i32.load8_u
                    (i32.add
                        (local.get $ptr)
                        (i32.const 36)
                    )
                )
                (i32.const 47)
            )
            (then
                (return (i32.const 1))
            )
        )

        ;; Otherwise unauthorized
        (i32.const 0)
    )
)