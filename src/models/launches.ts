import { log, flatMap } from "../deps.ts";
export interface LaunchInterface {
  flightNumber: number;
  mission: string;
  rocket: string;
  customers: Array<string>;
  launchDate: number;
  upcoming: boolean;
  success?: boolean;
  target?: string;
}

const launches = new Map<number, LaunchInterface>();

export const launchData = async () => {
  log.info("Downloading launch data");
  try {
    const response = await fetch("https://api.spacexdata.com/v3/launches");
    const data = await response.json();

    for (const launch of data) {
      const payloads = launch["rocket"]["second_stage"]["payloads"];
      const customers = flatMap(
        payloads,
        (payload: Record<string, unknown>) => {
          return payload["customers"];
        }
      );

      const flightData: LaunchInterface = {
        flightNumber: launch["flight_number"],
        mission: launch["mission_name"],
        rocket: launch["rocket"]["rocket_name"],
        launchDate: launch["launch_date_unix"],
        upcoming: launch["upcoming"],
        success: launch["launch_success"],
        customers,
      };

      launches.set(flightData.flightNumber, flightData);

      // log.info(JSON.stringify(flightData));
    }
  } catch (error) {
    log.warning(error.message);
  }

  // console.log(JSON.stringify(import.meta));
  console.log(`downloaded data for ${launches.size} SpaceX launches`);
};

await launchData();

export const getAll = () => {
  return Array.from(launches.values());
};

export const getOne = (id: number) => {
  if (launches.has(id)) {
    return launches.get(id);
  }
  return null;
};

export const addOne = (data: LaunchInterface) => {
  launches.set(
    data.flightNumber,
    Object.assign(data, {
      upcoming: true,
      customers: ["SpaceX", "NASA"],
    })
  );
};

export const deleteOne = (id: number) => {
  const aborted = launches.get(id);
  if (aborted) {
    aborted.upcoming = false;
    aborted.success = false;
  }
  return aborted;
};
