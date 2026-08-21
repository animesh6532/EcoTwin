import csv
import os
import sys
from pathlib import Path

import traci


# ============================================================
# EcoTwin - SUMO Data Collector
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SUMO_HOME = os.environ.get("SUMO_HOME")

if not SUMO_HOME:
    raise RuntimeError("SUMO_HOME is not set.")

SUMO_BINARY = (
    Path(SUMO_HOME) / "bin" / "sumo.exe"
)

# Your actual SUMO installation
if not SUMO_BINARY.exists():
    SUMO_BINARY = Path(
        r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo.exe"
    )

SUMO_CONFIG = (
    PROJECT_ROOT
    / "simulation"
    / "tapas_cologne"
    / "cologne6to8.sumocfg"
)

RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

RAW_FILE = RAW_DIR / "simulation_data.csv"
PROCESSED_FILE = PROCESSED_DIR / "traffic_emissions.csv"


def collect_simulation_data(
    simulation_steps=1000
):
    """
    Run SUMO through TraCI and collect
    vehicle traffic + emission information.
    """

    sumo_cmd = [
        str(SUMO_BINARY),
        "-c",
        str(SUMO_CONFIG),
        "--quit-on-end",
    ]

    print("=" * 70)
    print("EcoTwin Data Collection")
    print("=" * 70)

    print(f"SUMO       : {SUMO_BINARY}")
    print(f"Config     : {SUMO_CONFIG}")
    print(f"Raw output : {RAW_FILE}")
    print()

    traci.start(sumo_cmd)

    rows = []

    try:

        for step in range(simulation_steps):

            traci.simulationStep()

            simulation_time = traci.simulation.getTime()

            vehicle_ids = traci.vehicle.getIDList()

            for vehicle_id in vehicle_ids:

                try:

                    x, y = traci.vehicle.getPosition(
                        vehicle_id
                    )

                    speed = traci.vehicle.getSpeed(
                        vehicle_id
                    )

                    waiting_time = (
                        traci.vehicle.getWaitingTime(
                            vehicle_id
                        )
                    )

                    co2 = (
                        traci.vehicle.getCO2Emission(
                            vehicle_id
                        )
                    )

                    nox = (
                        traci.vehicle.getNOxEmission(
                            vehicle_id
                        )
                    )

                    fuel = (
                        traci.vehicle.getFuelConsumption(
                            vehicle_id
                        )
                    )

                    lane_id = traci.vehicle.getLaneID(
                        vehicle_id
                    )

                    road_id = traci.vehicle.getRoadID(
                        vehicle_id
                    )

                    rows.append(
                        {
                            "simulation_time":
                                simulation_time,

                            "vehicle_id":
                                vehicle_id,

                            "x":
                                x,

                            "y":
                                y,

                            "speed":
                                speed,

                            "waiting_time":
                                waiting_time,

                            "co2":
                                co2,

                            "nox":
                                nox,

                            "fuel_consumption":
                                fuel,

                            "lane_id":
                                lane_id,

                            "road_id":
                                road_id,
                        }
                    )

                except traci.TraCIException:
                    continue

            if (step + 1) % 100 == 0:

                print(
                    f"Step {step + 1}/{simulation_steps} | "
                    f"Time: {simulation_time:.0f}s | "
                    f"Vehicles: {len(vehicle_ids)}"
                )

    finally:

        traci.close()

    # --------------------------------------------------------
    # Save raw dataset
    # --------------------------------------------------------

    if not rows:
        raise RuntimeError(
            "No vehicle data was collected."
        )

    fieldnames = list(rows[0].keys())

    with open(
        RAW_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()
        writer.writerows(rows)

    print()
    print(f"Raw dataset saved: {RAW_FILE}")
    print(f"Rows collected: {len(rows)}")

    # --------------------------------------------------------
    # Create processed dataset
    # --------------------------------------------------------

    process_data(rows)


def process_data(rows):

    processed_rows = []

    for row in rows:

        processed_rows.append(
            {
                "simulation_time":
                    float(row["simulation_time"]),

                "vehicle_id":
                    row["vehicle_id"],

                "x":
                    float(row["x"]),

                "y":
                    float(row["y"]),

                "speed":
                    float(row["speed"]),

                "waiting_time":
                    float(row["waiting_time"]),

                "co2":
                    float(row["co2"]),

                "nox":
                    float(row["nox"]),

                "fuel_consumption":
                    float(row["fuel_consumption"]),

                "lane_id":
                    row["lane_id"],

                "road_id":
                    row["road_id"],
            }
        )

    fieldnames = list(
        processed_rows[0].keys()
    )

    with open(
        PROCESSED_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()
        writer.writerows(processed_rows)

    print(
        f"Processed dataset saved: {PROCESSED_FILE}"
    )


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    try:

        collect_simulation_data(
            simulation_steps=1000
        )

        print()
        print("=" * 70)
        print("DATA COLLECTION COMPLETED SUCCESSFULLY")
        print("=" * 70)

    except KeyboardInterrupt:

        print("\nCollection stopped by user.")

    except Exception as error:

        print()
        print("ERROR:")
        print(error)

        sys.exit(1)