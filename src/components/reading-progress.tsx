"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
    const [completion, setCompletion] = useState(0)

    useEffect(() => {
        const updateScrollCompletion = () => {
            const currentProgress = window.scrollY
            const scrollHeight = document.body.scrollHeight - window.innerHeight
            if (scrollHeight) {
                setCompletion(
                    Number((currentProgress / scrollHeight).toFixed(2)) * 100
                )
            }
        }

        window.addEventListener("scroll", updateScrollCompletion)

        return () => {
            window.removeEventListener("scroll", updateScrollCompletion)
        }
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-transparent pointer-events-none">
            <div
                className="h-full bg-[#00a2a2] transition-all duration-150 ease-out"
                style={{ width: `${completion}%` }}
            />
        </div>
    )
}
