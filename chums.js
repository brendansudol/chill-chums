const colorPalettes = [
  ["#5579f5", "#261745", "#bf9bf2", "#ee6130"],
  ["#f4af06", "#0ad896", "#9e5ff4", "#f40275"],
  ["#f48c6d", "#0023cb", "#dcf305", "#d5dae8"],
  ["#a5ceba", "#f37d6b", "#f5d87e", "#a67fb2"],
  ["#f1ebe0", "#f4b82f", "#f45048", "#4c0a40"],
  ["#1a2061", "#245bdb", "#44e3c4", "#f4bf52"],
  ["#e7e6e4", "#245bdb", "#44e3c4", "#f4bf52"],
  ["#ec643b", "#56b7ab", "#f8cb57", "#1f1e43"],
  ["#29368f", "#e9697b", "#1b164d", "#f7d996"],
  ["#fc3032", "#fed530", "#33c3fb", "#ff7bac", "#fda929"],
  ["#122438", "#dd672e", "#87c7ca", "#ebebeb"],
  ["#f1594a", "#f5b50e", "#14a160", "#2969de", "#885fa4"],
  ["#004996", "#567bae", "#ff4c48", "#ffbcb3"],
  ["#ff5500", "#f4c145", "#144714", "#2f04fc", "#e276af"],
  ["#ffce49", "#ede8dc", "#ff5736", "#ff99b4"],
  ["#253852", "#51222f", "#b53435", "#ecbb51"],
  ["#613f9c", "#ef0327", "#02b199", "#f5f4f6"],
  ["#ecd0b7", "#f55d47", "#1b2d76", "#0458db"],
  ["#ff59a5", "#ff6507", "#328cb7", "#fedc26"],
  ["#263069", "#ac1c62", "#f25757", "#f5c402"],
  ["#88cbd4", "#ebb1b2", "#dcd0b6", "#f2715d"],
  ["#f54200", "#f558b0", "#2565f4", "#05a84b", "#000000"],
  ["#038ff4", "#ebd9eb", "#034ed0", "#f56a01", "#20b09d"],
  ["#0bdc96", "#f4b700", "#f5017c", "#f5f306"],
  ["#cb3831", "#f1ad13", "#0965aa", "#e4d4c3"],
  ["#00ca48", "#f58137", "#dcd032", "#f493cd"],
  ["#5041ac", "#07c2d3", "#8344de", "#f4377b"],
  ["#0a7e8d", "#0b5467", "#f3ba02", "#f04819"],
  ["#114038", "#1c7ac6", "#f0684a", "#49a56c"],
  ["#ea4a5c", "#e8cc51", "#0a0100", "#414fc2", "#e8e2d6"],
  ["#88b8c6", "#ead1d3", "#eed47b", "#e8e3de"],
];

const eyeStyles = [
  "HALVES",
  "HALVES_AND_EYE",
  "OUTLINE",
  "HALF_OUTLINE",
  "OUTLINE_AND_HALF_FILL",
  "TARGET",
  "XLINE",
  "YLINE",
  "IN_SQUARE",
  "EYE_WANDER",
  "WILD",
  "PIECE_MISSING",
];

const face = { pad: 0.2, eye: 0.26, mouth: 0.6 };
let rc, xy, inputs;

function setup() {
  const canvas = createCanvas(600, 600);
  canvas.parent("js-canvas-container");
  rc = rough.canvas(canvas.canvas);
  xy = (perc) => width * perc;
  refreshInputs();
  noStroke();
  noLoop();
}

function draw() {
  const { pad, eye, mouth } = face;
  const [tl, tr, br, bl] = shuffle([xy(0.15), xy(0.15), xy(0.15), 0]);
  const [c1, c2, c3, c4] = shuffle(inputs.color);

  // background
  fill(c1);
  rect(0, 0, xy(1), xy(1), tl, tr, br, bl);

  // half screen overlay
  push();
  const isDark = isColorDark(c1, 100);
  blendMode(isDark ? DODGE : BURN);
  fill(c1);
  rect(xy(0.5), xy(0), xy(0.5), xy(1), 0, tr, br, 0);
  pop();

  // left eye
  drawEye({
    cx: xy(pad) + xy(eye) / 2,
    cy: xy(pad) + xy(eye) / 2,
    d: xy(eye),
    colors: [c2, c3, c1],
  });

  // right eye
  drawEye({
    cx: xy(1) - xy(pad) - xy(eye) / 2,
    cy: xy(pad) + xy(eye) / 2,
    d: xy(eye),
    colors: [c3, c2, c1],
  });

  // mouth
  drawMouth({
    x: xy(pad),
    y: xy(1) - xy(pad) - xy(eye),
    w: xy(mouth),
    h: xy(eye),
    colors: [c4, c1],
  });
}

function drawEye({ cx, cy, d, colors }) {
  const [c1, c2, c3] = colors;
  const variant = equalChoice(eyeStyles);

  switch (variant) {
    case "HALVES": {
      const theta = equalChoice([0, PI * 0.25, PI * 0.5, PI * 0.75]);
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c1));
      rc.arc(cx, cy, d, d, PI + theta, PI * 2 + theta, true, opts(c2));

      break;
    }

    case "HALVES_AND_EYE": {
      const theta = equalChoice([0, PI * 0.25, PI * 0.5, PI * 0.75]);
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c1));
      rc.arc(cx, cy, d, d, PI + theta, PI * 2 + theta, true, opts(c2));
      rc.circle(cx, cy, d / 2, opts(c1));

      break;
    }

    case "OUTLINE": {
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx, cy, d / 2, opts(c3));

      break;
    }

    case "HALF_OUTLINE": {
      const theta = equalChoice([0, PI * 0.5, PI, PI * 1.5]);
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx, cy, d / 2, opts(c2));
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c2));

      break;
    }

    case "OUTLINE_AND_HALF_FILL": {
      const theta = equalChoice([0, PI]);
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx, cy, d / 2, opts(c3));
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c1));

      break;
    }

    case "TARGET": {
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx, cy, d / 2, opts(c2));

      break;
    }

    case "XLINE": {
      const thickness = d / 8;
      rc.circle(cx, cy, d, opts(c1));
      rc.rectangle(cx - d / 2, cy - thickness / 2, d, thickness, opts(equalChoice([c2, c3])));

      break;
    }

    case "YLINE": {
      const thickness = d / 8;
      rc.circle(cx, cy, d, opts(c1));
      rc.rectangle(cx - thickness / 2, cy - d / 2, thickness, d, opts(equalChoice([c2, c3])));

      break;
    }

    case "IN_SQUARE": {
      rc.rectangle(cx - d / 2, cy - d / 2, d, d, opts(c2));
      rc.circle(cx, cy, d * 0.6, opts(c1));

      break;
    }

    case "EYE_WANDER": {
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx + range(-d / 5, d / 5), cy + range(-d / 5, d / 5), d / 4, opts(c2));

      break;
    }

    case "WILD": {
      const theta = equalChoice([0, PI * 0.5, PI, PI * 1.5]);
      const scale = 2 / 3;
      rc.circle(cx, cy, d, opts(c1));
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c2));
      rc.arc(cx, cy, d * scale, d * scale, theta, PI + theta, true, opts(c1));
      rc.arc(cx, cy, d * scale, d * scale, PI + theta, PI * 2 + theta, true, opts(c2));

      break;
    }

    case "PIECE_MISSING": {
      const theta = range(0, PI * 2);
      rc.circle(cx, cy, d, opts(c2));
      rc.arc(cx, cy, d, d, theta, PI * range(1, 1.5) + theta, true, opts(c1));

      break;
    }

    default: {
      const theta = equalChoice([0, PI]);
      rc.circle(cx, cy, d, opts(c1));
      rc.circle(cx, cy, d / 2, opts(c3));
      rc.arc(cx, cy, d, d, theta, PI + theta, true, opts(c1));
    }
  }
}

function drawMouth({ x, y, w, h, colors }) {
  const { isSketchy } = inputs;
  const [c1, c2] = colors;
  const corners = shuffle([h / 2, h / 2, h / 2, 0]);
  const isStrokeOnly = odds(0.2);

  if (!isSketchy) {
    push();
    fill(isStrokeOnly ? c2 : c1);
    if (isStrokeOnly) {
      stroke(c1);
      strokeWeight(h / 11);
    }
    rect(x, y, w, h, ...corners);
    pop();
    return;
  }

  // sketchy mouth variants
  const path = roundedRect(x, y, w, h, corners);

  if (isStrokeOnly) {
    rc.path(path, {
      roughness: 1.5,
      stroke: c1,
      strokeWidth: h / 11,
      fill: c2,
      fillStyle: "solid",
    });
    return;
  }

  // teeth-y
  if (odds(0.25)) {
    rc.path(path, {
      roughness: 1.5,
      stroke: c1,
      strokeWidth: h / 16,
      fill: c1,
      fillStyle: "hachure",
      fillWeight: h / 16,
      hachureAngle: 0,
      hachureGap: h / 5,
    });
    return;
  }

  const fillStyle = equalChoice(["hachure", "cross-hatch", "dashed", "dots", "solid"]);
  const weight = h / 32;
  const gapFactor = { hachure: 2, dots: 3.5 };

  rc.path(path, {
    roughness: 1.5,
    stroke: c1,
    strokeWidth: weight * 1.5,
    fill: c1,
    fillStyle,
    fillWeight: weight,
    hachureGap: (gapFactor[fillStyle] || 2.5) * weight,
    hachureAngle: equalChoice([0, 45, 90, 135, 180]),
  });
}

function refreshInputs() {
  inputs = {
    isSketchy: odds(0.33),
    sketchStyle: equalChoice(["hachure", "zigzag", "dots", "cross-hatch"]),
    hasUniformStyle: true,
    color: equalChoice(colorPalettes),
  };
}

function opts(fill) {
  const { isSketchy, sketchStyle, hasUniformStyle } = inputs;

  if (!isSketchy) {
    return {
      fill,
      roughness: 0,
      stroke: "none",
      fillStyle: "solid",
    };
  }

  const fillStyle = hasUniformStyle
    ? sketchStyle
    : equalChoice(["hachure", "zigzag", "dots", "cross-hatch"]);

  const base = xy(0.008);
  const detailsByStyle = {
    hachure: { weight: 1, gap: 1.2 },
    zigzag: { weight: 0.75, gap: 1 },
    dots: { weight: 0.75, gap: 1 },
    "cross-hatch": { weight: 1, gap: 1.75 },
  };

  const details = detailsByStyle[fillStyle] || { weight: 1, gap: 1 };
  const fillWeight = details.weight * base;
  const hachureGap = details.gap * base;

  return {
    fill,
    fillStyle,
    fillWeight,
    hachureGap,
    hachureAngle: equalChoice([0, 45, 90, 135, 180]),
    roughness: 1.25,
    stroke: "none",
  };
}

function roundedRect(x, y, w, h, corners) {
  const min = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = corners.map((c) => Math.min(c, min));

  return (
    `m ${x} ${y} ` +
    `m 0 ${tl} ` +
    `q 0 -${tl} ${tl} -${tl} ` +
    `l ${w - tl - tr} 0 ` +
    `q ${tr} 0 ${tr} ${tr} ` +
    `l 0 ${h - tr - br} ` +
    `q 0 ${br} -${br} ${br} ` +
    `l -${w - br - bl} 0 ` +
    `q -${bl} 0 -${bl} -${bl} ` +
    `z`
  );
}

function odds(chance) {
  return random() <= chance;
}

function range(min, max) {
  return random() * (max - min) + min;
}

function shuffle(arrayIn) {
  let array = [...arrayIn];
  let [m, t, i] = [array.length];
  while (m) {
    i = Math.floor(rand() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function weightedChoice(items) {
  const rando = random();
  let seen = 0;
  for (const [value, weight] of items) {
    seen += weight;
    if (rando < seen) return value;
  }
  return items[items.length - 1][0]; // last value
}

function equalChoice(values) {
  const weight = 1 / values.length;
  return weightedChoice(values.map((value) => [value, weight]));
}

function isColorDark(hex, threshold = 50) {
  const rgb = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, (rgb >> 0) & 0xff];
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  return luma < threshold;
}

const refreshEl = document.querySelector(".refresh");
refreshEl?.addEventListener("click", (evt) => {
  evt.preventDefault();
  clear();
  refreshInputs();
  draw();
});

const exportEl = document.querySelector(".export");
exportEl?.addEventListener("click", (evt) => {
  evt.preventDefault();
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "chill-chum.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
