import { useEffect, useState } from "react";
import { getPublicContent, resolveImageUrl } from "../utils/contentApi";
import Navbar from "../components/Navbar";

function Nosotros() {
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // El contenido de Equipo y Clientes viene de MySQL mediante la API.
  // Ya no se mantiene una lista fija en este componente.
  const [equipo, setEquipo] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargandoContenido, setCargandoContenido] = useState(true);

  useEffect(() => {
    let activo = true;

    Promise.all([getPublicContent("equipo"), getPublicContent("clientes")])
      .then(([equipoData, clientesData]) => {
        if (!activo) return;
        setEquipo(equipoData);
        setClientes(clientesData);
      })
      .catch((error) => {
        console.error("No se pudo cargar Equipo/Clientes desde la base de datos:", error);
        if (!activo) return;
        setEquipo([]);
        setClientes([]);
      })
      .finally(() => {
        if (activo) setCargandoContenido(false);
      });

    return () => { activo = false; };
  }, []);

  return (
    <>
      <Navbar />

      <main className="inner-page">

        {/* =========================
            ENCABEZADO
        ========================= */}

        <section className="page-hero">
          <div className="page-hero-content">

            <span className="section-label">
              S&A SANTANDER Y ASOCIADOS SAS
            </span>

            <h1>
              Ingeniería Estructural basada en
              <span> experiencia y confianza.</span>
            </h1>

            <p>
              Conozca nuestra trayectoria, nuestro equipo y los principios
              que orientan nuestro trabajo.
            </p>

          </div>
        </section>


        {/* =========================
            HISTORIA
        ========================= */}

        <section className="section">

          <div className="section-container two-column">

            <div>

              <span className="section-label">
                NUESTRA HISTORIA
              </span>

              <h2>
                Más de dos décadas construyendo soluciones de ingeniería
              </h2>

            </div>

            <div className="content-text">

              <p>
                S&A Santander y Asociados S.A.S. es una empresa colombiana
                de consultoría en ingeniería civil, especializada en diseño
                estructural, estudios integrales, interventoría y asesoría
                para proyectos de infraestructura y edificación.
              </p>

              <p>
                La empresa fue constituida en el año 2003 por profesionales
                con una amplia trayectoria en el desarrollo de proyectos de
                ingeniería.
              </p>

              <p>
                La experiencia acumulada por sus socios y profesionales ha
                permitido participar en proyectos de diferentes escalas y
                complejidades, manteniendo como prioridad la calidad técnica
                y el acompañamiento permanente al cliente.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            SOCIO FUNDADOR
        ========================= */}

        <section className="section gray-section">

          <div
            className="section-container"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(320px, 0.85fr) minmax(0, 1.4fr)",
              gap: "70px",
              alignItems: "center",
            }}
          >

            {/* =========================
                FOTOS
            ========================= */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "25px",
              }}
            >

              {/* FOTO PRINCIPAL */}

              <div
                style={{
                  width: "100%",
                  height: "390px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#e5e7eb",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.12)",
                }}
              >

                <img
                  src="public/images/PAPA/IMG_8525.jpg"
                  alt="Alfredo Santander"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

              </div>


              {/* SEGUNDA FOTO */}

              <div
                style={{
                  width: "100%",
                  height: "220px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#e5e7eb",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
                }}
              >

                <img
                  src="public/images/PAPA/IMG-6573.JPG"
                  alt="Reconocimiento de Alfredo Santander"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

              </div>

            </div>


            {/* =========================
                INFORMACIÓN DEL FUNDADOR
            ========================= */}

            <div className="content-text">

              <span className="section-label">
                A NUESTRO SOCIO FUNDADOR
              </span>

              <h2
                style={{
                  marginTop: "12px",
                  marginBottom: "25px",
                }}
              >
                Alfredo Santander
              </h2>

              <p>
                Alfredo Santander, ingeniero civil graduado de la Universidad
                Nacional de Colombia con Magister en estructuras de la misma
                universidad, trabajó en el sector público desde el año 1969
                hasta el año de 1977, en el ministerio de obras públicas y
                transporte, Fondo nacional de Caminos Vecinales, siempre
                dedicado a estudios y diseños.
              </p>

              <p>
                Después de 4 años de trabajar como independiente en el diseño
                de estructuras, en 1981 se asoció con dos ingenieros para
                fundar Proyectistas Civiles Asociados (PCA), la cual fue una
                de las principales compañías de Diseño estructural del país.
              </p>

              <p>
                Posteriormente en el año 2003 fundó S&A Santander & Asociados
                LTDA, junto a sus hijos Luis Fernando y Jorge Alfredo y
                acompañados por los ingenieros Ivonne Avendaño y Nelson Díaz.
              </p>

              <p>
                En su carrera profesional hizo el diseño estructural de cientos
                de puentes a lo largo y ancho del país en todo tipo de sistemas
                estructurales. Sirvió como perito en varios procesos y es
                debido a su gran trayectoria profesional y a los aportes
                importantes que hizo a la ingeniería del país por lo que le
                otorgaron varios premios.
              </p>

              <p>
                Entre los reconocimientos se destacan el Premio Guillermo
                González Zuleta (2009) de la Sociedad Colombia de Ingenieros,
                Premio póstumo “Lámpara de Diógenes” (2019) de la Asociación
                Colombiana de Ingeniería Sísmica – AIS y Docencia Excelente de
                la Universidad Nacional de Colombia – Sede Bogotá.
              </p>

              <p>
                Hoy en día seguimos su legado y continuamos trabajando con la
                misma pasión, dedicación y ética que nuestro socio fundador
                nos inculcó y así nos aseguraremos de darle bases sólidas a
                sus proyectos.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            PROPÓSITO
        ========================= */}

        <section className="section gray-section">

          <div className="section-container">

            <div className="section-heading-center">

              <span className="section-label">
                NUESTRO PROPÓSITO
              </span>

              <h2>
                Dar bases sólidas a sus proyectos
              </h2>

            </div>


            <div className="values-grid">

              <div className="value-card">

                <h3>CALIDAD</h3>

                <p>
                  Desarrollamos nuestros proyectos con criterios técnicos
                  y altos estándares de calidad.
                </p>

              </div>


              <div className="value-card">

                <h3>EXPERIENCIA</h3>

                <p>
                  Contamos con profesionales especializados y una amplia
                  trayectoria en ingeniería.
                </p>

              </div>


              <div className="value-card">

                <h3>CONFIANZA</h3>

                <p>
                  Acompañamos a nuestros clientes durante las diferentes
                  etapas de sus proyectos.
                </p>

              </div>


              <div className="value-card">

                <h3>SOLUCIONES</h3>

                <p>
                  Buscamos soluciones técnicas eficientes, seguras y
                  acordes con cada proyecto.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            MISIÓN Y VISIÓN
        ========================= */}

        <section className="section">

          <div className="section-container mission-grid">

            <div className="mission-card">

              <h2>
                Nuestra misión
              </h2>

              <p>
                Prestar servicios de consultoría e interventoría en
                ingeniería civil y arquitectura, especialmente en diseño
                estructural, estudios integrales y asesoría técnica,
                buscando la calidad, el cumplimiento de los compromisos
                y la satisfacción de nuestros clientes.
              </p>

            </div>


            <div className="mission-card">

              <h2>
                Nuestra visión
              </h2>

              <p>
                Ser reconocidos como una empresa líder por la alta calidad
                de sus servicios de consultoría e interventoría en
                ingeniería civil y arquitectura, participando en proyectos
                públicos y privados de diferentes sectores.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            EQUIPO
        ========================= */}

        <section className="section gray-section">

          <div className="section-container">

            <span className="section-label">
              EQUIPO S&A
            </span>

            <h2>
              Profesionales al servicio de cada proyecto
            </h2>

            {cargandoContenido && <p>Cargando equipo...</p>}


            <div className="team-grid">

              {equipo.map((persona) => (

                <div
                  className="team-card"
                  key={`${persona.titulo}-${persona.subtitulo || persona.categoria || persona.descripcion}`}
                >

                  {/* FOTO */}

                  <div className="team-photo">

                    <img
                      src={resolveImageUrl(persona.imagen)}
                      alt={`Foto de ${persona.titulo}`}
                    />

                  </div>


                  {/* NOMBRE */}

                  <h3>
                    {persona.titulo}
                  </h3>


                  {/* CARGO */}

                  <strong>
                    {persona.subtitulo || persona.categoria || persona.descripcion}
                  </strong>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* =========================
            NUESTROS CLIENTES
        ========================= */}

        <section className="section clients-section">

          <div className="section-container">

            <div className="section-heading-center">

              <span className="section-label">
                NUESTROS CLIENTES
              </span>

              <h2>
                Empresas que confían en nosotros
              </h2>

              <p className="clients-intro">
                Hemos tenido la oportunidad de trabajar junto a diferentes
                empresas y organizaciones en el desarrollo de proyectos
                de ingeniería.
              </p>

              {cargandoContenido && <p className="clients-intro">Cargando clientes...</p>}

            </div>


            {/* LOGOS */}

            <div className="clients-grid">

              {clientes
                .slice(0, mostrarTodos ? clientes.length : 6)
                .map((cliente) => (

                  <div
                    className="client-card"
                    key={cliente.id || cliente.slug}
                  >

                    <img
                      src={resolveImageUrl(cliente.imagen)}
                      alt={cliente.titulo || "Logo de cliente"}
                    />

                  </div>

                ))}

            </div>


            {/* BOTÓN */}

            {clientes.length > 6 && (

              <div className="clients-button-container">

                <button
                  className="clients-button"
                  onClick={() => setMostrarTodos(!mostrarTodos)}
                >

                  {mostrarTodos
                    ? "Ver menos"
                    : "Ver más clientes"}

                </button>

              </div>

            )}

          </div>

        </section>

      </main>
    </>
  );
}

export default Nosotros;