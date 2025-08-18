import { useEffect, useState } from "react";

function Profesores() {
  const API_BASE = "http://localhost:7071/api/profesores";

  const [profesores, setProfesores] = useState([]);
  const [busquedaId, setBusquedaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtener todos (con paginación y filtros básicos)
  const getTodosProfesores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}?page=1&limit=5`);
      if (!res.ok) throw new Error("Error al obtener profesores");
      const data = await res.json();
      setProfesores(data.data || []); // viene en `data.rows`
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener profesor por ID
  const getProfesorById = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error("Profesor no encontrado");
      const data = await res.json();
      setProfesores([data.data]); // respuesta viene como { data: {...} }
      setError("");
    } catch (err) {
      setError(err.message);
      setProfesores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodosProfesores();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Listado de Profesores</h1>

      {/* Buscar por ID */}
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Buscar por ID..."
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() =>
            busquedaId ? getProfesorById(busquedaId) : getTodosProfesores()
          }
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Buscar
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Listado */}
      <ul className="list-disc pl-6">
        {profesores.map((p) => (
          <li key={p.id}>
            <strong>{p.nombre} {p.apellido}</strong> — {p.email} ({p.departamento})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profesores;
