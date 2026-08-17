import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./styles/transition.css";

const PANEL_COUNT = 3;
const PANEL_EASE = [0.34, 1.56, 0.64, 1];

const BASE_TIMING = {
    panelStaggerMs: 500,
    panelTravelMs: 1200,
    textInMs: 350,
    holdMs: 1800,
    textOutMs: 300,
};

const TARGET_TOTAL_MS = 6000;
const BASE_TOTAL_MS =
    BASE_TIMING.panelStaggerMs * (PANEL_COUNT - 1) +
    BASE_TIMING.panelTravelMs +
    BASE_TIMING.textInMs +
    BASE_TIMING.holdMs +
    BASE_TIMING.textOutMs +
    BASE_TIMING.panelStaggerMs * (PANEL_COUNT - 1) +
    BASE_TIMING.panelTravelMs;

const wait = (ms) => new Promise((resolve) => {
    window.setTimeout(resolve, ms);
});

const resolveSequence = (timing = {}) => {
    const merged = { ...BASE_TIMING, ...timing };
    const scale = TARGET_TOTAL_MS / BASE_TOTAL_MS;

    return {
        panelStaggerMs: merged.panelStaggerMs * scale,
        panelTravelMs: merged.panelTravelMs * scale,
        textInMs: merged.textInMs * scale,
        holdMs: merged.holdMs * scale,
        textOutMs: merged.textOutMs * scale,
    };
};

const pickRandomSentence = (sentences, lastIndexRef) => {
    if (!Array.isArray(sentences) || sentences.length === 0) {
        return "";
    }

    if (sentences.length === 1) {
        lastIndexRef.current = 0;
        return sentences[0];
    }

    let nextIndex = Math.floor(Math.random() * sentences.length);
    while (nextIndex === lastIndexRef.current) {
        nextIndex = Math.floor(Math.random() * sentences.length);
    }

    lastIndexRef.current = nextIndex;
    return sentences[nextIndex];
};

const RouteTransitionOverlay = forwardRef(function RouteTransitionOverlay(
    {
        sentences = [],
        accentColor = "#ff5733",
        timing,
    },
    ref
) {
    const [panelState, setPanelState] = useState("ready");
    const [messageState, setMessageState] = useState("hidden");
    const [message, setMessage] = useState("");
    const [isActive, setIsActive] = useState(false);
    const lastSentenceIndexRef = useRef(-1);
    const isRunningRef = useRef(false);
    const sequence = useMemo(() => resolveSequence(timing), [timing]);

    const play = useCallback(
        async (onCovered) => {
            if (isRunningRef.current) {
                return false;
            }

            isRunningRef.current = true;
            setIsActive(true);
            setMessage(pickRandomSentence(sentences, lastSentenceIndexRef));
            setMessageState("hidden");
            setPanelState("ready");
            await wait(16);

            setPanelState("entering");
            await wait(sequence.panelStaggerMs * (PANEL_COUNT - 1) + sequence.panelTravelMs);

            setPanelState("covered");
            setMessageState("visible");
            await wait(sequence.textInMs);

            if (onCovered) {
                await onCovered();
            }

            await wait(sequence.holdMs);

            setMessageState("hidden");
            await wait(sequence.textOutMs);

            setPanelState("exiting");
            await wait(sequence.panelStaggerMs * (PANEL_COUNT - 1) + sequence.panelTravelMs);

            setPanelState("exited");
            setIsActive(false);
            isRunningRef.current = false;
            return true;
        },
        [sentences, sequence]
    );

    useImperativeHandle(ref, () => ({
        play,
        isRunning: () => isRunningRef.current,
    }));

    return (
        <div className={`route-transition ${isActive ? "is-active" : ""}`} aria-hidden="true">
            <div className="route-transition__panels">
                {Array.from({ length: PANEL_COUNT }, (_, index) => {
                    const panelDelay = index * sequence.panelStaggerMs;
                    const commonTransition = {
                        duration: sequence.panelTravelMs / 1000,
                        delay: panelDelay / 1000,
                        ease: PANEL_EASE,
                    };

                    const animateY =
                        panelState === "ready"
                            ? "-120%"
                            : panelState === "entering" || panelState === "covered"
                                ? "0%"
                                : "120%";

                    const panelTransition =
                        panelState === "ready" || panelState === "covered" || panelState === "exited"
                            ? { duration: 0 }
                            : commonTransition;

                    return (
                        <motion.div
                            key={`route-transition-panel-${index}`}
                            className="route-transition__panel"
                            style={{ backgroundColor: accentColor }}
                            initial={false}
                            animate={{ y: animateY }}
                            transition={panelTransition}
                        />
                    );
                })}
            </div>

            <motion.p
                className="route-transition__message"
                initial={false}
                animate={{ opacity: messageState === "visible" ? 1 : 0 }}
                transition={{ duration: messageState === "visible" ? sequence.textInMs / 1000 : sequence.textOutMs / 1000 }}
            >
                {message}
            </motion.p>
        </div>
    );
});

export { BASE_TIMING, TARGET_TOTAL_MS };
export default RouteTransitionOverlay;
