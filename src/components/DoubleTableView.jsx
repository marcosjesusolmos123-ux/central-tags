import { useEffect, useState } from "react";

export default function DoubleTableView({
  onBack,
  tables,
  activeTable,
  selectedSeat,
  hoveredSeat,
  onSeatHover,
  onSeatLeave,
  onSelectSeat,
  onOpenPlayer,

  searchText,
  setSearchText,
  searchResults,
  addSearchPlayerToSeat,
  removePlayerFromSeat,
  sitPlayerInSelectedSeat,
  clearCurrentTable,
  showToast,
}) {
  const [visibleGroup, setVisibleGroup] = useState("1-2");

  useEffect(() => {
    const documentRoot = document.documentElement;
    const previousOverflowY = documentRoot.style.getPropertyValue("overflow-y");
    const previousPriority = documentRoot.style.getPropertyPriority("overflow-y");

    documentRoot.style.setProperty("overflow-y", "hidden");

    return () => {
      if (previousOverflowY) {
        documentRoot.style.setProperty(
          "overflow-y",
          previousOverflowY,
          previousPriority,
        );
      } else {
        documentRoot.style.removeProperty("overflow-y");
      }
    };
  }, []);

  const visibleTableNumbers =
    visibleGroup === "1-2" ? [1, 2] : [3, 4];

  function handleEmptyAreaShiftClick(event) {
    if (!event.shiftKey || event.button !== 0) return;

    const isTableFeltCenter = event.target.closest("[data-table-felt-center]");
    const interactiveTarget = event.target.closest(
      'button, input, textarea, select, a, [role="button"], [contenteditable="true"], [data-no-table-shortcut], .double-mini-table, .double-table-grid'
    );

    if (!isTableFeltCenter && interactiveTarget) return;

    const nextVisibleGroup = visibleGroup === "1-2" ? "3-4" : "1-2";

    setVisibleGroup(nextVisibleGroup);
    showToast(`Mostrando Mesas ${nextVisibleGroup}`, 1000);
  }

  function MiniTable({ tableNumber }) {
    const seats = tables?.[tableNumber] || [];

    return (
      <div
  className="double-mini-table"
  onClick={() => {
    onSelectSeat(tableNumber, null);
  }}
  style={{
    width: "100%",
    textAlign: "center",
  }}
>
        <div
          style={{
            position: "relative",
            minHeight: "48px",
            marginBottom: "4px",
          }}
        >
          <h2
            style={{
              color: "white",
              margin: 0,
              textAlign: "center",
            }}
          >
            Mesa {tableNumber}
          </h2>

          <button
  onClick={(event) => {
    event.stopPropagation();
    clearCurrentTable(tableNumber);
  }}
  style={{
    position: "absolute",
    top: 0,
    right: "6%",
    padding: "8px 14px",
    background: "#6d1717",
    color: "white",
    border: "1px solid #a33",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  }}
>
  Limpiar mesa {tableNumber}
</button>
        </div>

        <div
  className="double-mini-table-stage"
  onClick={() => {
    onSelectSeat(tableNumber, null);
  }}
  style={{
    position: "relative",
    width: "100%",
  }}
>
          <div
            data-table-felt-center
            style={{
              position: "absolute",
              width: "68%",
              height: "54%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#1f7a4f",
              border: "8px solid #5b321d",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "clamp(24px, 3vw, 42px)",
                fontWeight: "bold",
                opacity: 0.16,
                userSelect: "none",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              Central Tags
            </div>
          </div>
{hoveredSeat &&
 hoveredSeat.tableNumber === tableNumber &&
 !hoveredSeat.seat.hero &&
 !hoveredSeat.seat.nick.startsWith("Asiento") && (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "320px",
      background: "#111",
      border: `3px solid ${hoveredSeat.seat.color}`,
      borderRadius: "12px",
      padding: "18px",
      zIndex: 100,
      boxShadow: "0 0 25px rgba(0,0,0,0.8)",
    }}
  >
    <h2 style={{ marginTop: 0, color: "white" }}>
      {hoveredSeat.seat.nick}
    </h2>

    {hoveredSeat.seat.notes.length > 0 ? (
      hoveredSeat.seat.notes.map((note, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          {note}
        </div>
      ))
    ) : (
      <div style={{ color: "#aaa" }}>
        Sin notas todavía.
      </div>
    )}
  </div>
)}
          {seats.map((seat) => (
            <div
    key={seat.id}
    onMouseEnter={() => {
  if (seat.hero) return;
  onSeatHover({
    tableNumber,
    seat,
  });
}}
    onMouseLeave={onSeatLeave}
              onClick={(e) => {
  e.stopPropagation();

  if (seat.hero) return;

  onSelectSeat(tableNumber, seat.id);
}}
onDoubleClick={() => {
  

  if (seat.hero) return;

  onOpenPlayer(seat);
}}
              style={{
                position: "absolute",
                top: seat.top,
                left: seat.left,
                transform: "translate(-50%, -50%)",
                minWidth: "clamp(90px, 8vw, 110px)",
                padding:
                  "clamp(6px, 0.6vw, 8px) clamp(7px, 0.8vw, 10px)",
                fontSize: "clamp(13px, 1vw, 16px)",
                background: "#222",
                cursor: seat.hero ? "default" : "pointer",

                color: "white",
                border: seat.hero
  ? "3px solid #1e90ff"
  : `3px solid ${seat.color || "#666"}`,

boxShadow:
  activeTable === tableNumber && selectedSeat === seat.id
    ? "0 0 0 3px white"
    : "none",
                borderRadius: "12px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={seat.nick}
            >
              {seat.nick}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleEmptyAreaShiftClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        width: "100%",
        minHeight: "100vh",
        background: "#111",
        color: "white",
        overflowX: "auto",
        overflowY: "auto",
        padding: "10px 16px 40px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
  data-no-table-shortcut
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginBottom: "18px",
    position: "relative",
  }}
>
  <input
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        addSearchPlayerToSeat();
      }
    }}
    placeholder="Buscar jugador..."
    style={{
      width: "220px",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #555",
    }}
  />

  <button
    onClick={addSearchPlayerToSeat}
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Agregar
  </button>

  <button
    onClick={removePlayerFromSeat}
    disabled={!selectedSeat}
    style={{
      padding: "8px 14px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Quitar del asiento
  </button>

  {searchResults.length > 0 && (
    <div
      style={{
        position: "absolute",
        top: "42px",
        width: "220px",
        background: "#1b1b1b",
        border: "1px solid #555",
        borderRadius: "8px",
        padding: "5px",
        zIndex: 500,
      }}
    >
      {searchResults.map((player) => (
        <div
          key={player.nick}
          onClick={() => {
            sitPlayerInSelectedSeat(player.nick);
            setSearchText("");
          }}
          style={{
            padding: "8px",
            cursor: "pointer",
            borderBottom: "1px solid #333",
          }}
        >
          {player.nick}
        </div>
      ))}
    </div>
  )}
</div>
      <div
        data-no-table-shortcut
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={() => setVisibleGroup("1-2")}
          style={{
            padding: "10px 20px",
            background:
              visibleGroup === "1-2" ? "#1e90ff" : "#292929",
            color: "white",
            border:
              visibleGroup === "1-2"
                ? "1px solid #1e90ff"
                : "1px solid #555",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Mesas 1-2
        </button>

        <button
          onClick={() => setVisibleGroup("3-4")}
          style={{
            padding: "10px 20px",
            background:
              visibleGroup === "3-4" ? "#1e90ff" : "#292929",
            color: "white",
            border:
              visibleGroup === "3-4"
                ? "1px solid #1e90ff"
                : "1px solid #555",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Mesas 3-4
        </button>

        <button
          onClick={onBack}
          style={{
            padding: "10px 16px",
            background: "#333",
            color: "white",
            border: "1px solid #666",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Volver a una mesa
        </button>
      </div>

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="double-table-grid">
          {visibleTableNumbers.map((tableNumber) => (
            <MiniTable
              key={tableNumber}
              tableNumber={tableNumber}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
