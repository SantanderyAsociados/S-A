import { useState } from "react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";

import {
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from "../config/email";
import { API_BASE_URL } from "../config/api";

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });

  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.nombre ||
      !formData.email ||
      !formData.mensaje
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa nombre, correo y mensaje.",
      });

      return;
    }

    setEnviando(true);

    try {
      /*
       * 1. Guardamos el mensaje en nuestro backend
       */

      const responseBackend = await fetch(
        `${API_BASE_URL}/api/mensajes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const backendData = await responseBackend.json().catch(() => ({}));

      if (!responseBackend.ok) {
        throw new Error(backendData.message || "No se pudo guardar el mensaje");
      }

      /*
       * 2. Enviamos el correo mediante EmailJS
       */

      const emailjsConfigured = [
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        EMAILJS_PUBLIC_KEY,
      ].every(
        (value) => value && !value.startsWith("TU_")
      );

      let emailSent = false;
      let emailErrorMessage = "";

      if (emailjsConfigured) {
        try {
          const templateParams = {
            name: formData.nombre,
            from_name: formData.nombre,
            nombre: formData.nombre,
            email: formData.email,
            user_email: formData.email,
            reply_to: formData.email,
            telefono: formData.telefono,
            asunto: formData.asunto,
            title: formData.asunto || "Nueva solicitud de contacto",
            time: new Date().toLocaleString("es-CO"),
            message: formData.mensaje,
            mensaje: formData.mensaje,
          };

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            { publicKey: EMAILJS_PUBLIC_KEY }
          );
          emailSent = true;
        } catch (emailError) {
          console.error("EmailJS no pudo enviar el correo:", emailError);
          emailErrorMessage = emailError?.text || emailError?.message || "Revisa el Service ID, Template ID y Public Key.";
        }
      }

      Swal.fire({
        icon: "success",
        title: emailSent ? "Mensaje enviado" : "Solicitud recibida",
        text: emailSent
          ? "Gracias por contactarnos. Hemos recibido su mensaje correctamente."
          : emailjsConfigured
            ? `Tu mensaje quedó guardado correctamente, pero EmailJS respondió: ${emailErrorMessage}`
            : "Tu mensaje quedó guardado correctamente. El correo automático aún no está configurado.",
        confirmButtonText: "Aceptar",
      });

      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
      });
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "No se pudo enviar",
        text: "Ocurrió un problema al enviar el mensaje. Inténtalo nuevamente.",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="inner-page">

        <section className="page-hero">
          <div className="page-hero-content">
            <span>CONTACTO</span>

            <h1>
              Hablemos de su
              <span> proyecto.</span>
            </h1>

            <p>
              Estamos disponibles para conocer sus
              necesidades y ofrecer soluciones de
              ingeniería.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="section-container">

            <div className="contact-grid">

              <div className="contact-information">

                <span className="section-label">
                  CONTÁCTENOS
                </span>

                <h2>
                 En que podemos ayudarle
                </h2>

                <p>
                  Si desea conocer más sobre nuestros
                  servicios o tiene un proyecto en
                  desarrollo, puede comunicarse con
                  nosotros.
                </p>
                <p>Si deseas hacer parte de nuestro equipo, envíanos tu hoja de vida a la siguiente dirección de correo electrónico.</p>

                <div className="contact-item">
                  <div className="contact-icon">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <strong>Dirección</strong>

                    <p>
                      Calle 98 # 18–71 Oficina 406
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Phone size={22} />
                  </div>

                  <div>
                    <strong>Teléfono</strong>
                    <p>
                      311 561 1346
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <Mail size={22} />
                  </div>

                  <div>
                    <strong>Correo</strong>

                    <p>
                      sya@sya.com.co
                    </p>
                  </div>
                </div>

              </div>

              <div className="contact-form-container">

                <div className="contact-form-heading">
                  <span className="contact-form-kicker">CUÉNTENOS SU IDEA</span>
                  <h2>Iniciemos una conversación</h2>
                  <p>Complete el formulario y nuestro equipo se pondrá en contacto con usted.</p>
                </div>

                <form
                  className="contact-form"
                  onSubmit={handleSubmit}
                >

                  <div className="form-row">
                    <div className="form-group">
                    <label htmlFor="nombre">
                      Nombre *
                    </label>

                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Su nombre"
                      required
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="email">
                      Correo electrónico *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                    <label htmlFor="telefono">
                      Teléfono
                    </label>

                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Su número de teléfono"
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="asunto">
                      Asunto
                    </label>

                    <input
                      id="asunto"
                      name="asunto"
                      type="text"
                      value={formData.asunto}
                      onChange={handleChange}
                      placeholder="Asunto"
                    />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mensaje">
                      Mensaje *
                    </label>

                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows="6"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntenos sobre su proyecto..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-button"
                    disabled={enviando}
                  >
                    {enviando ? (
                      "Enviando..."
                    ) : (
                      <>
                        Enviar mensaje
                        <Send size={18} />
                      </>
                    )}
                  </button>

                  <p className="form-note">
                    Sus datos se utilizarán únicamente para responder a su solicitud.
                  </p>

                </form>

              </div>

            </div>

          </div>
        </section>

      </main>
    </>
  );
}

export default Contacto;