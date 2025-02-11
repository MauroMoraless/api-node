const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Configuración de Multer para aceptar imágenes y videos
const storage = multer.memoryStorage();
const upload = multer({ storage }).array("archivo", 10); // Ahora el campo es "archivo"

// 📌 CREAR INFORME
const crearInforme = async (req, res) => {
  try {
    const { idtecnico, abonado, vt, estado, observaciones, checklist } = req.body;
    
    if (!idtecnico || !abonado || !vt || !estado || !checklist) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insertar el informe con los nuevos campos
    const [result] = await connection.query(
      "INSERT INTO informes (idtecnico, abonado, vt, estado, observaciones, checklist) VALUES (?, ?, ?, ?, ?, ?)",
      [idtecnico, abonado, vt, estado, observaciones, checklist]
    );

    const id_informe = result.insertId;

    // 📌 Manejar archivos subidos (si existen)
    const archivos = req.files || []; // Evita el error cuando no se envían archivos
    let archivosGuardados = [];

    if (archivos.length > 0) {
      for (const archivo of archivos) {
        const tipoArchivo = archivo.mimetype.startsWith("image") ? "imagen" : "video";

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "informes", resource_type: tipoArchivo === "video" ? "video" : "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          stream.end(archivo.buffer);
        });

        const url = uploadResult.secure_url;
        archivosGuardados.push({ url, tipo: tipoArchivo });

        await connection.query(
          "INSERT INTO archivos_informes (id_informe, url_archivo, tipo) VALUES (?, ?, ?)",
          [id_informe, url, tipoArchivo]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Informe creado correctamente",
      informe: {
        id_informe,
        idtecnico,
        abonado,
        vt,
        estado,
        observaciones,
        checklist,
        archivos: archivosGuardados
      }
    });
  } catch (error) {
    console.error("❌ Error al crear informe:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 📌 OBTENER INFORMES CON FILTROS OPCIONALES
const obtenerInformes = async (req, res) => {
  try {
    const { idtecnico, estado, fecha, checklist } = req.query;

    let query = `
      SELECT i.id_informe, i.idtecnico, i.abonado, i.vt, t.nombre AS tecnico_nombre, 
             i.estado, i.observaciones, i.checklist, i.fecha_creacion
      FROM informes i
      JOIN tecnicos t ON i.idtecnico = t.idtecnico
      WHERE 1=1
    `;
    const params = [];

    if (idtecnico) {
      query += " AND i.idtecnico = ?";
      params.push(idtecnico);
    }
    if (estado) {
      query += " AND i.estado = ?";
      params.push(estado);
    }
    if (fecha) {
      query += " AND DATE(i.fecha_creacion) = ?";
      params.push(fecha);
    }
    if (checklist) {
      query += " AND i.checklist = ?";
      params.push(checklist);
    }

    query += " ORDER BY i.fecha_creacion DESC";

    const [informes] = await pool.query(query, params);

    for (let informe of informes) {
      const [archivos] = await pool.query(
        "SELECT id_archivo, url_archivo, tipo FROM archivos_informes WHERE id_informe = ?",
        [informe.id_informe]
      );
      informe.archivos = archivos;
    }

    res.json(informes);
  } catch (error) {
    console.error("❌ Error al obtener informes:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 📌 ELIMINAR INFORME Y SUS ARCHIVOS
const eliminarInforme = async (req, res) => {
  try {
    const { id } = req.params; // ID del informe a eliminar

    // Verificar si el informe existe
    const [informe] = await pool.query("SELECT * FROM informes WHERE id_informe = ?", [id]);
    if (informe.length === 0) {
      return res.status(404).json({ error: "Informe no encontrado" });
    }

    // Obtener las URLs y tipos de los archivos relacionados con este informe
    const [archivos] = await pool.query("SELECT url_archivo, tipo FROM archivos_informes WHERE id_informe = ?", [id]);

    // Eliminar archivos en Cloudinary
    for (const archivo of archivos) {
      const publicId = archivo.url_archivo.split("/").pop().split(".")[0]; // Extraer el public_id de la URL
      const resourceType = archivo.tipo === "video" ? "video" : "image"; // Definir tipo correcto

      await cloudinary.uploader.destroy(`informes/${publicId}`, { resource_type: resourceType });
    }

    // Eliminar los archivos de la base de datos
    await pool.query("DELETE FROM archivos_informes WHERE id_informe = ?", [id]);

    // Eliminar el informe de la base de datos
    await pool.query("DELETE FROM informes WHERE id_informe = ?", [id]);

    res.json({ message: "Informe eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar informe:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 📌 ACTUALIZAR ESTADO Y CHECKLIST DE UN INFORME
const actualizarInforme = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, checklist } = req.body;

    if (!estado && !checklist) {
      return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar (estado o checklist)" });
    }

    const estadosPermitidos = ["Continuar ruta ok", "Continuar ruta sin control", "Rechazado / Rehacer formulario"];
    if (estado && !estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const checklistPermitidos = ["Evento fuera de norma", "Conformidad de cliente", "Varios / otros"];
    if (checklist && !checklistPermitidos.includes(checklist)) {
      return res.status(400).json({ error: "Checklist inválido" });
    }

    const [informe] = await pool.query("SELECT * FROM informes WHERE id_informe = ?", [id]);
    if (informe.length === 0) {
      return res.status(404).json({ error: "Informe no encontrado" });
    }

    let query = "UPDATE informes SET ";
    const params = [];

    if (estado) {
      query += "estado = ?, ";
      params.push(estado);
    }

    if (checklist) {
      query += "checklist = ?, ";
      params.push(checklist);
    }

    query = query.slice(0, -2) + " WHERE id_informe = ?";
    params.push(id);

    await pool.query(query, params);

    res.json({ message: "Informe actualizado correctamente", id_informe: id, nuevo_estado: estado, nuevo_checklist: checklist });
  } catch (error) {
    console.error("❌ Error al actualizar el informe:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { crearInforme, upload, obtenerInformes, eliminarInforme, actualizarInforme };
