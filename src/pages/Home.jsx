import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const HOME_SLIDES = [
  // IMAGEN 1: cambia únicamente la ruta de imagen aquí.
  {
    subtitulo: "SANTANDER Y ASOCIADOS SAS",
    titulo: "Ingeniería estructural que construye confianza.",
    descripcion: "Soluciones de ingeniería, diseño estructural, consultoría e interventoría para proyectos de infraestructura y edificación.",
    imagen: "/images/INFO BASE WEB/EDIFICIOS/8-1. ALLURE.png",
    collage: [
      "/images/INFO BASE WEB/EDIFICIOS/8-1. ALLURE.png",
      "/images/infra_2.jfif",
      "/images/pte_2.jfif",
      "/images/pte_3.jfif",
      "/images/trasnmi_2.jfif",
      "/images/pte_eden_2perspectiva.jfif",
      "/images/puente_1.jfif",
      "/images/infra.jfif"
    ],
  },
  // IMAGEN 2: cambia únicamente la ruta de imagen aquí.
  {
    subtitulo: "INFRAESTRUCTURA Y PUENTES",
    titulo: "Estructuras para grandes proyectos.",
    descripcion: "Diseño y consultoría estructural para obras de infraestructura seguras, eficientes y duraderas.",
    imagen: "/images/INFO BASE WEB/puentes/PUENTES/10. PTE GUAYURIBA - META.png",
  },
  // IMAGEN 3: cambia únicamente la ruta de imagen aquí.
  {
    subtitulo: "EDIFICACIÓN",
    titulo: "Diseño que hace posible avanzar.",
    descripcion: "Experiencia técnica para proyectos residenciales, comerciales e industriales.",
    imagen: "/images/Fotos/Vivienda/Allure Cartagena - KMA.jfif",
  },
];

function Home() {
  const [slides] = useState(HOME_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide] || slides[0];
  const slideImage = encodeURI(slide.imagen);
  const isCollageSlide = activeSlide === 0;

  return (
    <>
      <Navbar />


      <main>

        {/* HERO */}
        <section className={`hero${isCollageSlide ? " hero--collage" : ""}`} style={isCollageSlide ? undefined : { backgroundImage: slideImage ? `linear-gradient(rgba(5, 15, 28, .24), rgba(5, 15, 28, .24)), url(${slideImage})` : "linear-gradient(135deg, #152b40, #304d63)" }}>

          {isCollageSlide && (
            <div className="hero-collage" aria-hidden="true">
              {slide.collage.map((image) => (
                <img src={encodeURI(image)} alt="" key={image} />
              ))}
            </div>
          )}

          <div className="hero-overlay"></div>

          <div className="hero-content">

            <p className="hero-subtitle">{slide.subtitulo || "SANTANDER Y ASOCIADOS"}</p>

            <h1>{slide.titulo}</h1>

            <p className="hero-description">{slide.descripcion}</p>

            <div className="hero-buttons">

              <a href="#proyectos" className="btn-primary">
                Ver proyectos
              </a>

              <a href="#servicios" className="btn-secondary">
                Nuestros servicios
              </a>
            </div>

          </div>

          {slides.length > 1 && (
            <div className="hero-carousel-controls" aria-label="Controles del slider">
              <button type="button" onClick={() => setActiveSlide((current) => (current - 1 + slides.length) % slides.length)} aria-label="Diapositiva anterior">&#8592;</button>
              <div className="hero-carousel-dots">
                {slides.map((currentSlide, index) => (
                  <button
                    type="button"
                    className={index === activeSlide ? "is-active" : ""}
                    key={currentSlide.id || index}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Ir a la diapositiva ${index + 1}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => setActiveSlide((current) => (current + 1) % slides.length)} aria-label="Siguiente diapositiva">&#8594;</button>
            </div>
          )}

          <div className="hero-scroll">
            <span></span>
            Desliza para conocer más
          </div>

        </section>


        {/* PRESENTACIÓN */}
        <section className="section about-preview">

          <div className="section-container">

            <div className="section-heading">

              <span className="section-label">
                S&A SANTANDER Y ASOCIADOS SAS
              </span>

              <h2>
                Experiencia y conocimiento
                al servicio de la ingeniería
              </h2>

            </div>

            <div className="about-text">

              <p>
                Somos una empresa especializada en servicios
                de ingeniería y consultoría, comprometida con
                el desarrollo de soluciones técnicas para
                proyectos de infraestructura y edificación.
              </p>

              <a href="/nosotros" className="text-link">
                Conozca nuestra historia →
              </a>

            </div>

          </div>

        </section>


        {/* SERVICIOS */}
        <section
          id="servicios"
          className="section services-preview"
        >

          <div className="section-container">

            <span className="section-label">
              NUESTROS SERVICIOS
            </span>

            <h2>
              Soluciones integrales
              de ingeniería
            </h2>

            <div className="services-grid">

              <div className="service-card">
                <h3>DISEÑO ESTRUCTURAL</h3>
                <p>
                  Soluciones estructurales para diferentes
                  tipos de proyectos.
                </p>
              </div>

              <div className="service-card">
                <h3>INTERVENTORÍA</h3>
                <p>
                  Acompañamiento y control técnico
                  durante la ejecución de proyectos.
                </p>
              </div>

              <div className="service-card">
                <h3>INFRAESTRUCTURA</h3>
                <p>
                  Diseño y consultoría para proyectos
                  de infraestructura.
                </p>
              </div>

              <div className="service-card">
                <h3>EDIFICACIONES</h3>
                <p>
                  Diseño estructural para proyectos
                  residenciales, comerciales e industriales.
                </p>
              </div>

            </div>

            <a href="/servicios" className="section-button">
              Ver todos los servicios →
            </a>

          </div>

        </section>


        {/* PROYECTOS */}
        <section
          id="proyectos"
          className="section projects-preview"
        >

          <div className="section-container">

            <span className="section-label">
              NUESTROS PROYECTOS
            </span>

            <h2>
              Obras que hablan
              por nuestra experiencia
            </h2>

            <div className="projects-placeholder">
              <div className="projects-photo-grid">
                <img
                  src="/images/Fotos/Puentes/Puente Sisga - BTS.jfif"
                  alt="Puente El Embalse del Sisga"
                />
                <img
                  src="/images/Fotos/Comercio/CC Gran plaza Soacha Consorcio Conconcreto y Carlos Collins.jpeg"
                  alt="Gran Plaza Soacha"
                />
                <img
                  src="/images/Fotos/Institucionales/Estación Cabecera Américas - Transmilenio.png"
                  alt="Estación Cabecera Américas"
                />
              </div>
            </div>

            <a href="/proyectos" className="section-button">
              Explorar proyectos →
            </a>

          </div>

        </section>


        {/* CONTACTO */}
        <section className="contact-banner">

          <div className="contact-banner-content">

            <span className="section-label">
              HABLEMOS DE SU PROYECTO
            </span>

            <h2>
              ¿Tiene un proyecto
              en mente?
            </h2>

            <a href="/contacto" className="btn-primary">
              Contáctenos
            </a>

          </div>

        </section>

      </main>
    </>
  );
}

export default Home;
