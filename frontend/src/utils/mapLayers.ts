// Project relative SUMO coordinates (-500m to 500m) into SVG container pixels (0px to 600px)
export function projectCoordinates(x: number, y: number, width = 600, height = 600) {
  const minSumoX = -500;
  const maxSumoX = 500;
  const minSumoY = -500;
  const maxSumoY = 500;
  
  const px = ((x - minSumoX) / (maxSumoX - minSumoX)) * width;
  // Invert Y coordinate because SUMO uses cartesian and SVG uses top-down
  const py = height - (((y - minSumoY) / (maxSumoY - minSumoY)) * height);
  
  return { x: px, y: py };
}
