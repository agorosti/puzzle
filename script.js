let strokes = 0;
let emptyPiece;
let dragStartIndex;
let dragOverIndex;
let moves = [];

function updateStrokeCounter() {
  document.getElementById("stroke-counter").textContent = `Strokes: ${strokes}`;
}

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        createPuzzle(img);
      };
    };

    reader.readAsDataURL(file);
  }
}

function createPuzzle(image) {
  const numColsRows = 4; // Number of columns and rows in the puzzle

  const pieceWidth = image.width / numColsRows;
  const pieceHeight = image.height / numColsRows;

  const puzzleContainer = document.getElementById("puzzle-container");
  puzzleContainer.innerHTML = "";
  puzzleContainer.style.gridTemplateColumns = `repeat(${numColsRows}, 1fr)`;
  puzzleContainer.style.gridTemplateRows = `repeat(${numColsRows}, 1fr)`;

  let pieces = createPieces(image, numColsRows, pieceWidth, pieceHeight);
  const indexs = shuffleArray(pieces);
  pieces.forEach((piece, index) => {
    const puzzlePiece = document.createElement("div");
    puzzlePiece.classList.add("puzzle-piece");
    puzzlePiece.setAttribute("draggable", "true");
    puzzlePiece.style.backgroundImage = `url('${piece.img}')`;
    puzzlePiece.dataset.correctPosition = index;
    puzzlePiece.dataset.currentIndex = indexs[index];

    puzzlePiece.addEventListener("dragstart", handleDragStart);
    puzzlePiece.addEventListener("dragover", handleDragOver);
    puzzlePiece.addEventListener("drop", handleDrop);

    puzzleContainer.appendChild(puzzlePiece);
  });
  updateStrokeCounter();
}

function createPieces(image, numColsRows, pieceWidth, pieceHeight) {
  const pieces = [];

  for (let y = 0; y < numColsRows; y++) {
    for (let x = 0; x < numColsRows; x++) {
      const pieceCanvas = document.createElement("canvas");
      pieceCanvas.width = pieceWidth;
      pieceCanvas.height = pieceHeight;
      const context = pieceCanvas.getContext("2d");

      // Calculate the slice area of the image for each piece
      context.drawImage(
        image,
        x * pieceWidth,
        y * pieceHeight,
        pieceWidth,
        pieceHeight,
        0,
        0,
        pieceWidth,
        pieceHeight
      );

      pieces.push({ img: pieceCanvas.toDataURL(), x: x, y: y });
    }
  }

  return pieces;
}

function shuffleArray(array) {
  // Create an array filled with integers from 0 to array.length - 1
  // This will represent the original sequence of indices
  let swappedIndices = Array.from(
    { length: array.length },
    (_, index) => index
  );

  // Shuffle the original array and simultaneously build the swappedIndices array
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap the elements in the original array
    [array[i], array[j]] = [array[j], array[i]];
    // Swap the corresponding indices in the swappedIndices array
    [swappedIndices[i], swappedIndices[j]] = [
      swappedIndices[j],
      swappedIndices[i],
    ];
  }

  // Return the swapped indices array
  return swappedIndices;
}

function handleDragStart(event) {
  dragStartIndex = findPieceIndex(event.target);
}

function findPieceIndex(piece) {
  return Array.from(piece.parentNode.children).indexOf(piece);
}

function handleDragOver(event) {
  event.preventDefault();
  dragOverIndex = findPieceIndex(event.target);
}

function handleDrop(event) {
  event.preventDefault();

  const puzzleContainer = document.getElementById("puzzle-container");
  const puzzlePieces = puzzleContainer.getElementsByClassName("puzzle-piece");
  // We should only swap tiles if the receiving tile is not the empty piece
  if (puzzlePieces[dragOverIndex].classList.contains("empty-piece")) return;

  swapPieces(dragStartIndex, dragOverIndex, puzzlePieces);
  strokes++;
  updateStrokeCounter();
  moves.push({ from: dragStartIndex, to: dragOverIndex }); // Record the move

  checkPuzzle();
}

function swapPieces(fromIndex, toIndex, puzzlePieces) {
  const fromPiece = puzzlePieces[fromIndex];
  const toPiece = puzzlePieces[toIndex];

  // Swap backgroundImage styles
  const fromImage = fromPiece.style.backgroundImage;
  const toImage = toPiece.style.backgroundImage;
  fromPiece.style.backgroundImage = toImage;
  toPiece.style.backgroundImage = fromImage;

  // Swap background positions
  const fromBackgroundPosition = fromPiece.style.backgroundPosition;
  const toBackgroundPosition = toPiece.style.backgroundPosition;
  fromPiece.style.backgroundPosition = toBackgroundPosition;
  toPiece.style.backgroundPosition = fromBackgroundPosition;

  // Update current indices of swapped pieces as numbers
  const fromCurrentIndex = fromPiece.dataset.currentIndex;
  const toCurrentIndex = toPiece.dataset.currentIndex;

  // Swap dataset currentIndex values as numbers
  fromPiece.dataset.currentIndex = toCurrentIndex;
  toPiece.dataset.currentIndex = fromCurrentIndex;
}

function checkPuzzle() {
  const puzzlePieces = document.querySelectorAll(".puzzle-piece");
  const correctOrder = Array.from(puzzlePieces).map((piece) =>
    parseInt(piece.dataset.correctPosition)
  );
  const currentOrder = Array.from(puzzlePieces).map((piece) =>
    parseInt(piece.dataset.currentIndex)
  );

  //   console.log(currentOrder);
  //   console.log(correctOrder);

  const solved = JSON.stringify(correctOrder) === JSON.stringify(currentOrder);

  if (solved) {
    alert("Congratulations! Puzzle solved!");
  }
}
