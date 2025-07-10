const board = document.getElementById("game-board");

for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.index = i;
  cell.addEventListener("click", () => {
    cell.textContent = "X"; // Provvisorio
  });
  board.appendChild(cell);
}
