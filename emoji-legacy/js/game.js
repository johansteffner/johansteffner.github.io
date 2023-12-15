const player = {
  x: Math.floor((map[0].length - 1) / 2),
  y: Math.floor((map.length - 1) / 2),
  direction: "right",
  score: 0,
  lives: 3,
  tree: 0,
  isAlive: true,
};

const viewport = {
  x: 0,
  y: 0,
  width: 10,
  height: 10,
};

const init = (el) => {
  if (!el) {
    throw new Error("Element not found");
  }

  map[player.y][player.x] = " ";

  const mapEl = document.createElement("div");

  mapEl.style.display = "grid";

  el.appendChild(mapEl);

  const info = document.createElement("div");

  el.appendChild(info);

  let grid = {};

  const resize = () => {
    viewport.width = Math.floor(window.innerWidth / 32);
    viewport.height = Math.floor(window.innerHeight / 32) - 1;
    viewport.x = Math.floor(player.x - viewport.width / 2);
    viewport.y = Math.floor(player.y - viewport.height / 2);

    // console.log({
    //   viewport,
    //   player,
    // });

    mapEl.innerHTML = "";

    mapEl.style.fontSize = `${window.innerWidth / viewport.width}px`;
    mapEl.style.gridTemplateColumns = `repeat(${viewport.width}, 1fr)`;

    grid = {};

    for (let y = 0; y < viewport.height; y++) {
      grid[y] = {};
      const row = map[y];
      for (let x = 0; x < viewport.width; x++) {
        const s = document.createElement("span");

        s.classList.add("tile");

        grid[y][x] = s;

        mapEl.appendChild(s);
      }
    }
  };

  resize();
  window.addEventListener("resize", resize);

  const render = () => {
    for (let y = viewport.y; y < viewport.y + viewport.height; y++) {
      const row = map[y];
      for (let x = viewport.x; x < viewport.x + viewport.width; x++) {
        const tile = map[y][x];

        const s = grid[y - viewport.y][x - viewport.x];

        if (player.x === x && player.y === y) {
          if (player.isAlive) {
            s.textContent = "🐻";
          } else {
            s.textContent = "💀";
          }
        } else {
          s.textContent = tile;
        }
      }
    }

    info.textContent = `Score: ${player.score} Lives: ${player.lives} Tree: ${player.tree}`;
  };

  const move = (direction) => {
    if (!player.isAlive) {
      return;
    }

    let x = player.x,
      y = player.y;

    if (direction === "up") {
      y = Math.max(0, y - 1);
    } else if (direction === "down") {
      y = Math.min(map.length - 1, y + 1);
    } else if (direction === "left") {
      x = Math.max(0, x - 1);
    } else if (direction === "right") {
      x = Math.min(map[0].length - 1, x + 1);
    }

    if (map[y][x] === "🎄") {
      map[y][x] = "🌲";
    } else if (map[y][x] === "🌲") {
      map[y][x] = "🪵";
    } else if (map[y][x] === "🪵") {
      map[y][x] = " ";
      player.tree++;
      player.x = x;
      player.y = y;
    } else if (map[y][x] === "🪨") {
    } else if (map[y][x] === "🍒") {
      player.lives++;
      map[y][x] = " ";
      player.x = x;
      player.y = y;
    } else if (map[y][x] === "🧌") {
      if (Math.random() < 0.5) {
        player.lives--;

        if (player.lives === 0) {
          player.isAlive = false;
        }
      } else {
        player.score++;
        map[y][x] = " ";
      }
    } else {
      player.x = x;
      player.y = y;
    }

    // console.log(viewport.x, player.x);
    // console.log(player.x, player.y);

    // adjust viewport
    if (player.x < viewport.x + 5) {
      viewport.x = Math.max(player.x - 5, 0);
    } else if (player.x >= viewport.x + viewport.width - 5) {
      viewport.x = Math.min(
        player.x - viewport.width + 6,
        map[0].length - viewport.width
      );
    }

    if (player.y < viewport.y + 5) {
      viewport.y = Math.max(player.y - 5, 0);
    } else if (player.y >= viewport.y + viewport.height - 5) {
      viewport.y = Math.min(
        player.y - viewport.height + 6,
        map.length - viewport.height
      );
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp") {
      e.preventDefault();
      move("up");
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      move("down");
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      move("left");
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      move("right");
    }
  });

  requestAnimationFrame(function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
  });
};

init(document.getElementById("root"));
