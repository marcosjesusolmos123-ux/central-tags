function App() {
  const seats = [
    { id: 1, top: "5%", left: "50%" },
    { id: 2, top: "20%", left: "80%" },
    { id: 3, top: "50%", left: "90%" },
    { id: 4, top: "80%", left: "80%" },
    { id: 5, top: "95%", left: "50%" },
    { id: 6, top: "80%", left: "20%" },
    { id: 7, top: "50%", left: "10%" },
    { id: 8, top: "20%", left: "20%" },
  ];

  return (
    <div
      style={{
        background: "#111",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>Central Tags</h1>

      <div
        style={{
          position: "relative",
          width: "700px",
          height: "500px",
          margin: "40px auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "300px",
            background: "#1f6f4a",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "8px solid #4b2e1e",
          }}
        />

        {seats.map((seat) => (
          <div
            key={seat.id}
            style={{
              position: "absolute",
              top: seat.top,
              left: seat.left,
              transform: "translate(-50%, -50%)",
              background: "#222",
              padding: "10px",
              borderRadius: "10px",
              width: "100px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Asiento {seat.id}
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
            color: "#4da6ff",
          }}
        >
          HERO
        </div>
      </div>
    </div>
  );
}

export default App;
