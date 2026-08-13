(module

    ;; =========================================================
    ;; Memory
    ;; =========================================================

    (memory (export "memory") 1)


    ;; =========================================================
    ;; Dummy SHA-256
    ;;
    ;; IMPORTANT:
    ;; Replace these 32 bytes with YOUR real SHA-256 hash.
    ;;
    ;; Dummy:
    ;;
    ;; 00 11 22 33 44 55 66 77
    ;; 88 99 aa bb cc dd ee ff
    ;; 10 21 32 43 54 65 76 87
    ;; 98 a9 ba cb dc ed ee ff
    ;; =========================================================

    (data (i32.const 0)
        "\8d\d8\e9\1f\00\ff\91\20"
"\72\f3\5f\8f\8b\6d\94\94"
"\3d\7a\37\6f\cf\e5\2b\5e"
"\df\fe\a0\d9\e6\3a\75\d5"
    )


    ;; =========================================================
    ;; check(pointer)
    ;;
    ;; pointer = location of the SHA-256 calculated by JavaScript
    ;;
    ;; return:
    ;;   1 = authorized
    ;;   0 = unauthorized
    ;; =========================================================

    (func (export "check")
        (param $ptr i32)
        (result i32)

        (local $i i32)
        (local $inputByte i32)
        (local $storedByte i32)


        ;; Start at byte 0
        (local.set $i
            (i32.const 0)
        )


        ;; =====================================================
        ;; Compare all 32 SHA-256 bytes
        ;; =====================================================

        (block $done

            (loop $compare

                ;; If i >= 32, comparison is complete
                (br_if $done

                    (i32.ge_u
                        (local.get $i)
                        (i32.const 32)
                    )
                )


                ;; ---------------------------------------------
                ;; Get byte from JavaScript-provided hash
                ;; ---------------------------------------------

                (local.set $inputByte

                    (i32.load8_u

                        (i32.add
                            (local.get $ptr)
                            (local.get $i)
                        )

                    )
                )


                ;; ---------------------------------------------
                ;; Get byte from stored hash
                ;; ---------------------------------------------

                (local.set $storedByte

                    (i32.load8_u

                        (local.get $i)

                    )
                )


                ;; ---------------------------------------------
                ;; Compare
                ;; ---------------------------------------------

                (if

                    (i32.ne
                        (local.get $inputByte)
                        (local.get $storedByte)
                    )

                    (then

                        ;; Different byte = unauthorized
                        (return
                            (i32.const 0)
                        )

                    )
                )


                ;; ---------------------------------------------
                ;; i++
                ;; ---------------------------------------------

                (local.set $i

                    (i32.add
                        (local.get $i)
                        (i32.const 1)
                    )

                )


                ;; Continue loop
                (br $compare)
            )
        )


        ;; =====================================================
        ;; All 32 bytes matched
        ;; =====================================================

        (i32.const 1)

    )
)