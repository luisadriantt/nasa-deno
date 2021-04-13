import { log, join, BufReader, parse, pick } from "../deps.ts";

type Planet = Record<string, string>;

export const filterHabitablePlanets = (planets: Array<Planet>) => {
  return planets.filter((planet) => {
    const planetaryRadius = Number(planet["koi_prad"]);
    const stellarMass = Number(planet["koi_smass"]);
    const stellarRadius = Number(planet["koi_srad"]);

    return (
      planet["koi_disposition"] === "CONFIRMED" &&
      planetaryRadius > 0.5 &&
      planetaryRadius < 1.5 &&
      stellarMass > 0.78 &&
      stellarMass < 1.04 &&
      stellarRadius > 0.99 &&
      stellarRadius < 1.01
    );
  });
};

const loadPlanetsData = async () => {
  const path = join("data", "kepler_exoplanets_nasa.csv");

  const file = await Deno.open(path);
  const bufReader = new BufReader(file);
  const result = await parse(bufReader, { comment: "#", skipFirstRow: true });

  Deno.close(file.rid);
  const planets = filterHabitablePlanets(result as Array<Planet>);

  if (planets) {
    return planets.map((planet) => {
      return pick(planet, [
        "kepler_name",
        "koi_prad",
        "koi_smass",
        "koi_srad",
        "koi_count",
        "koi_steff",
        "koi_period",
      ]);
    });
  }
};

const planets = await loadPlanetsData();
const amount = planets?.length || 0;
log.info(`${amount} habitable planets found`);

export const getAllPlanets = () => {
  return planets;
};
