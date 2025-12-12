import { useEffect, useState } from "react";
import api from "../api";

const TEST_USER_ID = "693c2a6080c4b23f03dc580c";

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loadBoards = async () => {
    try {
      const res = await api.get(`/boards/user/${TEST_USER_ID}`);
      setBoards(res.data);
      setError("");
    } catch (err) {
      console.error("load boards error", err.response || err);
      // keep error but not critical
      setError("Failed to load boards");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post(`/boards`, { name }, { params: { userId: TEST_USER_ID } });
      setName("");
      loadBoards();
    } catch (err) {
      console.error("create board error", err.response || err);
      setError("Failed to create board");
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Your Boards</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          placeholder="New board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Create
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {boards.map((b) => (
          <li key={b.id}>{b.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default BoardListPage;
