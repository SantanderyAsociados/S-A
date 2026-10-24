import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle,
  ChevronRight,
  Clock3,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  RefreshCw,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../config/api";
import clientes from "../data/clientes";
import noticias from "../data/noticias";
import proyectos from "../data/proyectos";
import servicios from "../data/servicios";
import { createContent, deleteContent, getAdminContent, getPublicContent, resolveImageUrl, updateContent } from "../utils/contentApi";
import { createUser, deleteUser, getUsers, updateUser } from "../utils/usersApi";
import { createHourRecord, deleteHourRecord, getHourRecords, updateHourRecord } from "../utils/horasApi";
import { getAdminConfig, updateAdminConfig } from "../utils/configApi";
import "../styles/admin.css";

const HERO_FALLBACK_IMAGE = "/images/Fotos/Puentes/Puente Sisga - BTS.jfif";

const menuItems = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "servicios", label: "Servicios", icon: BriefcaseBusiness },
  { id: "noticias", label: "Blog / Noticias", icon: FileText },
  { id: "slider", label: "Slider principal", icon: GalleryHorizontalEnd },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "equipo", label: "Equipo - Nosotros", icon: Users },
  { id: "experiencia", label: "Galería experiencia", icon: GalleryHorizontalEnd },
  { id: "mensajes", label: "Mensajes", icon: MessageSquare },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "horas", label: "Registro de horas", icon: Clock3 },
];

const ROLE_PERMISSIONS = {
  Administrador: ["content.create", "content.edit", "content.publish", "content.delete", "messages.manage", "users.manage", "settings.manage", "hours.read", "hours.create"],
  Trabajador: ["hours.create"],
  Autor: ["content.create", "content.edit", "content.publish"],
  Colaborador: ["content.create"],
  Suscriptor: [],
};

function mostrarRol(role) {
  if (role === "admin" || role === "Administrador") return "Administrador";
  if (role === "Editor") return "Trabajador";
  return role || "Suscriptor";
}

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("sya_admin_user") || "null");
  const role = mostrarRol(user?.role);
  const [activeView, setActiveView] = useState(role === "Trabajador" ? "horas" : "resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorView, setEditorView] = useState(null);
  const [editorItem, setEditorItem] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);
  const [contentCounts, setContentCounts] = useState({
    proyectos: proyectos.length,
    servicios: servicios.length,
    noticias: noticias.length,
    clientes: clientes.length,
    equipo: 0,
  });
  const permissions = ROLE_PERMISSIONS[role] || [];
  const can = (permission) => permissions.includes(permission);
  const visibleMenuItems = menuItems.filter((item) => {
    if (role === "Trabajador") return item.id === "horas";
    if (item.id === "horas") return can("hours.read");
    if (item.id === "usuarios" || item.id === "configuracion") return can("users.manage");
    if (item.id === "mensajes") return role !== "Suscriptor";
    if (["slider", "experiencia"].includes(item.id)) return can("content.create");
    return true;
  });

  useEffect(() => {
    if (!localStorage.getItem("sya_admin_token")) {
      navigate("/login");
      return;
    }

    if (permissions.includes("messages.manage")) cargarMensajes();
    if (permissions.includes("content.create")) {
      Promise.all(["proyectos", "servicios", "noticias", "clientes", "equipo"].map((type) => getAdminContent(type)))
        .then(([projectItems, serviceItems, newsItems, clientItems, equipoItems]) => {
          setContentCounts({
            proyectos: projectItems.length,
            servicios: serviceItems.length,
            noticias: newsItems.length,
            clientes: clientItems.length,
            equipo: equipoItems.length,
          });
        })
        .catch((error) => console.error("No se pudo cargar el resumen del contenido:", error));
    }
  }, [navigate, role]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const cerrarSesion = () => {
    setSidebarOpen(false);
    localStorage.removeItem("sya_admin_token");
    localStorage.removeItem("sya_admin_user");
    navigate("/login");
  };

  const cargarMensajes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/mensajes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sya_admin_token")}`,
        },
      });

      if (response.status === 401) {
        cerrarSesion();
        return;
      }

      if (!response.ok) throw new Error("No se pudo cargar la bandeja");
      setMensajes(await response.json());
    } catch (error) {
      console.warn("La bandeja no está disponible:", error.message);
      setMensajes([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeido = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/mensajes/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sya_admin_token")}`,
        },
      });
      cargarMensajes();
    } catch (error) {
      console.warn(error);
    }
  };

  const eliminarMensaje = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar mensaje?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#bd4b38",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE_URL}/api/mensajes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sya_admin_token")}`,
        },
      });
      cargarMensajes();
    } catch (error) {
      console.warn(error);
    }
  };

  const openView = (view) => {
    setActiveView(view);
    setSidebarOpen(false);
    setNotificationsOpen(false);
  };

  const title = menuItems.find((item) => item.id === activeView)?.label || "Configuración";

  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-header">
            <Link to="/" aria-label="Ir a la página principal de S&A Santander y Asociados">
              <img src="/Logo/logo.png" alt="S&A Santander y Asociados" />
            </Link>
            <button
              type="button"
              className="admin-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>
          <span>Panel de control</span>
        </div>

        <div className="admin-workspace">
          <span className="admin-workspace-label">ESPACIO DE TRABAJO</span>
          <strong>S&A Santander y Asociados</strong>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          {visibleMenuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={activeView === id ? "is-active" : ""}
              onClick={() => openView(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "mensajes" && mensajes.some((mensaje) => !mensaje.leido) && (
                <b>{mensajes.filter((mensaje) => !mensaje.leido).length}</b>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          {can("settings.manage") && <button onClick={() => openView("configuracion")}>
            <Settings size={18} />
            <span>Configuración</span>
          </button>}
          <button onClick={cerrarSesion} className="admin-signout">
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}

      <section className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir navegación"
          >
            <Menu size={21} />
          </button>
          <div className="admin-breadcrumb">
            <span>Panel</span>
            <ChevronRight size={15} />
            <strong>{title}</strong>
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-notifications">
              <button className="admin-icon-button" title="Notificaciones" onClick={() => setNotificationsOpen((current) => !current)} aria-expanded={notificationsOpen}>
              <Bell size={18} />
              {mensajes.some((mensaje) => !mensaje.leido) && <i />}
              </button>
              {notificationsOpen && <NotificationsPanel mensajes={mensajes} openView={openView} />}
            </div>
            <div className="admin-user">
              <span>{(user?.username || "AD").slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{user?.username || "Administrador"}</strong>
                <small>{role}</small>
              </div>
            </div>
            <button
              type="button"
              className="admin-icon-button admin-topbar-signout"
              title="Cerrar sesión"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="admin-content">
          {activeView === "resumen" && (
            <DashboardOverview counts={contentCounts} mensajes={mensajes} openView={openView} />
          )}
          {activeView === "mensajes" && (
            <MessagesView
              mensajes={mensajes}
              loading={loading}
              onRefresh={cargarMensajes}
              onRead={marcarLeido}
              onDelete={eliminarMensaje}
              canManage={can("messages.manage")}
            />
          )}
          {activeView === "usuarios" && <UsersView currentUserId={user?.id} />}
          {activeView === "horas" && (
            <HoursView canCreate={can("hours.create")} isAdmin={role === "Administrador"} />
          )}
          {activeView !== "resumen" && activeView !== "mensajes" && activeView !== "horas" && (
            activeView !== "usuarios" && (activeView === "configuracion" ? <SettingsView /> : activeView === "slider" ? <SliderView /> : <ContentView
                view={activeView}
                items={activeView === "proyectos" ? proyectos : activeView === "servicios" ? servicios : activeView === "noticias" ? noticias : activeView === "clientes" ? clientes : []}
                openView={openView}
                canCreate={can("content.create")}
                canEdit={can("content.edit")}
                canDelete={can("content.delete")}
                onNew={() => { setEditorItem(null); setEditorView(activeView); }}
                onEdit={(item) => { setEditorItem(item); setEditorView(activeView); }}
                onDelete={async (item) => {
                  await deleteContent(activeView, item.id);
                  setContentVersion((v) => v + 1);
                }}
                version={contentVersion}
                />)
          )}
        </div>
      </section>
      {editorView && (
        <BasicEditor
          view={editorView}
          item={editorItem}
          canPublish={can("content.publish")}
          onClose={() => { setEditorView(null); setEditorItem(null); }}
          onSaved={() => setContentVersion((v) => v + 1)}
        />
      )}
    </main>
  );
}

function NotificationsPanel({ mensajes, openView }) {
  const recentMessages = mensajes.slice(0, 5);

  return (
    <div className="admin-notifications-panel">
      <div className="admin-notifications-heading"><div><strong>Notificaciones</strong><small>{mensajes.filter((mensaje) => !mensaje.leido).length} pendientes</small></div><Bell size={17} /></div>
      {recentMessages.length === 0 ? <div className="admin-notifications-empty"><MessageSquare size={18} /><span>No hay notificaciones recientes.</span></div> : <div className="admin-notifications-list">{recentMessages.map((mensaje) => <button className={`admin-notification-item ${mensaje.leido ? "is-read" : ""}`} key={mensaje.id} onClick={() => openView("mensajes")}><span className="admin-notification-dot" /><span><strong>{mensaje.nombre}</strong><small>{mensaje.asunto || "Consulta general"}</small><time>{new Date(mensaje.fecha).toLocaleString("es-CO")}</time></span></button>)}</div>}
      <button className="admin-notifications-footer" onClick={() => openView("mensajes")}>Ver todas las notificaciones <ChevronRight size={15} /></button>
    </div>
  );
}

function DashboardOverview({ counts, mensajes, openView }) {
  const unread = mensajes.filter((mensaje) => !mensaje.leido).length;
  const cards = [
    { label: "Proyectos publicados", value: counts.proyectos, icon: FolderKanban, color: "blue", view: "proyectos" },
    { label: "Servicios activos", value: counts.servicios, icon: BriefcaseBusiness, color: "gold", view: "servicios" },
    { label: "Noticias publicadas", value: counts.noticias, icon: FileText, color: "green", view: "noticias" },
    { label: "Mensajes pendientes", value: unread, icon: Mail, color: "red", view: "mensajes" },
  ];

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">VISTA GENERAL</span>
          <h1>Buenos días, administrador</h1>
          <p>Este es el estado actual del contenido de S&A.</p>
        </div>
        <button className="admin-primary-button" onClick={() => openView("proyectos")}>
          <FolderKanban size={17} /> Gestionar contenido
        </button>
      </div>

      <div className="admin-stat-grid">
        {cards.map(({ label, value, icon: Icon, color, view }) => (
          <button className="admin-stat-card" key={label} onClick={() => openView(view)}>
            <span className={`admin-stat-icon ${color}`}><Icon size={20} /></span>
            <span className="admin-stat-copy"><strong>{value}</strong><small>{label}</small></span>
            <ChevronRight size={17} className="admin-stat-arrow" />
          </button>
        ))}
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel admin-welcome-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">SITIO WEB</span><h2>Tu contenido, en un solo lugar</h2></div><BarChart3 size={22} /></div>
          <p>Administra los proyectos, servicios y noticias que se muestran en la página pública de S&A.</p>
          <div className="admin-quick-actions">
            <button onClick={() => openView("proyectos")}><FolderKanban size={17} /> Proyectos</button>
            <button onClick={() => openView("noticias")}><FileText size={17} /> Noticias</button>
            <button onClick={() => openView("mensajes")}><Mail size={17} /> Mensajes</button>
          </div>
        </section>
        <section className="admin-panel admin-activity-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">ACTIVIDAD</span><h2>Últimos mensajes</h2></div><button className="admin-text-button" onClick={() => openView("mensajes")}>Ver todos</button></div>
          {mensajes.length === 0 ? <div className="admin-activity-empty"><MessageSquare size={20} /><span>Aún no hay mensajes recibidos.</span></div> : mensajes.slice(0, 3).map((mensaje) => <div className="admin-activity-row" key={mensaje.id}><span className={mensaje.leido ? "activity-dot read" : "activity-dot"} /><div><strong>{mensaje.nombre}</strong><small>{mensaje.asunto || "Consulta general"}</small></div><time>{new Date(mensaje.fecha).toLocaleDateString("es-CO")}</time></div>)}
        </section>
      </div>
    </>
  );
}

function ContentView({ view, items, openView, onNew, onEdit, onDelete, canCreate, canEdit, canDelete, version = 0 }) {
  const labels = { proyectos: "proyectos", servicios: "servicios", noticias: "noticias", clientes: "clientes", equipo: "integrantes del equipo", experiencia: "imágenes de experiencia" };
  const [contentItems, setContentItems] = useState(items);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    let active = true;
    getAdminContent(view)
      .then((data) => active && setContentItems(data))
      .catch(() => active && setContentItems([]))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [view, version]);

  const filteredItems = contentItems.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
  const empty = filteredItems.length === 0;

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">CONTENIDO</span><h1>{labels[view] || "Configuración"}</h1><p>Gestiona los elementos visibles en tu sitio web.</p></div>
        {canCreate && <button className="admin-primary-button" onClick={onNew}><span>+</span> Nuevo {view === "proyectos" ? "proyecto" : view === "noticias" ? "artículo" : view === "experiencia" ? "registro" : view === "equipo" ? "integrante" : "cliente"}</button>}
      </div>
      <div className="admin-content-toolbar"><label className="admin-search"><span>Buscar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${labels[view]}`} /></label><span className="admin-results-count">{filteredItems.length} resultado{filteredItems.length === 1 ? "" : "s"}</span></div>
      {loading ? <div className="admin-empty-state"><RefreshCw className="admin-spin" size={24} /><p>Cargando contenido...</p></div> : empty ? <div className="admin-empty-state"><span><FileText size={26} /></span><h2>{search ? "No se encontraron resultados" : `No hay ${labels[view]} todavía`}</h2><p>{search ? "Prueba con otro término de búsqueda." : "Cuando agregues contenido desde el editor, aparecerá aquí."}</p><button className="admin-secondary-button" onClick={() => openView("resumen")}>Volver al resumen</button></div> : <div className="admin-content-table">{filteredItems.map((item, index) => <div className="admin-content-row" key={item.id || item.slug || index}><div className="admin-content-thumb" style={item.imagen ? { backgroundImage: `url(${resolveImageUrl(item.imagen)})` } : undefined}><FileText size={18} /></div><div><strong>{item.nombre || item.titulo || item.name || `Elemento ${index + 1}`}</strong><small>{item.categoria || item.resumen || item.descripcion || "Contenido publicado"}{view === "noticias" && ` · ${item.autor || "Equipo S&A"}${item.fecha ? ` · ${item.fecha}` : ""}`}</small></div><span className={`admin-status-pill status-${(item.estado || "Publicado").toLowerCase()}`}><CheckCircle size={13} /> {item.estado || "Publicado"}</span>{(canEdit || canDelete) && <div className="admin-row-actions">{canEdit && <button className="admin-row-action" onClick={() => onEdit(item)} aria-label="Editar elemento">Editar</button>}{canDelete && <button className="admin-row-action admin-row-delete" onClick={() => onDelete(item)} aria-label="Eliminar elemento">Eliminar</button>}</div>}</div>)}</div>}
    </>
  );
}

function BasicEditor({ view, item, canPublish = true, onClose, onSaved }) {
  const contentLabels = { proyectos: "proyecto", servicios: "servicio", noticias: "artículo", clientes: "cliente", equipo: "integrante del equipo", experiencia: "registro de experiencia" };
  const label = contentLabels[view] || "contenido";
  const [form, setForm] = useState({
    titulo: item?.titulo || item?.nombre || "",
    categoria: item?.categoria || "",
    subtitulo: item?.subtitulo || "",
    descripcion: item?.descripcion || "",
    imagen: item?.imagen || "",
    slug: item?.slug || "",
    estado: item?.estado || (canPublish ? "Publicado" : "Borrador"),
    autor: item?.autor || "Equipo S&A",
    fecha: item?.fecha || new Date().toISOString().slice(0, 10),
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLocalImage = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        setForm((current) => ({ ...current, imagen: canvas.toDataURL("image/jpeg", 0.78) }));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        descripcion: form.descripcion || form.subtitulo || form.titulo || "Contenido",
        categoria: view === "equipo" ? "Equipo S&A" : form.categoria,
      };
      if (item) {
        await updateContent(view, item.id, payload);
      } else {
        await createContent(view, payload);
      }
      setSaved(true);
      if (onSaved) onSaved();
      window.setTimeout(onClose, 700);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="admin-editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div className="admin-editor-heading"><div><span className="admin-eyebrow">EDICIÓN AVANZADA</span><h2 id="editor-title">{item ? "Editar" : "Nuevo"} {label}</h2></div><button className="admin-editor-close" onClick={onClose} aria-label="Cerrar editor">×</button></div>
        <form onSubmit={save}>
          <label className="admin-field"><span>{view === "noticias" ? "Título" : "Nombre"}</span><input name="titulo" value={form.titulo} onChange={updateForm} placeholder={`Escribe el ${label}`} required /></label>
          {view === "equipo" && <label className="admin-field"><span>Cargo</span><input name="subtitulo" value={form.subtitulo} onChange={updateForm} placeholder="Ej. Ingeniero de Diseño" required /></label>}
          {view !== "equipo" && view !== "clientes" && <label className="admin-field"><span>{view === "proyectos" ? "Categoría" : "Resumen"}</span><input name="categoria" value={form.categoria} onChange={updateForm} placeholder={view === "proyectos" ? "Ej. Infraestructura vial" : "Descripción breve"} required /></label>}
          {view !== "equipo" && view !== "clientes" && <label className="admin-field"><span>Descripción</span><textarea name="descripcion" value={form.descripcion} onChange={updateForm} placeholder="Añade la información principal" rows="4" required /></label>}
          <label className="admin-field"><span>URL de imagen</span><input name="imagen" value={form.imagen} onChange={updateForm} placeholder="/images/nombre-de-imagen.jpg" /></label>
          <label className="admin-upload-field"><span>O selecciona una imagen del computador</span><input type="file" accept="image/*" onChange={handleLocalImage} /></label>
          {form.imagen && <button type="button" className="admin-remove-image" onClick={() => setForm((current) => ({ ...current, imagen: "" }))}><Trash2 size={14} /> Quitar imagen</button>}
          {view === "noticias" && <div className="admin-editor-fields"><label className="admin-field"><span>Autor</span><input name="autor" value={form.autor} onChange={updateForm} /></label><label className="admin-field"><span>Fecha de publicación</span><input type="date" name="fecha" value={form.fecha} onChange={updateForm} /></label></div>}
          <div className="admin-editor-fields"><label className="admin-field"><span>Slug / URL amigable</span><input name="slug" value={form.slug} onChange={updateForm} placeholder="nombre-del-contenido" /></label><label className="admin-field"><span>Estado</span><select name="estado" value={form.estado} onChange={updateForm}>{(canPublish || form.estado === "Publicado") && <option value="Publicado">Publicado (Visible en la web)</option>}<option value="Borrador">Borrador (Oculto)</option><option value="Archivado">Archivado (Oculto)</option></select></label></div>
          <div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={onClose} disabled={saving}>Cancelar</button><button type="submit" className="admin-primary-button" disabled={saving}>{saved ? <><CheckCircle size={15} /> Guardado</> : saving ? "Guardando..." : item ? "Actualizar contenido" : form.estado === "Publicado" ? `Publicar ${label}` : "Guardar borrador"}</button></div>
        </form>
      </section>
    </div>
  );
}

function MessagesView({ mensajes, loading, onRefresh, onRead, onDelete, canManage }) {
  return (
    <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">BANDEJA DE ENTRADA</span><h1>Mensajes recibidos</h1><p>Gestiona las solicitudes enviadas desde el sitio web.</p></div><button className="admin-secondary-button" onClick={onRefresh}><RefreshCw size={16} /> Actualizar</button></div>
      {loading ? <div className="admin-empty-state"><RefreshCw className="admin-spin" size={24} /><p>Cargando mensajes...</p></div> : mensajes.length === 0 ? <div className="admin-empty-state"><span><Mail size={26} /></span><h2>No hay mensajes</h2><p>Los mensajes del formulario aparecerán aquí.</p></div> : <div className="admin-messages-list">{mensajes.map((mensaje) => <article className={`admin-message-card ${mensaje.leido ? "is-read" : ""}`} key={mensaje.id}><div className="admin-message-heading"><div><span className="admin-message-status">{mensaje.leido ? "LEÍDO" : "NUEVO"}</span><h2>{mensaje.asunto || "Sin asunto"}</h2></div><time>{new Date(mensaje.fecha).toLocaleString("es-CO")}</time></div><div className="admin-message-contact"><strong>{mensaje.nombre}</strong><a href={`mailto:${mensaje.email}`}>{mensaje.email}</a>{mensaje.telefono && <span>{mensaje.telefono}</span>}</div><p>{mensaje.mensaje}</p>{canManage && <div className="admin-message-actions">{!mensaje.leido && <button className="admin-secondary-button" onClick={() => onRead(mensaje.id)}><CheckCircle size={15} /> Marcar como leído</button>}<button className="admin-danger-button" onClick={() => onDelete(mensaje.id)}>Eliminar</button></div>}</article>)}</div>}
    </>
  );
}

function UsersView({ currentUserId }) {
  const roles = ["Administrador", "Editor", "Autor", "Colaborador", "Suscriptor"];
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [savingSalaryId, setSavingSalaryId] = useState(null);
  const [salaryDrafts, setSalaryDrafts] = useState({});
  const [form, setForm] = useState({ username: "", password: "", role: "Editor", monthly_salary: "0" });

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        setSalaryDrafts(Object.fromEntries(
          loadedUsers.map((user) => [user.id, String(Number(user.monthly_salary || 0))])
        ));
      })
      .catch((error) => window.alert(error.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      await createUser({ ...form, monthly_salary: Number(form.monthly_salary) });
      setForm({ username: "", password: "", role: "Editor", monthly_salary: "0" });
      setFormOpen(false);
      loadUsers();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await updateUser(id, { role });
      setUsers((current) => current.map((user) => user.id === id ? { ...user, role } : user));
    } catch (error) {
      window.alert(error.message);
    }
  };

  const saveSalary = async (user) => {
    const rawSalary = salaryDrafts[user.id];
    const monthly_salary = Number(rawSalary);
    if (
      rawSalary.trim() === ""
      || !Number.isFinite(monthly_salary)
      || monthly_salary < 0
      || monthly_salary > 9999999999.99
    ) {
      window.alert("Indica un sueldo mensual válido, igual o mayor que cero.");
      return;
    }
    setSavingSalaryId(user.id);
    try {
      await updateUser(user.id, { monthly_salary });
      setUsers((current) => current.map((item) => (
        item.id === user.id ? { ...item, monthly_salary } : item
      )));
      setSalaryDrafts((current) => ({ ...current, [user.id]: String(monthly_salary) }));
    } catch (error) {
      window.alert(error.message);
      loadUsers();
    } finally {
      setSavingSalaryId(null);
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.username}?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div><span className="admin-eyebrow">ACCESO Y PERMISOS</span><h1>Usuarios</h1><p>Agrega usuarios y asigna el nivel de acceso que necesita cada persona.</p></div>
        <button className="admin-primary-button" onClick={() => setFormOpen((current) => !current)}><span>+</span> Nuevo usuario</button>
      </div>

      {formOpen && <form className="admin-user-form" onSubmit={create}>
        <div className="admin-panel-heading"><div><span className="admin-eyebrow">NUEVO ACCESO</span><h2>Crear usuario</h2></div><button type="button" className="admin-editor-close" onClick={() => setFormOpen(false)} aria-label="Cerrar formulario">×</button></div>
        <div className="admin-user-fields">
          <label className="admin-field"><span>Nombre de usuario</span><input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} minLength="3" required /></label>
          <label className="admin-field"><span>Contraseña</span><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength="6" required /></label>
          <label className="admin-field"><span>Rol</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{roles.map((role) => <option key={role} value={role}>{mostrarRol(role)}</option>)}</select></label>
          <label className="admin-field"><span>Sueldo mensual (COP)</span><input type="number" min="0" max="9999999999.99" step="1000" value={form.monthly_salary} onChange={(event) => setForm({ ...form, monthly_salary: event.target.value })} required /></label>
        </div>
        <div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button type="submit" className="admin-primary-button">Crear usuario</button></div>
      </form>}

      {loading ? <div className="admin-empty-state"><RefreshCw className="admin-spin" size={24} /><p>Cargando usuarios...</p></div> : <div className="admin-users-table"><div className="admin-users-header"><span>Usuario</span><span>Rol asignado</span><span>Sueldo mensual (COP)</span><span>Creado</span><span>Acciones</span></div>{users.map((user) => <div className="admin-user-row" key={user.id}><div className="admin-user-name"><span>{user.username.slice(0, 2).toUpperCase()}</span><strong>{user.username}{user.id === currentUserId && <small>Tu cuenta</small>}</strong></div><select value={user.role === "admin" ? "Administrador" : user.role} onChange={(event) => changeRole(user.id, event.target.value)} disabled={user.id === currentUserId && user.role === "admin"}>{roles.map((role) => <option key={role} value={role}>{mostrarRol(role)}</option>)}</select>      <div className="admin-salary-editor"><input aria-label={`Sueldo mensual de ${user.username}`} type="number" min="0" max="9999999999.99" step="1000" value={salaryDrafts[user.id] ?? "0"} onChange={(event) => setSalaryDrafts((current) => ({ ...current, [user.id]: event.target.value }))} /><button type="button" className="admin-secondary-button" onClick={() => saveSalary(user)} disabled={savingSalaryId === user.id}>{savingSalaryId === user.id ? "Guardando..." : "Guardar"}</button></div><time>{new Date(user.created_at).toLocaleDateString("es-CO")}</time><button className="admin-row-action admin-row-delete" onClick={() => remove(user)} disabled={user.id === currentUserId}>Eliminar</button></div>)}</div>}
    </>
  );
}

function fechaLocalActual() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fechaMesActual() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function calcularJornada(horaEntrada, horaSalida) {
  if (!horaEntrada || !horaSalida) return null;
  const entrada = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(horaEntrada);
  const salida = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(horaSalida);
  if (!entrada || !salida) return null;

  const inicio = Number(entrada[1]) * 60 + Number(entrada[2]);
  const fin = Number(salida[1]) * 60 + Number(salida[2]);
  if (fin <= inicio) return null;

  const totalMinutes = fin - inicio;
  return {
    totalMinutes,
    workedMinutes: Math.max(0, totalMinutes - 60),
  };
}

function minutosTrabajados(record) {
  return calcularJornada(record.hora_entrada, record.hora_salida)?.workedMinutes || 0;
}

function formatoDuracion(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours && remainingMinutes) return `${hours} h ${remainingMinutes} min`;
  if (hours) return `${hours} h`;
  return `${remainingMinutes} min`;
}

function HoursView({ canCreate, isAdmin }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(fechaMesActual());
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [projectNames, setProjectNames] = useState([]);
  const [projectLoadError, setProjectLoadError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [form, setForm] = useState({
    fecha: fechaLocalActual(),
    hora_entrada: "",
    hora_salida: "",
    cliente: "",
    proyecto: "",
  });
  const resumenJornada = calcularJornada(form.hora_entrada, form.hora_salida);
  const user = JSON.parse(localStorage.getItem("sya_admin_user") || "null");
  const visibleRecords = records.filter((record) => {
    const matchesMonth = !selectedMonth || record.fecha.startsWith(selectedMonth);
    const matchesDate = !selectedDate || record.fecha === selectedDate;
    return matchesMonth && matchesDate;
  });
  const totalWorkedMinutes = visibleRecords.reduce((total, record) => total + minutosTrabajados(record), 0);
  const targetMinutes = 175 * 60;
  const estimatedValue = Math.round((totalWorkedMinutes / 60) * 35000);
  const compliance = Math.min(100, Math.round((totalWorkedMinutes / targetMinutes) * 100));

  useEffect(() => {
    let active = true;
    getPublicContent("proyectos")
      .then((items) => {
        if (active) setProjectNames(items.map((item) => item.titulo).filter(Boolean));
      })
      .catch((requestError) => {
        if (active) setProjectLoadError(`No se pudieron cargar las sugerencias de proyectos: ${requestError.message}`);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAdmin && !canCreate) return undefined;

    let active = true;
    setLoading(true);
    getHourRecords(selectedDate, !isAdmin)
      .then((data) => {
        if (active) {
          setRecords(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdmin, canCreate, selectedDate, refreshVersion]);

  const saveRecord = async (event) => {
    event.preventDefault();
    const jornada = calcularJornada(form.hora_entrada, form.hora_salida);
    if (!jornada || jornada.workedMinutes <= 0) {
      setError("La salida debe ser posterior a la entrada y la jornada debe superar 1 hora para descontar el almuerzo.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const record = await createHourRecord({
        ...form,
        tiempo_estimado: jornada.workedMinutes / 60,
      });
      const matchesMonth = !selectedMonth || record.fecha.startsWith(selectedMonth);
      const matchesDate = !selectedDate || selectedDate === record.fecha;
      if (matchesMonth && matchesDate) {
        setRecords((current) => [record, ...current].sort((a, b) => (
          b.fecha.localeCompare(a.fecha)
          || b.hora_entrada.localeCompare(a.hora_entrada)
        )));
      }
      setForm((current) => ({
        ...current,
        hora_entrada: "",
        hora_salida: "",
        cliente: "",
        proyecto: "",
      }));
      setSuccess(isAdmin ? "Registro guardado correctamente." : "Horas agregadas correctamente.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (record) => {
    setEditingId(record.id);
    setEditForm({
      fecha: record.fecha,
      hora_entrada: record.hora_entrada,
      hora_salida: record.hora_salida,
      cliente: record.cliente,
      proyecto: record.proyecto,
    });
    setError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const jornada = calcularJornada(editForm.hora_entrada, editForm.hora_salida);
    if (!jornada || jornada.workedMinutes <= 0) {
      setError("La salida debe ser posterior a la entrada y la jornada debe superar 1 hora para descontar el almuerzo.");
      return;
    }

    setError("");
    try {
      const updatedRecord = await updateHourRecord(editingId, {
        ...editForm,
        tiempo_estimado: jornada.workedMinutes / 60,
      });
      setRecords((current) => current
        .map((record) => record.id === editingId ? updatedRecord : record)
        .filter((record) => (!selectedDate || record.fecha === selectedDate) && (!selectedMonth || record.fecha.startsWith(selectedMonth))));
      setEditingId(null);
      setEditForm(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`¿Eliminar el registro de ${record.username} del ${record.fecha}?`)) return;
    setError("");
    try {
      await deleteHourRecord(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      if (editingId === record.id) {
        setEditingId(null);
        setEditForm(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const renderProjectField = (value, onChange, required = true) => (
    <input list="admin-hour-projects" value={value} onChange={onChange} maxLength="180" required={required} />
  );

  return (
    <>
      <div className="admin-page-heading admin-hours-page-heading">
        <div>
          <span className="admin-eyebrow">{isAdmin ? "CONTROL DE JORNADAS" : "MI JORNADA"}</span>
          <h1>Registro de horas</h1>
          <p>{isAdmin ? "Consulta por mes y revisa el rendimiento de cada trabajador." : "Selecciona el mes y revisa cuánto has trabajado."}</p>
        </div>
        <div className="admin-hours-filter">
          <label className="admin-field"><span>Mes</span><input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} /></label>
          {isAdmin && (
            <label className="admin-field"><span>Fecha exacta</span><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label>
          )}
          <button type="button" className="admin-secondary-button" onClick={() => { setLoading(true); setSelectedDate(""); setSelectedMonth(fechaMesActual()); }} disabled={loading && !selectedDate && selectedMonth === fechaMesActual()}>Ver este mes</button>
          <button type="button" className="admin-secondary-button" onClick={() => { setLoading(true); setRefreshVersion((current) => current + 1); }} disabled={loading}><RefreshCw size={15} /> Actualizar</button>
        </div>
      </div>

      <div className="admin-hours-hero">
        <div className="admin-hours-hero-head">
          <div>
            <span className="admin-hours-hero-label">Bienvenido</span>
            <strong>{user?.username || "admin"}</strong>
          </div>
          <button type="button" className="admin-hours-hero-button">Cerrar</button>
        </div>
      </div>

      <div className="admin-hours-summary">
        <div className="admin-hours-summary-card">
          <span>Horas totales</span>
          <strong>{formatoDuracion(totalWorkedMinutes)}</strong>
          <small>Meta mensual: 175 h</small>
        </div>
        <div className="admin-hours-summary-card">
          <span>Liquidación proyectada</span>
          <strong>$ {estimatedValue.toLocaleString("es-CO")}</strong>
          <small>Incluye cargos dom/fest</small>
        </div>
        <div className="admin-hours-summary-card">
          <span>Cumplimiento</span>
          <strong className={compliance >= 100 ? "is-ok" : "is-alert"}>{compliance}%</strong>
          <small>Meta del periodo</small>
        </div>
      </div>

      <datalist id="admin-hour-projects">
        {projectNames.map((name) => <option key={name} value={name} />)}
      </datalist>

      {canCreate && (
        <form className="admin-user-form admin-hours-form" onSubmit={saveRecord}>
          <div className="admin-hours-fields">
            <label className="admin-field">
              <span>Fecha</span>
              <input type="date" value={form.fecha} onChange={(event) => setForm({ ...form, fecha: event.target.value })} required />
            </label>
            <label className="admin-field">
              <span>Hora de entrada</span>
              <input type="time" value={form.hora_entrada} onChange={(event) => setForm({ ...form, hora_entrada: event.target.value })} required />
            </label>
            <label className="admin-field">
              <span>Hora de salida</span>
              <input type="time" min={form.hora_entrada || undefined} value={form.hora_salida} onChange={(event) => setForm({ ...form, hora_salida: event.target.value })} required />
            </label>
            <label className="admin-field">
              <span>Cliente</span>
              <input value={form.cliente} onChange={(event) => setForm({ ...form, cliente: event.target.value })} maxLength="180" required />
            </label>
            <label className="admin-field">
              <span>Proyecto</span>
              {renderProjectField(form.proyecto, (event) => setForm({ ...form, proyecto: event.target.value }))}
            </label>
          </div>
          <div className="admin-hours-calculation" aria-live="polite">
            <div><span>Tiempo total</span><strong>{resumenJornada ? formatoDuracion(resumenJornada.totalMinutes) : "--"}</strong></div>
            <span className="admin-hours-calculation-operator" aria-hidden="true">−</span>
            <div><span>Almuerzo</span><strong>1 h</strong></div>
            <span className="admin-hours-calculation-operator" aria-hidden="true">=</span>
            <div className="admin-hours-net"><span>Horas trabajadas</span><strong>{resumenJornada ? formatoDuracion(resumenJornada.workedMinutes) : "--"}</strong></div>
          </div>
          <p className="admin-hours-hint">El cálculo descuenta automáticamente 1 hora de almuerzo.</p>
          {projectLoadError && <p className="admin-hours-error" role="alert">{projectLoadError}</p>}
          <div className="admin-hours-form-footer">
            {success && <p className="admin-hours-success" role="status">{success}</p>}
            {error && !isAdmin && <p className="admin-hours-error" role="alert">{error}</p>}
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? "Guardando..." : "Guardar registro"}
            </button>
          </div>
        </form>
      )}

      {error && isAdmin && <p className="admin-hours-error" role="alert">{error}</p>}
      {loading ? (
        <div className="admin-empty-state"><RefreshCw className="admin-spin" size={24} /><p>Cargando registros...</p></div>
      ) : visibleRecords.length === 0 ? (
        <div className="admin-empty-state"><span><Clock3 size={26} /></span><h2>No hay registros</h2><p>{selectedDate ? "No hay registros para la fecha seleccionada." : selectedMonth ? `No hay registros para ${new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}.` : "Los registros de horas guardados aparecerán aquí."}</p></div>
      ) : (
        <div className="admin-hours-table-scroll">
          <table className="admin-hours-table">
            <thead>
              <tr>
                <th>Fecha</th>
                {isAdmin && <th>Trabajador</th>}
                <th>Hora de entrada</th>
                <th>Hora de salida</th>
                <th>Cliente</th>
                <th>Proyecto</th>
                <th>Almuerzo</th>
                <th>Horas trabajadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((record) => {
                const actualMinutes = minutosTrabajados(record);
                return (
                  <tr key={record.id}>
                    {editingId === record.id ? (
                      <td colSpan="9">
                        <form className="admin-hour-edit-form" onSubmit={saveEdit}>
                          <label className="admin-field"><span>Fecha</span><input type="date" value={editForm.fecha} onChange={(event) => setEditForm({ ...editForm, fecha: event.target.value })} required /></label>
                          <label className="admin-field"><span>Entrada</span><input type="time" value={editForm.hora_entrada} onChange={(event) => setEditForm({ ...editForm, hora_entrada: event.target.value })} required /></label>
                          <label className="admin-field"><span>Salida</span><input type="time" min={editForm.hora_entrada || undefined} value={editForm.hora_salida} onChange={(event) => setEditForm({ ...editForm, hora_salida: event.target.value })} required /></label>
                          <label className="admin-field"><span>Cliente</span><input value={editForm.cliente} onChange={(event) => setEditForm({ ...editForm, cliente: event.target.value })} maxLength="180" required /></label>
                          <label className="admin-field"><span>Proyecto</span>{renderProjectField(editForm.proyecto, (event) => setEditForm({ ...editForm, proyecto: event.target.value }))}</label>
                          <div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={() => { setEditingId(null); setEditForm(null); }}>Cancelar</button><button type="submit" className="admin-primary-button">Guardar cambios</button></div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td data-label="Fecha">{new Date(`${record.fecha}T00:00:00`).toLocaleDateString("es-CO")}</td>
                        <td data-label="Trabajador">{record.username}</td>
                        <td data-label="Entrada">{record.hora_entrada}</td>
                        <td data-label="Salida">{record.hora_salida}</td>
                        <td data-label="Cliente">{record.cliente}</td>
                        <td data-label="Proyecto">{record.proyecto}</td>
                        <td data-label="Almuerzo">1 h</td>
                        <td data-label="Horas trabajadas" className="admin-hours-total-cell">{formatoDuracion(actualMinutes)}</td>
                        <td data-label="Acciones"><div className="admin-hour-actions"><button type="button" className="admin-secondary-button" onClick={() => startEditing(record)}>Editar</button><button type="button" className="admin-danger-button" onClick={() => removeRecord(record)}>Eliminar</button></div></td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState("");

  const [sitio, setSitio] = useState(() => JSON.parse(localStorage.getItem("sya_sitio") || "null") || {
    empresa: "S&A Santander y Asociados",
    emailNotificaciones: "felipemoralesherrera888@gmail.com",
    notificacionesActivas: true,
  });

  const [analytics, setAnalytics] = useState(() => JSON.parse(localStorage.getItem("sya_analytics") || "null") || {
    measurementId: "",
    enabled: false,
    anonymize: true,
  });

  const [seo, setSeo] = useState(() => JSON.parse(localStorage.getItem("sya_seo") || "null") || {
    title: "S&A Santander y Asociados | Ingeniería y consultoría",
    description: "Soluciones de ingeniería, diseño estructural, consultoría e interventoría para proyectos de infraestructura y edificación.",
    canonical: "https://sya.com.co/",
    image: "/Logo/logo.png",
    indexable: true,
  });

  useEffect(() => {
    let active = true;
    getAdminConfig()
      .then((data) => {
        if (!active || !data) return;
        if (data.sitio) {
          setSitio(data.sitio);
          localStorage.setItem("sya_sitio", JSON.stringify(data.sitio));
        }
        if (data.analytics) {
          setAnalytics(data.analytics);
          localStorage.setItem("sya_analytics", JSON.stringify(data.analytics));
        }
        if (data.seo) {
          setSeo(data.seo);
          localStorage.setItem("sya_seo", JSON.stringify(data.seo));
        }
      })
      .catch((err) => {
        console.warn("No se pudo cargar la configuración del servidor, usando datos locales:", err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorNotice("");

    // Respaldo inmediato en caché local
    localStorage.setItem("sya_sitio", JSON.stringify(sitio));
    localStorage.setItem("sya_seo", JSON.stringify(seo));
    localStorage.setItem("sya_analytics", JSON.stringify(analytics));

    try {
      await updateAdminConfig({ sitio, analytics, seo });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      console.error("Error guardando en backend:", err);
      setErrorNotice(err.message || "No se pudo sincronizar con la base de datos.");
      window.setTimeout(() => setErrorNotice(""), 4500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">AJUSTES GENERALES</span>
          <h1>Configuración</h1>
          <p>Administra las preferencias de tu sitio con almacenamiento en la base de datos.</p>
        </div>
        <div className="admin-heading-actions">
          {saved && <span className="admin-save-notice"><CheckCircle size={15} /> Guardado en el servidor</span>}
          {errorNotice && <span className="admin-save-notice" style={{ color: "var(--admin-red)", background: "#fff0ed" }}>{errorNotice}</span>}
        </div>
      </div>
      <form className="admin-settings-grid" onSubmit={saveSettings}>
        <section className="admin-panel admin-settings-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">INTEGRACIONES</span><h2>Servicios conectados</h2></div><Settings size={21} /></div>
          <label className="admin-setting-row"><span><strong>Servidor de mensajes</strong><small>Recibe las solicitudes del formulario de contacto.</small></span><b className="admin-connection-status"><i /> Conectado</b></label>
          <label className="admin-setting-row"><span><strong>Google Analytics</strong><small>{analytics.measurementId || "Añade un ID de medición para activar estadísticas."}</small></span><b className={`admin-connection-status ${analytics.enabled && /^G-[A-Z0-9]+$/i.test(analytics.measurementId) ? "" : "is-muted"}`}><i /> {analytics.enabled && /^G-[A-Z0-9]+$/i.test(analytics.measurementId) ? "Configurado" : "Pendiente"}</b></label>
          <label className="admin-setting-row"><span><strong>Correo transaccional</strong><small>Configurado mediante EmailJS.</small></span><b className="admin-connection-status is-muted"><i /> Pendiente</b></label>
          <label className="admin-setting-row"><span><strong>Galería multimedia</strong><small>Fuente de imágenes para proyectos y noticias.</small></span><b className="admin-connection-status is-muted"><i /> Pendiente</b></label>
        </section>
        <section className="admin-panel admin-settings-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">PREFERENCIAS</span><h2>Datos del sitio</h2></div></div>
          <label className="admin-field">
            <span>Nombre de la empresa</span>
            <input
              value={sitio.empresa || ""}
              onChange={(event) => setSitio({ ...sitio, empresa: event.target.value })}
              required
            />
          </label>
          <label className="admin-field">
            <span>Correo de notificaciones</span>
            <input
              type="email"
              value={sitio.emailNotificaciones || ""}
              onChange={(event) => setSitio({ ...sitio, emailNotificaciones: event.target.value })}
              required
            />
          </label>
          <label className="admin-field admin-toggle-field">
            <span><strong>Notificaciones activas</strong><small>Recibir alertas de nuevos mensajes.</small></span>
            <input
              type="checkbox"
              checked={Boolean(sitio.notificacionesActivas)}
              onChange={(event) => setSitio({ ...sitio, notificacionesActivas: event.target.checked })}
            />
          </label>
        </section>
        <section className="admin-panel admin-settings-panel admin-analytics-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">ANALÍTICA</span><h2>Google Analytics 4</h2></div><BarChart3 size={21} /></div>
          <p className="admin-settings-description">Mide visitas, páginas consultadas y conversiones sin almacenar información personal.</p>
          <label className="admin-field"><span>ID de medición</span><input value={analytics.measurementId} onChange={(event) => setAnalytics({ ...analytics, measurementId: event.target.value.toUpperCase() })} placeholder="G-XXXXXXXXXX" pattern="G-[A-Z0-9]+" /></label>
          <label className="admin-toggle-field"><span><strong>Activar medición</strong><small>Solo se activará cuando el ID tenga formato válido.</small></span><input type="checkbox" checked={analytics.enabled} onChange={(event) => setAnalytics({ ...analytics, enabled: event.target.checked })} /></label>
          <label className="admin-toggle-field"><span><strong>Anonimizar datos</strong><small>Recomendado para reducir la recopilación de datos personales.</small></span><input type="checkbox" checked={analytics.anonymize} onChange={(event) => setAnalytics({ ...analytics, anonymize: event.target.checked })} /></label>
        </section>
        <section className="admin-panel admin-settings-panel admin-seo-panel">
          <div className="admin-panel-heading"><div><span className="admin-eyebrow">POSICIONAMIENTO</span><h2>SEO y redes sociales</h2></div><BarChart3 size={21} /></div>
          <label className="admin-field"><span>Título SEO <em>{seo.title.length}/60</em></span><input value={seo.title} maxLength="60" onChange={(event) => setSeo({ ...seo, title: event.target.value })} /></label>
          <label className="admin-field"><span>Meta descripción <em>{seo.description.length}/160</em></span><textarea rows="3" maxLength="160" value={seo.description} onChange={(event) => setSeo({ ...seo, description: event.target.value })} /></label>
          <label className="admin-field"><span>URL canónica</span><input type="url" value={seo.canonical} onChange={(event) => setSeo({ ...seo, canonical: event.target.value })} /></label>
          <label className="admin-field"><span>Imagen Open Graph</span><input value={seo.image} onChange={(event) => setSeo({ ...seo, image: event.target.value })} /></label>
          <label className="admin-toggle-field admin-seo-toggle"><span><strong>Permitir indexación</strong><small>Los buscadores pueden mostrar el sitio en sus resultados.</small></span><input type="checkbox" checked={seo.indexable} onChange={(event) => setSeo({ ...seo, indexable: event.target.checked })} /></label>
          <div className="admin-google-preview"><span>VISTA PREVIA EN GOOGLE</span><strong>{seo.title || "Título de la página"}</strong><small>{seo.canonical || "https://tudominio.com/"}</small><p>{seo.description || "Escribe una descripción para ver cómo aparecerá tu página."}</p></div>
        </section>
        <div className="admin-settings-actions">
          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? "Guardando en servidor..." : <><CheckCircle size={16} /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </>
  );
}

function SliderView() {
  const MAX_SLIDER_IMAGES = 3;
  const defaultSlides = [{ id: "default", titulo: "Ingeniería que construye confianza", subtitulo: "S&A SANTANDER Y ASOCIADOS", descripcion: "Soluciones integrales para proyectos de infraestructura y edificación.", imagen: HERO_FALLBACK_IMAGE, estado: "Publicado" }];
  const [slides, setSlides] = useState(defaultSlides);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(false);
  const [sliderConfig, setSliderConfig] = useState({ carrusel: true });
  const [savingConfig, setSavingConfig] = useState(false);
  const [localSlideImages, setLocalSlideImages] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);

  useEffect(() => {
    Promise.all([getAdminContent("slider"), getAdminConfig()])
      .then(([data, config]) => {
        if (data.length) setSlides(data);
        setSliderConfig({ carrusel: config.slider?.carrusel !== false });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleCarousel = async (event) => {
    const nextConfig = { ...sliderConfig, carrusel: event.target.checked };
    setSliderConfig(nextConfig);
    setSavingConfig(true);
    try {
      await updateAdminConfig({ slider: nextConfig });
    } catch (error) {
      setSliderConfig(sliderConfig);
      window.alert(error.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleLocalSlideImage = (event) => {
    const files = [...(event.target.files || [])].filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    setProcessingImages(true);

    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    }))).then((newImages) => {
      setLocalSlideImages((currentImages) => [...currentImages, ...newImages]);
      event.target.value = "";
    }).finally(() => setProcessingImages(false));
  };

  const saveSlide = async (event) => {
    event.preventDefault();
    if (processingImages) return;
    const form = new FormData(event.currentTarget);
    const baseSlide = { titulo: form.get("titulo"), subtitulo: form.get("subtitulo"), descripcion: form.get("descripcion"), estado: form.get("estado") };
    const isDatabaseSlide = editing?.id && Number.isSafeInteger(Number(editing.id));
    try {
      if (isDatabaseSlide) {
        const savedSlide = await updateContent("slider", editing.id, { ...baseSlide, imagen: localSlideImages[0] || form.get("imagen") });
        setSlides((current) => current.map((currentSlide) => currentSlide.id === editing.id ? savedSlide : currentSlide));
      } else {
        const urlImage = String(form.get("imagen") || "").trim();
        const currentSlideCount = slides.filter((slide) => Number.isSafeInteger(Number(slide.id))).length;
        const images = [urlImage, ...localSlideImages].filter(Boolean).slice(0, Math.max(0, MAX_SLIDER_IMAGES - currentSlideCount));
        if (!images.length) throw new Error("El slider ya tiene tres fotos publicadas.");
        const savedSlides = [];
        for (const [index, imagen] of (images.length ? images : [""]).entries()) {
          const savedSlide = await createContent("slider", { ...baseSlide, imagen, orden: slides.length + index });
          savedSlides.push(savedSlide);
        }
        setSlides((current) => [...current, ...savedSlides]);
      }
      setLocalSlideImages([]);
      setEditing(null);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const removeSlide = (id) => deleteContent("slider", id).then(() => setSlides((current) => current.filter((slide) => slide.id !== id))).catch((error) => window.alert(error.message));

  return (
    <>
      <div className="admin-page-heading"><div><span className="admin-eyebrow">HOME / HERO</span><h1>Slider principal</h1><p>Administra las diapositivas que aparecen en la portada pública.</p></div><div className="admin-heading-actions"><button className="admin-secondary-button" onClick={() => setPreview(!preview)}><GalleryHorizontalEnd size={16} /> {preview ? "Cerrar vista previa" : "Vista previa"}</button><button className="admin-primary-button" onClick={() => setEditing({})}><span>+</span> Nueva diapositiva</button></div></div>
      <div className="admin-slider-setting"><label className="admin-toggle-field"><span><strong>Activar carrusel automático</strong><small>{savingConfig ? "Guardando preferencia..." : "Cambia de diapositiva automáticamente cada 6,5 segundos."}</small></span><input type="checkbox" checked={sliderConfig.carrusel} onChange={toggleCarousel} disabled={savingConfig} /></label></div>
      {preview && <div className="admin-slider-preview" style={{ backgroundImage: `linear-gradient(90deg, rgba(10,28,40,.72), rgba(10,28,40,.16)), url(${slides[0]?.imagen || HERO_FALLBACK_IMAGE})` }}><span>{slides[0]?.subtitulo}</span><h2>{slides[0]?.titulo}</h2><p>{slides[0]?.descripcion}</p></div>}
      {loading ? <div className="admin-empty-state"><RefreshCw className="admin-spin" size={24} /><p>Cargando diapositivas...</p></div> : <div className="admin-slider-list">{slides.map((slide, index) => <article className="admin-slide-card" key={slide.id}><div className="admin-slide-image" style={{ backgroundImage: `url(${slide.imagen || HERO_FALLBACK_IMAGE})` }}><span>SLIDE {String(index + 1).padStart(2, "0")}</span></div><div className="admin-slide-copy"><span className="admin-eyebrow">{slide.subtitulo || "S&A"}</span><h2>{slide.titulo}</h2><p>{slide.descripcion}</p><div><span className="admin-status-pill"><CheckCircle size={13} /> {slide.estado || "Borrador"}</span><button className="admin-row-action" onClick={() => setEditing(slide)}>Editar</button>{slides.length > 1 && Number.isSafeInteger(Number(slide.id)) && <button className="admin-row-action admin-row-delete" onClick={() => removeSlide(slide.id)}><Trash2 size={14} /> Eliminar</button>}</div></div></article>)}</div>}
      {editing && <div className="admin-modal-backdrop" role="presentation"><section className="admin-editor-modal" role="dialog" aria-modal="true"><div className="admin-editor-heading"><div><span className="admin-eyebrow">SLIDER PRINCIPAL</span><h2>{editing.id ? "Editar diapositiva" : "Nueva diapositiva"}</h2></div><button className="admin-editor-close" onClick={() => setEditing(null)} aria-label="Cerrar editor">×</button></div><form onSubmit={saveSlide}><label className="admin-field"><span>Texto superior</span><input name="subtitulo" defaultValue={editing.subtitulo || "S&A SANTANDER Y ASOCIADOS"} required /></label><label className="admin-field"><span>Título principal</span><input name="titulo" defaultValue={editing.titulo || ""} required /></label><label className="admin-field"><span>Descripción</span><textarea name="descripcion" defaultValue={editing.descripcion || ""} rows="3" required /></label><label className="admin-field"><span>URL de imagen</span><input name="imagen" defaultValue={editing.imagen || ""} placeholder="/images/nombre.jpg o https://..." /><small className="admin-field-help">Puedes usar una imagen local del proyecto o una URL pública.</small></label><label className="admin-upload-field"><span>{editing.id ? "Reemplazar con una imagen local" : `Adjuntar fotos locales (máximo ${MAX_SLIDER_IMAGES})`}</span><input type="file" accept="image/*" multiple={!editing.id} onChange={handleLocalSlideImage} /></label>{processingImages && <small className="admin-field-help">Procesando imágenes, espera un momento...</small>}{localSlideImages.length > 0 && <small className="admin-field-help">{localSlideImages.length} imagen{localSlideImages.length === 1 ? " seleccionada" : "es seleccionadas"} para el carrusel.</small>}<button type="button" className="admin-remove-image" onClick={(event) => { event.currentTarget.form.imagen.value = ""; setLocalSlideImages([]); }}> <Trash2 size={14} /> Quitar imagen{localSlideImages.length > 1 ? "es" : ""}</button><label className="admin-field"><span>Estado</span><select name="estado" defaultValue={editing.estado || "Borrador"}><option>Publicado</option><option>Borrador</option></select></label><div className="admin-editor-actions"><button type="button" className="admin-secondary-button" onClick={() => { setLocalSlideImages([]); setEditing(null); }}>Cancelar</button><button className="admin-primary-button" type="submit" disabled={processingImages}>{processingImages ? "Procesando imágenes..." : `Guardar diapositiva${localSlideImages.length > 1 ? "s" : ""}`}</button></div></form></section></div>}
    </>
  );
}

export default Admin;