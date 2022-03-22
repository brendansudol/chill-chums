const colorPalettes = [
  ["#5579f5", "#261745", "#bf9bf2", "#ee6130"],
  ["#a5ceba", "#f37d6b", "#f5d87e", "#a67fb2"],
  ["#1a2061", "#245bdb", "#44e3c4", "#f4bf52"],
  ["#ec643b", "#56b7ab", "#f8cb57", "#1f1e43"],
  ["#122438", "#dd672e", "#87c7ca", "#ebebeb"],
  ["#ffce49", "#ede8dc", "#ff5736", "#ff99b4"],
  ["#ecd0b7", "#f55d47", "#1b2d76", "#0458db"],
  ["#5041ac", "#07c2d3", "#8344de", "#f4377b"],
  ["#0a7e8d", "#0b5467", "#f3ba02", "#f04819"],
  ["#091540", "#7692ff", "#abd2fa", "#3d518c"],
];

const eyeStyles = [
  "HALVES",
  "HALVES_AND_EYE",
  "OUTLINE",
  "OUTLINE_AND_HALF_FILL",
  "TARGET",
  "IN_SQUARE",
  "EYE_WANDER",
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
    color: equalChoice(colorPalettes),
  };
}

function opts(fill) {
  const { isSketchy, sketchStyle } = inputs;

  if (!isSketchy) {
    return {
      fill,
      roughness: 0,
      stroke: "none",
      fillStyle: "solid",
    };
  }

  const base = xy(0.008);
  const detailsByStyle = {
    hachure: { weight: 1, gap: 1.2 },
    zigzag: { weight: 0.75, gap: 1 },
    dots: { weight: 0.75, gap: 1 },
    "cross-hatch": { weight: 1, gap: 1.75 },
  };

  const fillStyle = sketchStyle;
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

function equalChoice(values) {
  const weight = 1 / values.length;
  return weightedChoice(values.map((value) => [value, weight]));
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
