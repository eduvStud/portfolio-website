import { useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useContent } from "../content-store";
import "../styles/about.css";

const aboutNavLinks = [
  { label: "About me", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

const AboutPage = () => {
  const { content } = useContent();

  useEffect(() => {
    const cards = document.querySelectorAll(".about-main .spotlight-card");

    const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      event.currentTarget.style.setProperty("--mouse-x", `${x}px`);
      event.currentTarget.style.setProperty("--mouse-y", `${y}px`);
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleMouseMove);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleMouseMove);
      });
    };
  }, []);

  return (
    <>
      <Navbar
        brand={content.profile.shortName}
        brandHref="/"
        activeLabel="About me"
        links={aboutNavLinks}
      />

      <main className="about-main">
        <section className="about-hero">
          <h1>VUSANI EARL</h1>
          <div className="about-hero-glow" aria-hidden="true" />
        </section>

        <section className="about-row about-row-architect">
          <div className="about-media">
            <img
              alt="Vusani Earl Portrait"
              src="/media/AWS02.jpeg"
            />
          </div>
          <div className="about-panel spotlight-card">
            <div className="about-panel-inner">
              <h2>Who Am I??</h2>
              <p>
                My name is Vusani Earl Mulaudzi sometimes known as Sir Earl on socials or V/Ani to my closest of friends.
                I am a Software Engineering Student at Eduvos, as of 2026 i am studying my second year. I am an ordinary proud venda man forged by village principles
                and refined by the city with a strong love for showing creativity and creating in such a way that i can leave an impact to those who study me through my work 


              </p>
            </div>
          </div>
        </section>

        <section className="about-row about-row-academic">
          <div className="about-panel about-panel-low spotlight-card">
            <div className="about-panel-inner">
              <h3 className="text-primary">Foundation</h3>
              <p>
                I have a decently strong academic foundation which starts from a short course i took shortly after matric and have built a solid
                ground to work on with the bachelor in Science that i am currently studying along with the many skills ive gained on SQL databases, web development through javascript, css, html and react
                along with a minimum of intermediate knowledge on programming languages such as C++, java and python.
              </p>
            </div>
          </div>
          <div className="about-media">
            <img
              alt="Education Sketch"
              className="blend-luminosity"
              src="/media/helloworld.jpeg"
            />
          </div>
        </section>

        <section className="about-row about-row-genesis">
          <div className="about-media">
            <img
              alt="Genesis Sketch"
              className="blend-luminosity"
              src="/media/SUIT01.jpeg"
            />
          </div>
          <div className="about-panel spotlight-card">
            <div className="about-panel-inner">
              <h3 className="text-tertiary">My Story</h3>
              <p>
                My love for development has always been evident with my interest in always trying to solve problems even at an early age i had a little book in which i would write down and sketch ideas on how to solve multiple problems 
                such as polution with a robot that could suck in and purify air around all the smoke stacks that eskom would use to generate electricity. i love reading and one of my favourite books back then was a guinness world record book 
                and i would spend hours on youtube and television watching national geography documentaries and just trying to learn and to solve instead of watching cartoons all the time like a normal boy but i always ask myself, do i really care about ordinary.
                so combining my scientific mindset and curiosity with my love for technology led to me choosing  Software Engineering ,it was a no brainer really.
              </p>
            </div>
          </div>
        </section>

        <section className="about-row about-row-beyond">
          <div className="about-panel about-panel-container spotlight-card">
            <div className="about-panel-inner">
              <h3>Beyond the Terminal</h3>
              <p className="lead">
                Besides getting ragebaited by silly syntex errors and IDE error code messages i do alot of things including gaming, reading.....watching more documentaries and procrastinating myself into trying to solve more problems. Who am i kidding i dont do alot outside of developing and planning on developing even if it means
                i miss out on sleep sometimes but what can you say about loving something so deeply that it forms part of your daily life other than to embrace and improve on it everyday
              </p>
            </div>
          </div>
          <div className="about-media">
            <img
              alt="Beyond Terminal Sketch"
              className="blend-luminosity"
              src="/media/nightskypic.jpeg"
            />
          </div>
        </section>

        <section className="about-row about-row-systems">
          <div className="about-media">
            <img
              alt="Landscape"
              className="blend-luminosity"
              src="/media/RANDOM04.jpeg"
            />
          </div>
          <div className="about-panel spotlight-card">
            <div className="about-panel-inner">
              <h3 className="text-tertiary">Systems Thinking</h3>
              <ul className="about-list">
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    code_blocks
                  </span>
                  <span>Modular Architecture: Building decoupled components for maximum reusability.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    speed
                  </span>
                  <span>Performance First: Optimizing rendering pathways as a baseline requirement.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    design_services
                  </span>
                  <span>Design Fidelity: trying to create something that pleases the eye and not AI slop.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-row about-row-arsenal">
          <div className="about-panel about-panel-lowest spotlight-card">
            <div className="about-panel-inner">
              <h3 className="text-primary">Technical Arsenal</h3>
              <div className="about-arsenal">
                <div className="about-arsenal-card">
                  <p className="arsenal-label text-primary">FRONTEND</p>
                  <p>React, Tailwind</p>
                </div>
                <div className="about-arsenal-card">
                  <p className="arsenal-label text-tertiary">BACKEND</p>
                  <p>Node.js, Python, PostgreSQL</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-media">
            <img
              alt="Technical Arsenal"
              className="blend-luminosity"
              src="/media/AWS01.jpeg"
            />
          </div>
        </section>
      </main>

      <Footer brand="VUSANI EARL" copyright="© 2026 Vusani Earl Mulaudzi." />
    </>
  );
};

export default AboutPage;
