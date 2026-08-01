import { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import DoubleTableView from "./components/DoubleTableView";
function App() {
  const appContainerRef = useRef(null);
  const passwordInputRef = useRef(null);
  const heroNick = "HERO";
const EMPTY_SEAT_LABEL = "Asiento vacío";
const OLD_EMPTY_SEAT_LABEL = "Jugador vacío";

function isEmptySeatNick(nick) {
  return nick === EMPTY_SEAT_LABEL || nick === OLD_EMPTY_SEAT_LABEL;
}
  const [activeTable, setActiveTable] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [detectedNick, setDetectedNick] = useState("");
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [doubleHoveredSeat, setDoubleHoveredSeat] = useState(null);
  const [openedPlayer, setOpenedPlayer] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isEditingNick, setIsEditingNick] = useState(false);
const [editedNick, setEditedNick] = useState("");
const [editingNoteIndex, setEditingNoteIndex] = useState(null);
const [editedNoteText, setEditedNoteText] = useState("");
const [clipboardText, setClipboardText] = useState("");
const [user, setUser] = useState(null);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [confirmPassword, setConfirmPassword] = useState("");
const [isRegisterMode, setIsRegisterMode] = useState(false);
const [showVerificationScreen, setShowVerificationScreen] = useState(false);
const [verificationEmail, setVerificationEmail] = useState("");
const [unverifiedLoginUser, setUnverifiedLoginUser] = useState(null);
const [displayName, setDisplayName] = useState("");
const [heroName, setHeroName] = useState("HERO");
const [isEditingProfile, setIsEditingProfile] = useState(false);
const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
const [confirmModal, setConfirmModal] = useState(null);
const [databaseSearchText, setDatabaseSearchText] = useState("");
const [selectedDatabasePlayer, setSelectedDatabasePlayer] = useState(null);
const [importedPlayers, setImportedPlayers] = useState([]);
const [toast, setToast] = useState("");
function showToast(message) {
  setToast(message);

  setTimeout(() => {
    setToast("");
  }, 2500);
}
const [tempDisplayName, setTempDisplayName] = useState("");
const [tempHeroName, setTempHeroName] = useState("");
const [loadedUserId, setLoadedUserId] = useState(null);
const [isOcrProcessing, setIsOcrProcessing] = useState(false);
const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
const [lobbyMode, setLobbyMode] = useState("single");
  const baseSeats = [
    { id: 1, top: "5%", left: "50%" },
    { id: 2, top: "20%", left: "80%" },
    { id: 3, top: "50%", left: "92%" },
    { id: 4, top: "80%", left: "80%" },
    { id: 5, top: "95%", left: "50%", hero: true },
    { id: 6, top: "80%", left: "20%" },
    { id: 7, top: "50%", left: "8%" },
    { id: 8, top: "20%", left: "20%" },
  ];

  function createEmptyTable() {
    return baseSeats.map((seat) => ({
      ...seat,
      nick: seat.hero ? heroNick : EMPTY_SEAT_LABEL,
      color: seat.hero ? "#1e90ff" : "#666",
      notes: [],
    }));
  }

  const [tables, setTables] = useState(() => {
  const savedTables = localStorage.getItem("centralTagsTables");

  if (savedTables) {
    return JSON.parse(savedTables);
  }

  return {
    1: createEmptyTable(),
    2: createEmptyTable(),
    3: createEmptyTable(),
    4: createEmptyTable(),
    };
});

  const tagColors = [
  "#d62828", // rojo
  "#52b788", // verde
  "#277da1", // azul
  "#7b2cbf", // violeta
  "#f4a261", // naranja
  "#264653", // azul petróleo
  "#ffd60a", // amarillo
  "#8d5524", // marrón
  "#ffffff", // blanco
  "#ff66c4", // rosa
  "#00f5d4", // turquesa
  "#9ef01a", // verde lima
];

  const currentSeats = tables[activeTable];
  const seatedPlayers = Object.values(tables)
  .flat()
  .filter((seat) => !seat.hero && !isEmptySeatNick(seat.nick));

const allPlayers = [
  ...seatedPlayers,
  ...importedPlayers,
];

const uniquePlayers = allPlayers.filter(
  (player, index, self) =>
    index === self.findIndex((p) => p.nick === player.nick)
);

const exportablePlayers = allPlayers.reduce((players, player) => {
  const existingPlayer = players.find(
    (savedPlayer) => savedPlayer.nick === player.nick
  );

  if (existingPlayer) {
    existingPlayer.notes = Array.from(
      new Set([...existingPlayer.notes, ...player.notes])
    );
  } else {
    players.push({
      nick: player.nick,
      notes: [...player.notes],
    });
  }

  return players;
}, []);

const searchResults =
  searchText.trim() === ""
    ? []
    : uniquePlayers.filter((player) =>
        player.nick.toLowerCase().includes(searchText.toLowerCase())
      );
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    const verifiedUser = currentUser?.emailVerified ? currentUser : null;

    setUser(verifiedUser);
    setLoadedUserId(null);
    if (verifiedUser) {
  loadTablesFromCloud(verifiedUser);
} else {
  setImportedPlayers([]);
}
  });

  return () => unsubscribe();
}, []);
      useEffect(() => {
        if (!user || loadedUserId !== user.uid) {
  return;
}
  localStorage.setItem(
    "centralTagsTables",
    JSON.stringify(tables)
  );
  if (user) {
  setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      tables: tables,
      importedPlayers: importedPlayers,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
}, [tables, importedPlayers, user, loadedUserId]);
useEffect(() => {
  function handlePaste(event) {
  const tagName = event.target.tagName;

  if (tagName === "INPUT" || tagName === "TEXTAREA") {
    return;
  }

  if (!selectedSeat) {
    return;
  }

  const items = event.clipboardData.items;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();

      uploadImageToOCR(file);

      return;
    }
  }

  const text = event.clipboardData.getData("text");

  if (!text.trim()) return;

  pastePlayerToSeat(text);
}

  window.addEventListener("paste", handlePaste);

  return () => {
    window.removeEventListener("paste", handlePaste);
  };
}, [selectedSeat, currentSeats]);

async function registerUser() {
  if (!email || !password) {
    showToast("⚠️ Completá email y contraseña.");
    return;
  }

  if (password !== confirmPassword) {
    showToast("⚠️ Las contraseñas no coinciden.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(userCredential.user);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date().toISOString(),

      plan: "free",
      ocrUsed: 0,
      ocrLimit: 50,

      isAdmin: false,
    });

    await signOut(auth);

setVerificationEmail(email);

setShowVerificationScreen(true);

setPassword("");
setConfirmPassword("");
setEmail("");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      showToast("⚠️ Ese correo ya está registrado.");
      return;
    }

    if (error.code === "auth/weak-password") {
      showToast("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (error.code === "auth/invalid-email") {
      showToast("⚠️ El correo no es válido.");
      return;
    }

    showToast("⚠️ No se pudo crear la cuenta.");
  }
}

async function loginUser() {
  if (!email || !password) {
    showToast("⚠️ Completá email y contraseña.");
    return;
  }

  const userCredential = await signInWithEmailAndPassword(
  auth,
  email,
  password
);

if (!userCredential.user.emailVerified) {
  setUnverifiedLoginUser(userCredential.user);

  return;
}

}

async function resendLoginVerificationEmail() {
  if (!unverifiedLoginUser) return;

  try {
    await sendEmailVerification(unverifiedLoginUser);
    showToast("📧 Correo de verificación enviado.");
  } catch {
    showToast("⚠️ No se pudo enviar el correo de verificación.");
  }
}

async function confirmLoginEmailVerification() {
  if (!unverifiedLoginUser) return;

  try {
    await reload(unverifiedLoginUser);

    if (!unverifiedLoginUser.emailVerified) {
      showToast("⚠️ Tu correo todavía no fue verificado.");
      return;
    }

    setUnverifiedLoginUser(null);
    setUser(unverifiedLoginUser);
    await loadTablesFromCloud(unverifiedLoginUser);
  } catch {
    showToast("⚠️ No se pudo comprobar la verificación del correo.");
  }
}

async function logoutUser() {
  setEmail("");
  setPassword("");
  setShowPassword(false);
  setLoadedUserId(null);
  await signOut(auth);
}  
async function saveTablesToCloud() {
  if (!user) {
    showToast("⚠️ Tenés que iniciar sesión para guardar.");
    return;
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      tables: tables,
      importedPlayers: importedPlayers,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  showToast("✅ Mesas guardadas en la nube.");
}
async function loadTablesFromCloud(targetUser = user) {
  if (!targetUser) return;

  const docRef = doc(db, "users", targetUser.uid);
  const docSnap = await getDoc(docRef);
  const emptyTables = {
    1: createEmptyTable(),
    2: createEmptyTable(),
    3: createEmptyTable(),
    4: createEmptyTable(),
  };

  if (docSnap.exists()) {
    const data = docSnap.data();
    setDisplayName(data.displayName || "");
    setHeroName(data.heroName || "HERO");
    setTables(data.tables || emptyTables);

    setImportedPlayers(
      Array.isArray(data.importedPlayers) ? data.importedPlayers : []
    );
    showToast("✅ Datos cargados desde la nube.");
  } else {
    setDisplayName("");
    setHeroName("HERO");
    setTables(emptyTables);
    setImportedPlayers([]);
  }

  setLoadedUserId(targetUser.uid);
}
function updateCurrentTable(newSeats) {
    setTables((currentTables) => ({
      ...currentTables,
      [activeTable]: newSeats,
    }));
  }

  function changeTable(tableNumber) {
    setActiveTable(tableNumber);
    setSelectedSeat(null);
    setHoveredSeat(null);
    setOpenedPlayer(null);
  }
function sitPlayerInSelectedSeat(nick) {
  if (!selectedSeat) {
    showToast("⚠️ Primero seleccioná un asiento.");
    return;
  }

  if (selectedSeat === 5) {
    showToast("⚠️ No podés reemplazar tu asiento.");
    return;
  }

  const cleanNick = nick.trim();

  if (!cleanNick) {
    showToast("⚠️ Escribí un nick.");
    return;
  }
const selectedSeatData = currentSeats.find(
  (seat) => seat.id === selectedSeat
);

if (selectedSeatData && !isEmptySeatNick(selectedSeatData.nick)) {
  showToast("⚠️ Este asiento ya está ocupado. Primero quitá el jugador.");
  return;
}
  const existingPlayer = allPlayers.find(
  (player) => player.nick === cleanNick
);
  const playerAlreadyExists = currentSeats.some(
  (seat) =>
    seat.id !== selectedSeat &&
    seat.nick === cleanNick
);

if (playerAlreadyExists) {
  showToast("⚠️ Este jugador ya está sentado en la mesa.");
  return;
}

  updateCurrentTable(
    currentSeats.map((seat) =>
      seat.id === selectedSeat
        ? {
            ...seat,
            nick: existingPlayer ? existingPlayer.nick : cleanNick,
            color: existingPlayer ? existingPlayer.color : "#666",
            notes: existingPlayer ? existingPlayer.notes : [],
          }
        : seat
    )
  );
}
  function pastePlayerToSeat(text) {
  sitPlayerInSelectedSeat(text);
}
async function uploadImageToOCR(file) {
  try {
    setIsOcrProcessing(true);
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://central-tags-server.onrender.com/ocr/test", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.ok) {
      showToast("⚠️ Error OCR: " + data.message);
      return;
    }

    if (!data.text.trim()) {
      showToast("⚠️ No se detectó texto.");
      return;
    }

    pastePlayerToSeat(data.text.trim());
    } catch (error) {
    console.error(error);
    showToast("⚠️ No se pudo conectar con el servidor OCR.");
  } finally {
    setIsOcrProcessing(false);
  }
}
  function addSearchPlayerToSeat() {
  sitPlayerInSelectedSeat(searchText);
setSearchText("");
}
  function addPlayerToSeat() {
  sitPlayerInSelectedSeat(detectedNick);
  setDetectedNick("");
}

  function removePlayerFromSeat() {
    if (!selectedSeat) return showToast("⚠️ Primero seleccioná un asiento.");
    if (selectedSeat === 5) return showToast("⚠️ No podés limpiar tu propio asiento.");

    const playerToArchive = currentSeats.find(
      (seat) => seat.id === selectedSeat
    );

    if (!playerToArchive || isEmptySeatNick(playerToArchive.nick)) {
      return showToast("⚠️ El asiento ya está vacío.");
    }

    setImportedPlayers((currentPlayers) => {
      const existingPlayer = currentPlayers.find(
        (player) => player.nick === playerToArchive.nick
      );

      if (!existingPlayer) {
        return [...currentPlayers, { ...playerToArchive }];
      }

      return currentPlayers.map((player) =>
        player.nick === playerToArchive.nick
          ? {
              ...player,
              color: playerToArchive.color,
              notes: Array.from(
                new Set([...player.notes, ...playerToArchive.notes])
              ),
            }
          : player
      );
    });

    updateCurrentTable(
      currentSeats.map((seat) =>
        seat.id === selectedSeat
          ? { ...seat, nick: EMPTY_SEAT_LABEL, color: "#666", notes: [] }
          : seat
      )
    );

    setSelectedSeat(null);
    setHoveredSeat(null);
    setOpenedPlayer(null);
    showToast("Jugador guardado en la base de datos.");
  }
function clearCurrentTable(tableNumber = activeTable) {
  const seatsToClear = tables[tableNumber];

  setConfirmModal({
    title: "Limpiar mesa",
    message:
      "¿Seguro que querés quitar todos los jugadores de esta mesa?\n\nEsto no borrará la base de datos.",
    onConfirm: () => {
      const playersToKeep = seatsToClear.filter(
        (seat) => !seat.hero && !isEmptySeatNick(seat.nick)
      );

      setImportedPlayers((currentPlayers) => {
        const mergedPlayers = [...currentPlayers];

        playersToKeep.forEach((playerToKeep) => {
          const existingPlayer = mergedPlayers.find(
            (player) => player.nick === playerToKeep.nick
          );

          if (existingPlayer) {
            existingPlayer.color = playerToKeep.color;
            existingPlayer.notes = Array.from(
              new Set([...existingPlayer.notes, ...playerToKeep.notes])
            );
          } else {
            mergedPlayers.push(playerToKeep);
          }
        });

        return mergedPlayers;
      });

      setTables((currentTables) => ({
        ...currentTables,
        [tableNumber]: currentTables[tableNumber].map((seat) =>
          seat.hero
            ? seat
            : { ...seat, nick: EMPTY_SEAT_LABEL, color: "#666", notes: [] }
        ),
      }));

      setSelectedSeat(null);
      setHoveredSeat(null);
      setOpenedPlayer(null);
      setConfirmModal(null);
      showToast("Mesa limpiada.");
    },
  });
}
  function openPlayerCard(seat) {
  if (seat.hero || isEmptySeatNick(seat.nick)) return;
  setOpenedPlayer(seat);
  setEditedNick(seat.nick);
  setIsEditingNick(false);
  setHoveredSeat(null);
}

  function closePlayerCard() {
  setOpenedPlayer(null);
  setNewNote("");
  setIsEditingNick(false);
  setEditedNick("");
}

function changePlayerColor(color) {
  const targetNick = openedPlayer.nick;

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
        seat.nick === targetNick
          ? { ...seat, color }
          : seat
      );
    });

    return updatedTables;
  });

  setImportedPlayers((currentPlayers) =>
    currentPlayers.map((player) =>
      player.nick === targetNick ? { ...player, color } : player
    )
  );

  setOpenedPlayer((current) => ({ ...current, color }));
}
function saveEditedNick() {
  if (!editedNick.trim()) return;

  const oldNick = openedPlayer.nick;
  const newNick = editedNick.trim();

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
        seat.nick === oldNick
          ? { ...seat, nick: newNick }
          : seat
      );
    });

    return updatedTables;
  });

  setImportedPlayers((currentPlayers) =>
    currentPlayers.map((player) =>
      player.nick === oldNick ? { ...player, nick: newNick } : player
    )
  );

  setOpenedPlayer((current) => ({
    ...current,
    nick: newNick,
  }));

  setIsEditingNick(false);
}
  function saveNote() {
  if (!newNote.trim()) return;

  const today = new Date().toLocaleDateString("es-AR");
  const noteWithDate = `${today} - ${newNote.trim()}`;
  const targetNick = openedPlayer.nick;

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
        seat.nick === targetNick
          ? { ...seat, notes: [noteWithDate, ...seat.notes] }
          : seat
      );
    });

    return updatedTables;
  });

  setImportedPlayers((currentPlayers) =>
    currentPlayers.map((player) =>
      player.nick === targetNick
        ? { ...player, notes: [noteWithDate, ...player.notes] }
        : player
    )
  );

  setOpenedPlayer((current) => ({
    ...current,
    notes: [noteWithDate, ...current.notes],
  }));

  setNewNote("");
}
  function deleteNote(noteIndex) {
  const targetNick = openedPlayer.nick;
  const updatedNotes = openedPlayer.notes.filter(
    (_, index) => index !== noteIndex
  );

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
        seat.nick === targetNick
          ? {
              ...seat,
              notes: updatedNotes,
            }
          : seat
      );
    });

    return updatedTables;
  });

  setImportedPlayers((currentPlayers) =>
    currentPlayers.map((player) =>
      player.nick === targetNick
        ? {
            ...player,
            notes: updatedNotes,
          }
        : player
    )
  );

  setOpenedPlayer((current) => ({
    ...current,
    notes: updatedNotes,
  }));
}
function saveEditedNote() {
  if (!editedNoteText.trim()) return;

  const targetNick = openedPlayer.nick;
  const newNote = editedNoteText.trim();

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) => {
        if (seat.nick !== targetNick) {
          return seat;
        }

        const updatedNotes = [...seat.notes];

        if (
          editingNoteIndex >= 0 &&
          editingNoteIndex < updatedNotes.length
        ) {
          updatedNotes[editingNoteIndex] = newNote;
        }

        return {
          ...seat,
          notes: updatedNotes,
        };
      });
    });

    return updatedTables;
  });

  setImportedPlayers((currentPlayers) =>
    currentPlayers.map((player) =>
      player.nick === targetNick
        ? {
            ...player,
            notes: player.notes.map((note, index) =>
              index === editingNoteIndex ? newNote : note
            ),
          }
        : player
    )
  );

  setOpenedPlayer((current) => {
    const updatedNotes = [...current.notes];

    if (
      editingNoteIndex >= 0 &&
      editingNoteIndex < updatedNotes.length
    ) {
      updatedNotes[editingNoteIndex] = newNote;
    }

    return {
      ...current,
      notes: updatedNotes,
    };
  });

  setEditingNoteIndex(null);
  setEditedNoteText("");
}
    return (
      <>
  {!user && (
  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    }}
  >
    <div
      style={{
        width: "calc(100% - 32px)",
maxWidth: "420px",
margin: "0 auto",
        background: "#1b1b1b",
        border: "1px solid #444",
        borderRadius: "18px",
        padding: "32px",
        boxShadow: "0 0 30px rgba(0,0,0,0.8)",
        textAlign: "center",
      }}
    >
      {unverifiedLoginUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6000,
          }}
        >
          <div
            style={{
              width: "calc(100% - 32px)",
              maxWidth: "420px",
              background: "#1b1b1b",
              border: "1px solid #555",
              borderRadius: "18px",
              padding: "32px",
              textAlign: "center",
              color: "white",
              boxShadow: "0 0 30px rgba(0,0,0,0.8)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "24px", color: "#FFFFFF" }}>
              ⚠️ Tu correo todavía no fue verificado.
            </h2>

            <button
              onClick={resendLoginVerificationEmail}
              style={{
                width: "100%",
                padding: "14px",
                marginBottom: "12px",
                background: "#1e90ff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              Reenviar correo de verificación
            </button>

            <button
              onClick={confirmLoginEmailVerification}
              style={{
                width: "100%",
                padding: "14px",
                background: "#292929",
                color: "white",
                border: "1px solid #555",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Ya verifiqué mi correo
            </button>
          </div>
        </div>
      )}
      {showVerificationScreen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 6000,
    }}
  >
    <div
      style={{
        width: "calc(100% - 32px)",
maxWidth: "420px",
        background: "#1b1b1b",
        border: "1px solid #555",
        borderRadius: "18px",
        padding: "32px",
        textAlign: "center",
        color: "white",
        boxShadow: "0 0 30px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          fontSize: "46px",
          marginBottom: "12px",
        }}
      >
        📧
      </div>

      <h2
        style={{
          marginTop: 0,
          marginBottom: "14px",
          color: "white",
        }}
      >
        Verificá tu correo
      </h2>

      <p
        style={{
          color: "#bbb",
          lineHeight: "1.6",
          marginBottom: "10px",
        }}
      >
        Te enviamos un enlace para verificar tu cuenta a:
      </p>

      <p
        style={{
          color: "white",
          fontWeight: "bold",
          wordBreak: "break-word",
          marginBottom: "24px",
        }}
      >
        {verificationEmail}
      </p>

      <button
        onClick={() =>
          window.open(
            "https://mail.google.com/mail/u/0/#inbox",
            "_blank",
            "noopener,noreferrer"
          )
        }
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "12px",
          background: "#1e90ff",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Abrir Gmail
      </button>

      <button
        onClick={() => {
          setShowVerificationScreen(false);
          setIsRegisterMode(false);
        }}
        style={{
          width: "100%",
          padding: "14px",
          background: "#292929",
          color: "white",
          border: "1px solid #555",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "15px",
        }}
      >
        Volver al inicio de sesión
      </button>

      <p
        style={{
          color: "#888",
          fontSize: "13px",
          lineHeight: "1.4",
          marginTop: "18px",
          marginBottom: 0,
        }}
      >
        Revisá también la carpeta de spam o correo no deseado.
      </p>
    </div>
  </div>
)}
    {toast && (
  <div
    style={{
      position: "fixed",
      top: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1b1b1b",
      color: "white",
      border: "1px solid #555",
      borderRadius: "10px",
      padding: "12px 18px",
      zIndex: 7000,
      boxShadow: "0 0 12px rgba(0,0,0,0.5)",
    }}
  >
    {toast}
  </div>
)}
      <h1
  style={{
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "42px",
    color: "white",
  }}
>
        Central Tags
      </h1>

      <p
  style={{
    color: "#aaa",
    marginTop: "18px",
    marginBottom: "35px",
    fontSize: "17px",
    lineHeight: "1.5",
  }}
>
        {isRegisterMode
  ? "Crea tu cuenta para empezar a usar Central Tags"
  : "Inicia sesión para gestionar tu base de jugadores"}
      </p>

      <input
      
        placeholder="Email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "12px",
          borderRadius: "10px",
          border: "1px solid #555",
          boxSizing: "border-box",
          fontSize: "16px",
        }}
      />

      <div style={{ position: "relative" }}>
        <input
          ref={passwordInputRef}
          type={!isRegisterMode && showPassword ? "text" : "password"}
          placeholder="Contraseña"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            paddingRight: !isRegisterMode ? "48px" : "14px",
            marginBottom: "18px",
            borderRadius: "10px",
            border: "1px solid #555",
            boxSizing: "border-box",
            fontSize: "16px",
          }}
        />
        {!isRegisterMode && (
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((current) => !current)}
            style={{
              position: "absolute",
              top: "23px",
              right: "14px",
              transform: "translateY(-50%)",
              padding: 0,
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              lineHeight: 1,
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
{isRegisterMode && (
  <input
    type="password"
    placeholder="Confirmar contraseña"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      marginBottom: "18px",
      borderRadius: "10px",
      border: "1px solid #555",
      boxSizing: "border-box",
      fontSize: "16px",
    }}
  />
)}
      <button
        onClick={isRegisterMode ? registerUser : loginUser}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "none",
          background: "#1e90ff",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        {isRegisterMode ? "Crear cuenta" : "Iniciar sesión"}
      </button>

      <div
  style={{
    textAlign: "center",
    marginTop: "8px",
    fontSize: "14px",
    color: "#aaa",
  }}
>
  {isRegisterMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
  <span
    onClick={() => {
  setIsRegisterMode(!isRegisterMode);
  setPassword("");
  setConfirmPassword("");
}}
    style={{
      color: "#4da3ff",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    {isRegisterMode ? "Iniciar sesión" : "Crea una aqui"}
  </span>
</div>

<div
  style={{
    textAlign: "center",
    marginTop: "8px",
    fontSize: "14px",
    color: "#aaa",
  }}
>
  ¿Olvidaste tu contraseña?{" "}
  <span
  onClick={async () => {
  if (!email.trim()) {
    showToast("⚠️ Escribí tu correo primero.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    showToast("📧 Te enviamos un correo para recuperar tu contraseña.");
  } catch (error) {
    if (error.code === "auth/invalid-email") {
      showToast("⚠️ El correo no es válido.");
      return;
    }

    showToast("⚠️ No se pudo enviar el correo de recuperación.");
  }
}}
    style={{
      color: "#4da3ff",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Recuperala aqui
  </span>
</div>
    </div>
  </div>
)}

  {user && (
    <div
  style={{
    background: "#111",
    minHeight: "100vh",
    minWidth: "740px",
width: "100%",
boxSizing: "border-box",
    color: "white",
    padding: "20px",
    position: "relative",
    overflowX: "visible",
  }}
>
      {isOcrProcessing && (
  <div
    style={{
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "320px",
  background: "#111",
  color: "white",
  border: "3px solid #1e90ff",
  borderRadius: "14px",
  padding: "22px",
  textAlign: "center",
  zIndex: 30,
  boxShadow: "0 0 25px rgba(0,0,0,0.8)",
}}
  >
    <div
  style={{
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "18px",
  }}
>
  🔍 Procesando OCR...
</div>

<div
  style={{
    color: "#bbb",
    fontSize: "16px",
    marginBottom: "18px",
  }}
>
  Reconociendo el nickname...
</div>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    fontSize: "26px",
    color: "#1e90ff",
  }}
>
  ● ● ●
</div>
  </div>
)}
      <h1 style={{ textAlign: "center", color: "white" }}>Central Tags</h1>
      {lobbyMode === "double" && (
  <DoubleTableView
  onBack={() => setLobbyMode("single")}
  tables={tables}
  activeTable={activeTable}
  selectedSeat={selectedSeat}
  hoveredSeat={doubleHoveredSeat}
  onSeatHover={(data) => {
    setDoubleHoveredSeat(data);
  }}
  onSeatLeave={() => {
    setDoubleHoveredSeat(null);
  }}
  onSelectSeat={(tableNumber, seatId) => {
    setActiveTable(tableNumber);
    setSelectedSeat(seatId);
  }}
  onOpenPlayer={openPlayerCard}

    searchText={searchText}
  setSearchText={setSearchText}
  searchResults={searchResults}
  addSearchPlayerToSeat={addSearchPlayerToSeat}
  sitPlayerInSelectedSeat={sitPlayerInSelectedSeat}
  clearCurrentTable={clearCurrentTable}
/>
)}
      {toast && (
  <div
    style={{
      position: "fixed",
top: "50%",
left: "50%",
transform: "translate(-50%, -50%)",
      background: "#1b1b1b",
      color: "white",
      border: "1px solid #555",
      borderRadius: "10px",
      padding: "12px 16px",
      zIndex: 7000,
      boxShadow: "0 0 12px rgba(0,0,0,0.5)",
    }}
  >
    {toast}
  </div>
)}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
  <button
  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
  style={{
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  👤
</button>
{isUserMenuOpen && (
  <div
    onClick={() => setIsUserMenuOpen(false)}
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 199,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "60px",
        right: "20px",
        background: "#1b1b1b",
      border: "1px solid #444",
      borderRadius: "10px",
      padding: "12px",
      zIndex: 200,
      width: "190px",
      textAlign: "left",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
      👤 {displayName}
    </div>

    <hr />

    <button
  onClick={() => {
    setTempDisplayName(displayName);
    setTempHeroName(heroName);
    setIsEditingProfile(true);
  }}
  style={{ width: "100%", marginBottom: "6px" }}
>
  Editar perfil
</button>
<div
  style={{
    marginBottom: "10px",
    padding: "10px",
    background: "#222",
    border: "1px solid #444",
    borderRadius: "8px",
  }}
>
  <div
    style={{
      color: "#bbb",
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "8px",
    }}
  >
    Vista de mesas
  </div>

  <button
    onClick={() => {
      setLobbyMode("single");
      setIsUserMenuOpen(false);
    }}
    style={{
      width: "100%",
      marginBottom: "6px",
      padding: "7px",
      background: lobbyMode === "single" ? "#1e90ff" : "#333",
      color: "white",
      border: "1px solid #555",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Una mesa
  </button>

  <button
    onClick={() => {
      setLobbyMode("double");
      setIsUserMenuOpen(false);
    }}
    style={{
      width: "100%",
      padding: "7px",
      background: lobbyMode === "double" ? "#1e90ff" : "#333",
      color: "white",
      border: "1px solid #555",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Dos mesas
  </button>
</div>
    <button style={{ width: "100%", marginBottom: "6px" }}>
      Configuración
    </button>
<button
  onClick={() => {
    setIsDatabaseOpen(true);
    setIsUserMenuOpen(false);
  }}
  style={{ width: "100%", marginBottom: "6px" }}
>
  Base de datos
</button>
    <button
  onClick={() => {
    const dataToExport = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      displayName,
      heroName,
      players: exportablePlayers,
    };

    const file = new Blob(
      [JSON.stringify(dataToExport, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "central-tags-backup.json";
    link.click();

    URL.revokeObjectURL(url);
  }}
  style={{ width: "100%", marginBottom: "6px" }}
>
  Exportar base
</button>

    <button
  onClick={() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (event) => {
      const file = event.target.files[0];

      if (!file) return;

      const text = await file.text();
      const importedData = JSON.parse(text);

      if (importedData.type === "player" && importedData.player) {
  const importedPlayer = importedData.player;

  setImportedPlayers((currentPlayers) => {
    const existingPlayer = currentPlayers.find(
      (player) => player.nick === importedPlayer.nick
    );

    if (existingPlayer) {
      return currentPlayers.map((player) =>
        player.nick === importedPlayer.nick
          ? {
              ...player,
              notes: Array.from(
                new Set([...player.notes, ...importedPlayer.notes])
              ),
            }
          : player
      );
    }

    return [
  ...currentPlayers,
  {
    ...importedPlayer,
    color: "#666",
  },
];
  });

  setTables((currentTables) => {
    const updatedTables = {};

    Object.keys(currentTables).forEach((tableNumber) => {
      updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
        seat.nick === importedPlayer.nick
          ? {
              ...seat,
              notes: Array.from(
                new Set([...seat.notes, ...importedPlayer.notes])
              ),
            }
          : seat
      );
    });

    return updatedTables;
  });

  showToast("✅ Jugador importado correctamente.");
  return;
}

if (Array.isArray(importedData.players) || importedData.tables) {
  const playersFromImportedBase = Array.isArray(importedData.players)
    ? importedData.players
        .filter(
          (player) =>
            player &&
            typeof player.nick === "string" &&
            Array.isArray(player.notes)
        )
        .map((player) => ({
          nick: player.nick,
          notes: player.notes,
          color: "#666",
        }))
    : Object.values(importedData.tables)
        .flat()
        .filter((seat) => !seat.hero && !isEmptySeatNick(seat.nick));

  const currentKnownPlayers = [...uniquePlayers];
setTables((currentTables) => {
  const updatedTables = {};

  Object.keys(currentTables).forEach((tableNumber) => {
    updatedTables[tableNumber] = currentTables[tableNumber].map((seat) => {
      const importedPlayer = playersFromImportedBase.find(
        (player) => player.nick === seat.nick
      );

      if (!importedPlayer) return seat;

      return {
        ...seat,
        notes: Array.from(
          new Set([...seat.notes, ...importedPlayer.notes])
        ),
      };
    });
  });

  return updatedTables;
});
  setImportedPlayers((currentPlayers) => {
    const mergedPlayers = [...currentPlayers];

    playersFromImportedBase.forEach((importedPlayer) => {
      const existingPlayer = currentKnownPlayers.find(
        (player) => player.nick === importedPlayer.nick
      );

      const existingImportedPlayer = mergedPlayers.find(
        (player) => player.nick === importedPlayer.nick
      );

      if (existingImportedPlayer) {
        existingImportedPlayer.notes = Array.from(
          new Set([...existingImportedPlayer.notes, ...importedPlayer.notes])
        );
        return;
      }

      if (existingPlayer) {
        mergedPlayers.push({
          ...existingPlayer,
          notes: Array.from(
            new Set([...existingPlayer.notes, ...importedPlayer.notes])
          ),
        });
        return;
      }

      mergedPlayers.push({
        ...importedPlayer,
        color: "#666",
      });
    });

    return mergedPlayers;
  });
}

if (importedData.displayName) {
  setDisplayName(importedData.displayName);
}

if (importedData.heroName) {
  setHeroName(importedData.heroName);
}

showToast("✅ Base importada correctamente");
    };

    input.click();
  }}
  style={{ width: "100%", marginBottom: "6px" }}
>
  Importar base
</button>

    <button style={{ width: "100%", marginBottom: "6px" }}>
      Compartir base
    </button>

    <button onClick={logoutUser} style={{ width: "100%" }}>
      Cerrar sesión
    </button>
      </div>
  </div>
)}
{isEditingProfile && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 300,
    }}
  >
    <div
      style={{
        background: "#1b1b1b",
        border: "1px solid #555",
        borderRadius: "12px",
        padding: "20px",
        width: "350px",
      }}
    >
      <h2 style={{ color: "white", marginTop: 0 }}>
  Editar perfil
</h2>

      <label>Nombre visible</label>
      <input
        value={tempDisplayName}
        onChange={(e) => setTempDisplayName(e.target.value)}
        style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
      />

      <label>Nick Hero</label>
      <input
        value={tempHeroName}
        onChange={(e) => setTempHeroName(e.target.value)}
        style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
      />

      <button
        onClick={() => {
          const finalHeroName = tempHeroName.trim() || "HERO";
          setDisplayName(tempDisplayName);
          setHeroName(finalHeroName);
          if (user) {
  setDoc(
    doc(db, "users", user.uid),
    {
      displayName: tempDisplayName,
      heroName: finalHeroName,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
          setTables((currentTables) => {
  const updatedTables = {};

  Object.keys(currentTables).forEach((tableNumber) => {
    updatedTables[tableNumber] = currentTables[tableNumber].map((seat) =>
      seat.hero ? { ...seat, nick: finalHeroName } : seat
    );
  });

  return updatedTables;
});
          setIsEditingProfile(false);
          setIsUserMenuOpen(false);
        }}
        style={{ marginRight: "10px" }}
      >
        Guardar
      </button>

      <button onClick={() => setIsEditingProfile(false)}>
        Cancelar
      </button>
      
    </div>
  </div>
)}
  
  

</div>
      {isDatabaseOpen && (
  <div
  onClick={() => setIsDatabaseOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 300,
    }}
  >
    <div
    onClick={(e) => e.stopPropagation()}
      style={{
        background: "#1b1b1b",
        border: "1px solid #555",
        borderRadius: "12px",
        padding: "20px",
        width: "700px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  }}
>
  <h2 style={{ color: "white", margin: 0 }}>
    Base de datos
  </h2>

  <button
  onClick={() => {
  setConfirmModal({
  title: "Borrar base de datos",
  message: "¿Seguro que querés borrar toda la base de datos?\n\nEsta acción no se puede deshacer.",
  onConfirm: () => {
    const emptyTables = {
      1: createEmptyTable(),
      2: createEmptyTable(),
      3: createEmptyTable(),
      4: createEmptyTable(),
    };

    setTables(emptyTables);
    setImportedPlayers([]);
    setSelectedDatabasePlayer(null);
    setDatabaseSearchText("");
    showToast("Base de datos borrada.");
    setConfirmModal(null);
  },
});

return;

  const emptyTables = {
    1: createEmptyTable(),
    2: createEmptyTable(),
    3: createEmptyTable(),
    4: createEmptyTable(),
  };

  setTables(emptyTables);
  setSelectedDatabasePlayer(null);
  setDatabaseSearchText("");
  showToast("Base de datos borrada.");
}}
    style={{
      background: "#b22222",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "8px 12px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Borrar base
  </button>
</div>

<p style={{ color: "white" }}>Total de jugadores: {uniquePlayers.length}</p>
<input
  value={databaseSearchText}
  onChange={(e) => setDatabaseSearchText(e.target.value)}
  placeholder="Buscar jugador en base..."
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #444",
  }}
/>
<button
  onClick={() => {
    if (!selectedDatabasePlayer) {
      showToast("⚠️ Seleccioná un jugador primero.");
      return;
    }

    const file = new Blob(
      [
        JSON.stringify(
          {
            type: "player",
            version: "1.0",
            player: {
              nick: selectedDatabasePlayer.nick,
              notes: selectedDatabasePlayer.notes,
            },
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedDatabasePlayer.nick}.json`;

    link.click();

    URL.revokeObjectURL(url);
  }}
  style={{ marginRight: "10px", marginBottom: "15px" }}
>
  Exportar jugador
</button>

<button onClick={() => setIsDatabaseOpen(false)} style={{ marginBottom: "15px" }}>
  Cerrar
</button>

{uniquePlayers
  .filter((player) =>
    player.nick.toLowerCase().includes(databaseSearchText.toLowerCase())
  )
  .map((player) => (
  <div
    key={player.nick}
    onClick={() => setSelectedDatabasePlayer(player)}
    style={{
      background: "#111",
      border: "1px solid #444",
      boxShadow:
  selectedDatabasePlayer?.nick === player.nick
    ? "0 0 10px #1e90ff"
    : "none",
      borderRadius: "8px",
      padding: "10px",
      marginBottom: "10px",
      color: "white",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
      {player.nick}
    </div>

    <div
      style={{
        height: "6px",
        background: player.color,
        borderRadius: "5px",
        marginBottom: "8px",
      }}
    />

    {player.notes.length > 0 ? (
      player.notes.map((note, index) => (
        <div key={index} style={{ fontSize: "14px", marginBottom: "4px" }}>
          {note}
        </div>
      ))
    ) : (
      <div style={{ fontSize: "14px", opacity: 0.7 }}>
        Sin notas
      </div>
    )}
  </div>
))}
    </div>
  </div>
)}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
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
      padding: "10px",
      width: "300px",
      borderRadius: "8px",
      border: "1px solid #444",
    }}
  />
  <button
  onClick={addSearchPlayerToSeat}
  style={{
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  Agregar
</button>
  {searchResults.length > 0 && (
  <div
    style={{
      width: "300px",
      margin: "10px auto",
      background: "#1b1b1b",
      border: "1px solid #555",
      borderRadius: "8px",
      padding: "5px",
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

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        {[1, 2, 3, 4].map((tableNumber) => (
          <button
            key={tableNumber}
            onClick={() => changeTable(tableNumber)}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              background: activeTable === tableNumber ? "#1e90ff" : "#222",
              color: "white",
              border: activeTable === tableNumber ? "2px solid #77bdff" : "1px solid #444",
            }}
          >
            Mesa {tableNumber}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        

        <button
  onClick={removePlayerFromSeat}
  style={{ padding: "10px 15px", borderRadius: "8px", cursor: "pointer", marginRight: "10px" }}
>
  Quitar del asiento
</button>

<button
  onClick={() => clearCurrentTable()}
  style={{
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#5c1a1a",
    color: "white",
    border: "1px solid #833",
  }}
>
  Limpiar mesa
</button>
      </div>

      <div
  style={{
    position: "relative",
    width: "100%",
    maxWidth: "900px",
    minWidth: "700px",
    height: "600px",
    margin: "0 auto",
  }}
>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSeat(null);
          }}
          style={{
            position: "absolute",
            width: "650px",
            height: "380px",
            background: "#1f6f4a",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "10px solid #4b2e1e",
          }}
        />

        {hoveredSeat && !hoveredSeat.hero && !isEmptySeatNick(hoveredSeat.nick) && !openedPlayer && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "360px",
              background: "#111",
              border: `3px solid ${hoveredSeat.color}`,
              borderRadius: "12px",
              padding: "18px",
              zIndex: 20,
              boxShadow: "0 0 25px rgba(0,0,0,0.8)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "white" }}>{hoveredSeat.nick}</h2>
            

            {hoveredSeat.notes.length > 0 ? (
              hoveredSeat.notes.map((note, index) => (
                <div key={index} style={{ marginBottom: "10px", fontSize: "17px" }}>
                  {note}
                </div>
              ))
            ) : (
              <div style={{ fontSize: "14px", color: "#aaa" }}>Sin notas todavía.</div>
            )}
          </div>
        )}

        {currentSeats.map((seat) => (
  <div
    className="seat-card"
    key={seat.id}
    onClick={() => {
      setSelectedSeat(seat.id);
    }}
            onDoubleClick={() => {
              openPlayerCard(seat);
            }}
            onMouseEnter={() => setHoveredSeat(seat)}
            onMouseLeave={() => setHoveredSeat(null)}
            style={{
              position: "absolute",
              top: seat.top,
              left: seat.left,
              transform: "translate(-50%, -50%)",
              background: "#222",
              padding: "12px",
              borderRadius: "12px",
              width: "165px",
              textAlign: "center",
              cursor: "pointer",
              border: `3px solid ${seat.color}`,
boxShadow: selectedSeat === seat.id ? "0 0 0 3px #222, 0 0 0 5px white" : "none",
            }}
          >
            <div
  style={{
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: "1.25",
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", "Segoe UI", sans-serif',
  overflow: "hidden",
  textOverflow: "ellipsis",
}}
>
  {seat.nick}
</div>
            
          </div>
        ))}
      </div>

      {openedPlayer && (
        <div
          onClick={closePlayerCard}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "650px",
              background: "#1b1b1b",
              border: `3px solid ${openedPlayer.color}`,
              borderRadius: "14px",
              padding: "22px",
            }}
          >
            {isEditingNick ? (
  <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
    <input
      value={editedNick}
      onChange={(e) => setEditedNick(e.target.value)}
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #555",
      }}
    />

    <button onClick={saveEditedNick} style={{ cursor: "pointer" }}>
      Guardar
    </button>
  </div>
) : (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <h2 style={{ margin: 0, color: "white" }}>{openedPlayer.nick}</h2>

    <button
      onClick={() => setIsEditingNick(true)}
      style={{ cursor: "pointer" }}
    >
      Editar
    </button>
  </div>
)}

            <strong>Color:</strong>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "15px" }}>
              {tagColors.map((color) => (
                <button
                  key={color}
                  onClick={() => changePlayerColor(color)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: color,
                    border: openedPlayer.color === color ? "3px solid white" : "1px solid #333",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
<div style={{ display: "flex", gap: "10px", alignItems: "stretch" }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    saveNote();
  }
}}
              placeholder="Escribí una nueva nota..."
              style={{ width: "100%", height: "55px", padding: "10px", borderRadius: "8px", resize: "none" }}
            />

            <button onClick={saveNote} style={{ padding: "10px 15px", cursor: "pointer" }}>
              Guardar nota
            </button>
            </div>

            

            {openedPlayer.notes.length > 0 ? (
              openedPlayer.notes.map((note, index) => (
  <div
    key={index}
    style={{
      borderTop: "1px solid #444",
      padding: "10px 0",
      fontSize: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "10px",
    }}
  >
    

    {editingNoteIndex === index ? (
  <>
    <input
      value={editedNoteText}
      onChange={(e) => setEditedNoteText(e.target.value)}
      style={{
        flex: 1,
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #555",
      }}
    />

    <button
      onClick={saveEditedNote}
      style={{ cursor: "pointer" }}
    >
      Guardar
    </button>
  </>
) : (
  <>
    <span>{note}</span>

    <div style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={() => {
          setEditingNoteIndex(index);
          setEditedNoteText(note);
        }}
        style={{ cursor: "pointer" }}
      >
        Editar
      </button>

      <button
        onClick={() => deleteNote(index)}
        style={{
          cursor: "pointer",
          background: "#5c1a1a",
          color: "white",
          border: "1px solid #833",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      >
        Borrar
      </button>
    </div>
  </>
)}
  </div>
))
            ) : (
              <div style={{ color: "#aaa" }}>Sin notas todavía.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )}
  {confirmModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 8000,
    }}
  >
    <div
      style={{
        width: "420px",
        background: "#111",
        border: "2px solid #b22222",
        borderRadius: "14px",
        padding: "24px",
        color: "white",
        textAlign: "center",
        boxShadow: "0 0 25px rgba(0,0,0,0.8)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#d62828" }}>⚠️ {confirmModal.title}</h2>

      <p style={{ whiteSpace: "pre-line", color: "#ddd" }}>
        {confirmModal.message}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <button onClick={() => setConfirmModal(null)}>
          Cancelar
        </button>

        <button
          onClick={confirmModal.onConfirm}
          style={{
            background: "#b22222",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Borrar
        </button>
      </div>
    </div>
  </div>
)}
</>
  );
}

export default App;
