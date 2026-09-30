import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";

import "../App.css";
import Header from "./Header";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 226;

const getFramePath = (index: number): string => {
    const frameNumber = String(index + 1).padStart(3, "0");

    return `/frames/ezgif-frame-${frameNumber}.jpg`;
};

function BuildingExperience() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sectionRef = useRef<HTMLElement | null>(null);

    const heroRef = useRef<HTMLDivElement | null>(null);
    const storyOneRef = useRef<HTMLDivElement | null>(null);
    const storyTwoRef = useRef<HTMLDivElement | null>(null);
    const storyThreeRef = useRef<HTMLDivElement | null>(null);
    const storyFourRef = useRef<HTMLDivElement | null>(null);
    const storyFiveRef = useRef<HTMLDivElement | null>(null);
    const storySixRef = useRef<HTMLDivElement | null>(null);
    const statsRef = useRef<HTMLDivElement | null>(null);

    const progressRef = useRef<HTMLSpanElement | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    // const [currentFrame, setCurrentFrame] = useState(1);

    useEffect(() => {
        const canvas = canvasRef.current;
        const section = sectionRef.current;

        if (!canvas || !section) {
            return;
        }

        const context = canvas.getContext("2d", {
            alpha: false,
        });

        if (!context) {
            return;
        }

        const images: HTMLImageElement[] = [];

        let loadedImages = 0;
        let destroyed = false;

        let targetFrame = 0;
        let smoothFrame = 0;
        let lastDrawnFrame = -1;

        let animationFrameId = 0;

        const animation = {
            frame: 0,
        };

        /*
        ========================================
        LOAD IMAGES
        ========================================
        */

        const preloadImages = (): Promise<void> => {
            return new Promise((resolve) => {
                for (let i = 0; i < FRAME_COUNT; i++) {
                    const image = new Image();

                    image.decoding = "async";
                    image.src = getFramePath(i);

                    image.onload = () => {
                        loadedImages++;

                        const percentage = Math.round(
                            (loadedImages / FRAME_COUNT) * 100
                        );

                        if (!destroyed) {
                            setLoadingProgress(percentage);
                        }

                        if (loadedImages === FRAME_COUNT) {
                            resolve();
                        }
                    };

                    image.onerror = () => {
                        console.warn(
                            `Failed to load ${getFramePath(i)}`
                        );

                        loadedImages++;

                        if (loadedImages === FRAME_COUNT) {
                            resolve();
                        }
                    };

                    images.push(image);
                }
            });
        };

        /*
        ========================================
        DRAW FRAME
        ========================================
        */

        const drawFrame = (index: number) => {
            const safeIndex = Math.max(
                0,
                Math.min(FRAME_COUNT - 1, Math.round(index))
            );

            const image = images[safeIndex];

            if (
                !image ||
                !image.complete ||
                !image.naturalWidth ||
                !image.naturalHeight
            ) {
                return;
            }

            const width = window.innerWidth;
            const height = window.innerHeight;

            const imageWidth = image.naturalWidth;
            const imageHeight = image.naturalHeight;

            /*
            Keep complete image visible
            */

            const scale = Math.min(
                width / imageWidth,
                height / imageHeight
            );

            const drawWidth = imageWidth * scale;
            const drawHeight = imageHeight * scale;

            const x = (width - drawWidth) / 2;
            const y = (height - drawHeight) / 2;

            /*
            Background
            */

            context.fillStyle = "#050505";

            context.fillRect(
                0,
                0,
                width,
                height
            );

            /*
            Building frame
            */

            context.drawImage(
                image,
                x,
                y,
                drawWidth,
                drawHeight
            );
        };

        /*
        ========================================
        CANVAS RESIZE
        ========================================
        */

        const resizeCanvas = () => {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            const width = window.innerWidth;
            const height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            context.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );

            lastDrawnFrame = -1;

            drawFrame(
                Math.round(smoothFrame)
            );
        };

        /*
        ========================================
        SMOOTH RENDER LOOP
        ========================================
        */

        const renderLoop = () => {
            if (destroyed) {
                return;
            }

            /*
            Smooth interpolation.

            Lower value = smoother
            Higher value = faster response
            */

            smoothFrame +=
                (targetFrame - smoothFrame) * 0.10;

            const frame = Math.round(smoothFrame);

            if (frame !== lastDrawnFrame) {
                drawFrame(frame);

                lastDrawnFrame = frame;

                if (!destroyed) {
                    setCurrentFrame(frame + 1);
                }
            }

            animationFrameId =
                requestAnimationFrame(renderLoop);
        };

        /*
        ========================================
        MAIN EXPERIENCE
        ========================================
        */

        const startExperience = async () => {
            await preloadImages();

            if (destroyed) {
                return;
            }

            /*
            First frame
            */

            resizeCanvas();

            targetFrame = 0;
            smoothFrame = 0;

            drawFrame(0);

            lastDrawnFrame = 0;

            /*
            Loading complete
            */

            setLoading(false);

            /*
            Start smooth canvas rendering
            */

            animationFrameId =
                requestAnimationFrame(renderLoop);

            /*
            ====================================
            GSAP CONTEXT
            ====================================
            */

            const ctx = gsap.context(() => {

                /*
                ==================================
                FRAME SCROLL ANIMATION
                ==================================
                */

                gsap.to(animation, {
                    frame: FRAME_COUNT - 1,

                    ease: "none",

                    scrollTrigger: {
                        trigger: section,

                        start: "top top",

                        end: "bottom bottom",

                        /*
                        Higher scrub =
                        smoother scroll response
                        */

                        scrub: 1.2,

                        onUpdate: (self) => {
                            targetFrame =
                                self.progress *
                                (FRAME_COUNT - 1);

                            if (progressRef.current) {
                                progressRef.current.style.width =
                                    `${self.progress * 100}%`;
                            }
                        },
                    },
                });

                /*
                ==================================
                HERO
                ==================================
                */

                if (heroRef.current) {
                    gsap.to(heroRef.current, {
                        opacity: 0,
                        y: -100,

                        scrollTrigger: {
                            trigger: section,

                            start: "top top",

                            end: "15% top",

                            scrub: 1,
                        },
                    });
                }

                const stories = [
                    storyOneRef,
                    storyTwoRef,
                    storyThreeRef,
                    storyFourRef,
                    storyFiveRef,
                    storySixRef,
                ];

                stories.forEach((storyRef, index) => {
                    if (!storyRef.current) return;

                    const start = 12 + index * 13;
                    const end = start + 10;

                    gsap.fromTo(
                        storyRef.current,
                        {
                            opacity: 0,
                            y: 40,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scrollTrigger: {
                                trigger: section,
                                start: `${start}% top`,
                                end: `${end}% top`,
                                scrub: 1,
                            },
                        }
                    );

                    gsap.to(storyRef.current, {
                        opacity: 0,
                        y: -40,
                        scrollTrigger: {
                            trigger: section,
                            start: `${end}% top`,
                            end: `${end + 3}% top`,
                            scrub: 1,
                        },
                    });
                });

                if (storyOneRef.current) {
                    const counters =
                        storyOneRef.current.querySelectorAll(".counter");

                    ScrollTrigger.create({
                        trigger: section,
                        start: "15% top",
                        once: true,

                        onEnter: () => {
                            counters.forEach((counter) => {
                                const target = Number(
                                    counter.getAttribute("data-target")
                                );

                                const obj = { value: 0 };

                                gsap.to(obj, {
                                    value: target,
                                    duration: 1.5,
                                    ease: "power2.out",

                                    onUpdate: () => {
                                        counter.textContent =
                                            Math.round(obj.value).toString();
                                    },
                                });
                            });
                        },
                    });
                }

            }, section);

            /*
            ====================================
            RESIZE
            ====================================
            */

            window.addEventListener(
                "resize",
                resizeCanvas
            );

            /*
            ====================================
            CLEANUP
            ====================================
            */

            return () => {
                destroyed = true;

                cancelAnimationFrame(
                    animationFrameId
                );

                window.removeEventListener(
                    "resize",
                    resizeCanvas
                );

                ctx.revert();
            };
        };

        let cleanup:
            | (() => void)
            | undefined;

        startExperience().then(
            (cleanupFunction) => {
                cleanup = cleanupFunction;
            }
        );

        /*
        ========================================
        COMPONENT CLEANUP
        ========================================
        */

        return () => {
            destroyed = true;

            cancelAnimationFrame(
                animationFrameId
            );

            cleanup?.();
        };

    }, []);

    return (
        <>
            {/* ================================
                LOADER
            ================================= */}

            {loading && (
                <div className="loader">
                    <div className="loader-inner">

                        <div className="loader-number">
                            {loadingProgress}%
                        </div>

                        <div className="loader-line">
                            <span
                                style={{
                                    width: `${loadingProgress}%`,
                                }}
                            />
                        </div>

                        <div className="loader-text">
                            Loading Experience
                        </div>

                    </div>
                </div>
            )}

            {/* ================================
                HEADER
            ================================= */}

            <Header />

            {/* ================================
                MAIN
            ================================= */}

            <main>

                <section
                    ref={sectionRef}
                    className="building-section"
                    style={{
                        position: "relative",
                        zIndex: 1,
                    }}
                >

                    {/* Canvas */}

                    <canvas
                        ref={canvasRef}
                        id="buildingCanvas"
                    />

                    {/* Overlay */}

                    <div className="screen-overlay" />

                    {/* ==========================
                        HERO
                    =========================== */}

                    <div
                        ref={heroRef}
                        className="hero-content"
                    >

                        <div className="eyebrow">
                            Architectural Design & Construction Consultants
                        </div>

                        <h1>
                            The Sangshan Global
                            <br />
                            Foundation
                        </h1>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project.
                        </p>

                        <div className="home-but">
                            <Link to="/contact" className="start-project-button">
                                <span>
                                    START YOUR PROJECT
                                    <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* ==========================
                        STORY ONE
                    =========================== */}

                    <div
                        ref={storyOneRef}
                        className="story story-one spl-story1"
                    >
                        <div className="eyebrow">
                                Sangshan Construction
                            </div>

                            <h1>
                                Our Exellence
                            </h1>

                        <div
                            ref={statsRef}
                            className="stats-section"
                        >



                            <div className="stats-item">
                                <h3>
                                    <span className="counter" data-target="20">0</span>+
                                </h3>
                                <p>Years of Experience</p>
                            </div>

                            <div className="stats-item">
                                <h3>
                                    <span className="counter" data-target="55">0</span>+
                                </h3>
                                <p>
                                    Expert Architects &<br />
                                    Engineers
                                </p>
                            </div>

                            <div className="stats-item">
                                <h3>
                                    <span className="counter" data-target="100">0</span>%
                                </h3>
                                <p>Client Satisfaction Rate</p>
                            </div>

                            <div className="stats-item">
                                <h3>
                                    <span className="counter" data-target="250">0</span>+
                                </h3>
                                <p>
                                    Successfully Delivered<br />
                                    Projects
                                </p>
                            </div>

                            <div className="stats-item">
                                <h3>
                                    <span className="counter" data-target="150">0</span>+
                                </h3>
                                <p>
                                    Trusted Vendors & Material<br />
                                    Partners
                                </p>
                            </div>

                        </div>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance, and cost efficiency compliance, and cost efficiency in every project.
                        </p>

                    </div>

                    {/* ==========================
                        STORY TWO
                    =========================== */}

                    <div
                        ref={storyTwoRef}
                        className="story story-two spl-story2"
                    >

                        <div className="story-number">
                            03
                        </div>

                        <h2>
                            Turnkey Projects, Delivered with Precision
                        </h2>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance, and cost efficiency compliance, and cost efficiency in every project.
                        </p>

                        <div className="home-but">
                            <Link to="/contact" className="start-project-button">
                                <span>
                                    OUR PROJECTS
                                    <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </Link>
                        </div>

                    </div>

                    {/* ==========================
                        STORY THREE
                    =========================== */}

                    <div
                        ref={storyThreeRef}
                        className="story story-three spl-story3"
                    >

                        <div className="story-number">
                            04
                        </div>

                        <h2>
                            Architectural & Construction Consultancy Services
                        </h2>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance.
                        </p>

                        <div className="home-but">
                            <Link to="/contact" className="start-project-button">
                                <span>
                                    OUR SERVICES
                                    <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </Link>
                        </div>

                    </div>

                    <div
                        ref={storyFourRef}
                        className="story story-four spl-story4"
                    >
                        <div className="story-number">
                            05
                        </div>

                        <h2>
                            Your Reliable Partner From <br /> Conept to Completion
                        </h2>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance.
                        </p>

                        <div className="home-but">
                            <Link to="/contact" className="start-project-button">
                                <span>
                                    ENQUIRE NOW
                                    <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </Link>
                        </div>
                    </div>


                    <div
                        ref={storyFiveRef}
                        className="story story-five spl-story5"
                    >
                        <div className="story-number">
                            06
                        </div>

                        <h2>
                            Voices of Trust From <br />Our Clients
                        </h2>

                        <p>
                            We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance.
                        </p>

                        <div className="home-but">
                            <Link to="/contact" className="start-project-button">
                                <span>
                                    CONTACT NOW
                                    <i className="fa-solid fa-arrow-right-long"></i>
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div
                        ref={storySixRef}
                        className="story story-six footer-story"
                    >
                        <div className="footer-inner">

                            <Link to="/" className="logo">
                                <img src="/logo.png" alt="Ryah" />
                            </Link>

                            <p>
                                We are architectural design and construction consultants delivering end-to-end solutions that unite creative vision, technical precision, and on-site execution. From concept to completion, we ensure quality, compliance, and cost efficiency in every project, compliance.
                            </p>

                            <div className="footer-links">
                                <Link to="/">
                                    <i className="fa-solid fa-angles-right"></i> HOME
                                </Link>

                                <Link to="/about">
                                    <i className="fa-solid fa-angles-right"></i> ABOUT US
                                </Link>

                                <Link to="/projects">
                                    <i className="fa-solid fa-angles-right"></i> OUR SERVICES
                                </Link>

                                <Link to="/services">
                                    <i className="fa-solid fa-angles-right"></i> GALLERY
                                </Link>

                                <Link to="/experience">
                                    <i className="fa-solid fa-angles-right"></i> TESTIMONIALS
                                </Link>

                                <Link to="/contact">
                                    <i className="fa-solid fa-angles-right"></i> CONTACT US
                                </Link>
                            </div>

                            <div className="footer-socials">

                                <a href="#" aria-label="Facebook">
                                    <i className="fa-brands fa-facebook-f"></i>
                                </a>

                                <a href="#" aria-label="Instagram">
                                    <i className="fa-brands fa-instagram"></i>
                                </a>

                                <a href="#" aria-label="Threads">
                                    <i className="fa-brands fa-threads"></i>
                                </a>

                            </div>

                            <div className="footer-bottom">

                                <div>
                                    Copyright © 2026
                                    <span> Sangshan Construction</span>.
                                    All rights reserved
                                </div>

                                <div className="footer-powered">
                                    Powered by:
                                    <img
                                        src="/mist-logo.png"
                                        alt="Mist Solutions"
                                    />
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* ==========================
                        PROGRESS
                    =========================== */}

         {/*           <div className="frame-progress">

                        <span>
                            {String(currentFrame).padStart(
                                3,
                                "0"
                            )}
                        </span>

                        <div className="progress-track">

                            <span
                                ref={progressRef}
                            />

                        </div>

                        <span>
                            {String(FRAME_COUNT).padStart(
                                3,
                                "0"
                            )}
                        </span>

                    </div>*/}

                </section>

                {/* ================================
                    PROJECT
                ================================= */}

                {/*
                <section
                    className="project-section"
                    id="project"
                    style={{
                        position: "relative",
                        zIndex: 20,
                        minHeight: "100vh",
                    }}
                >

                    <div className="project-inner">

                        <div className="eyebrow">
                            PROJECT / 02
                        </div>

                        <h2>
                            Architecture
                            <br />
                            Meets Experience.
                        </h2>

                        <p>
                            A visual exploration of
                            structure, space, materials
                            and contemporary architectural
                            design.
                        </p>

                    </div>

                </section>
                */}

            </main>
        </>
    );
}

export default BuildingExperience;
