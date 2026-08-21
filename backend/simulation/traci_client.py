import os
import sys
import time
from pathlib import Path

import traci


# ============================================================
# EcoTwin - SUMO TraCI Client
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SUMO_HOME = os.environ.get("SUMO_HOME")

if not SUMO_HOME:
    raise EnvironmentError(
        "SUMO_HOME is not set. Please set SUMO_HOME before running EcoTwin."
    )

SUMO_BINARY = Path(SUMO_HOME) / "bin" / "sumo.exe"

if not SUMO_BINARY.exists():
    # Fallback for your Windows installation
    SUMO_BINARY = Path(
        r"C:\Program Files (x86)\Eclipse\Sumo\bin\sumo.exe"
    )

if not SUMO_BINARY.exists():
    raise FileNotFoundError(
        f"SUMO executable not found: {SUMO_BINARY}"
    )


# TAPAS Cologne configuration
SUMO_CONFIG = (
    PROJECT_ROOT
    / "simulation"
    / "tapas_cologne"
    / "cologne6to8.sumocfg"
)

if not SUMO_CONFIG.exists():
    raise FileNotFoundError(
        f"SUMO configuration not found:\n{SUMO_CONFIG}"
    )


class EcoTwinTraCI:
    """
    Python controller for communicating with SUMO through TraCI.

    Responsibilities:
        - Start SUMO
        - Advance simulation
        - Read vehicle states
        - Read traffic metrics
        - Read CO2 emissions
        - Read traffic-light states
        - Stop SUMO safely
    """

    def __init__(self, gui=False):
        self.gui = gui
        self.connected = False

        self.sumo_binary = (
            Path(SUMO_HOME)
            / "bin"
            / ("sumo-gui.exe" if gui else "sumo.exe")
        )

        # Fallback to your actual Windows installation
        if not self.sumo_binary.exists():
            self.sumo_binary = Path(
                r"C:\Program Files (x86)\Eclipse\Sumo\bin"
            ) / ("sumo-gui.exe" if gui else "sumo.exe")

        self.sumo_cmd = [
            str(self.sumo_binary),
            "-c",
            str(SUMO_CONFIG),
            "--start",
            "--quit-on-end",
        ]

    # --------------------------------------------------------
    # Start SUMO
    # --------------------------------------------------------

    def start(self):
        """Start SUMO and establish a TraCI connection."""

        if self.connected:
            print("TraCI connection already active.")
            return

        print("=" * 60)
        print("Starting EcoTwin SUMO simulation")
        print("=" * 60)

        print(f"SUMO executable : {self.sumo_binary}")
        print(f"SUMO config     : {SUMO_CONFIG}")

        traci.start(self.sumo_cmd)

        self.connected = True

        print("TraCI connection established successfully.")
        print("=" * 60)

    # --------------------------------------------------------
    # Advance simulation
    # --------------------------------------------------------

    def simulation_step(self):
        """Advance SUMO by one simulation step."""

        if not self.connected:
            raise RuntimeError("TraCI is not connected.")

        traci.simulationStep()

    # --------------------------------------------------------
    # Vehicle information
    # --------------------------------------------------------

    def get_vehicle_data(self):
        """
        Collect information about all vehicles currently
        present in the simulation.
        """

        if not self.connected:
            raise RuntimeError("TraCI is not connected.")

        vehicle_ids = traci.vehicle.getIDList()

        vehicles = []

        for vehicle_id in vehicle_ids:

            try:
                x, y = traci.vehicle.getPosition(vehicle_id)

                speed = traci.vehicle.getSpeed(vehicle_id)

                waiting_time = traci.vehicle.getWaitingTime(
                    vehicle_id
                )

                co2 = traci.vehicle.getCO2Emission(
                    vehicle_id
                )

                lane_id = traci.vehicle.getLaneID(
                    vehicle_id
                )

                road_id = traci.vehicle.getRoadID(
                    vehicle_id
                )

                vehicles.append(
                    {
                        "id": vehicle_id,
                        "x": float(x),
                        "y": float(y),
                        "speed": float(speed),
                        "waiting_time": float(waiting_time),
                        "co2": float(co2),
                        "lane_id": lane_id,
                        "road_id": road_id,
                    }
                )

            except traci.TraCIException:
                # Vehicle may disappear between getIDList()
                # and querying its information.
                continue

        return vehicles

    # --------------------------------------------------------
    # Traffic metrics
    # --------------------------------------------------------

    def get_traffic_metrics(self):
        """Calculate global traffic metrics."""

        vehicles = self.get_vehicle_data()

        if not vehicles:
            return {
                "vehicle_count": 0,
                "average_speed": 0.0,
                "total_waiting_time": 0.0,
                "total_co2": 0.0,
            }

        vehicle_count = len(vehicles)

        average_speed = (
            sum(v["speed"] for v in vehicles)
            / vehicle_count
        )

        total_waiting_time = sum(
            v["waiting_time"] for v in vehicles
        )

        total_co2 = sum(
            v["co2"] for v in vehicles
        )

        return {
            "vehicle_count": vehicle_count,
            "average_speed": average_speed,
            "total_waiting_time": total_waiting_time,
            "total_co2": total_co2,
        }

    # --------------------------------------------------------
    # Traffic lights
    # --------------------------------------------------------

    def get_traffic_lights(self):
        """Return current traffic-light states."""

        if not self.connected:
            raise RuntimeError("TraCI is not connected.")

        traffic_light_ids = traci.trafficlight.getIDList()

        traffic_lights = []

        for tls_id in traffic_light_ids:

            try:
                traffic_lights.append(
                    {
                        "id": tls_id,
                        "phase": traci.trafficlight.getPhase(
                            tls_id
                        ),
                        "state": traci.trafficlight.getRedYellowGreenState(
                            tls_id
                        ),
                    }
                )

            except traci.TraCIException:
                continue

        return traffic_lights

    # --------------------------------------------------------
    # Simulation information
    # --------------------------------------------------------

    def get_simulation_time(self):
        """Return current SUMO simulation time."""

        if not self.connected:
            raise RuntimeError("TraCI is not connected.")

        return float(
            traci.simulation.getTime()
        )

    # --------------------------------------------------------
    # Complete simulation state
    # --------------------------------------------------------

    def get_state(self):
        """
        Return the complete state required later by
        FastAPI, WebSockets and the RL environment.
        """

        return {
            "simulation_time": self.get_simulation_time(),
            "vehicles": self.get_vehicle_data(),
            "traffic_metrics": self.get_traffic_metrics(),
            "traffic_lights": self.get_traffic_lights(),
        }

    # --------------------------------------------------------
    # Stop SUMO
    # --------------------------------------------------------

    def close(self):
        """Safely close the TraCI connection."""

        if self.connected:

            try:
                traci.close()
                print("SUMO simulation closed.")

            except Exception as exc:
                print(
                    f"Warning while closing TraCI: {exc}"
                )

            finally:
                self.connected = False


# ============================================================
# Standalone Test
# ============================================================

def main():

    client = EcoTwinTraCI(gui=False)

    try:

        client.start()

        print("\nRunning EcoTwin TraCI test...\n")

        for step in range(100):

            client.simulation_step()

            state = client.get_state()

            metrics = state["traffic_metrics"]

            print(
                f"Step {step + 1:03d} | "
                f"Time: {state['simulation_time']:.1f}s | "
                f"Vehicles: {metrics['vehicle_count']} | "
                f"Avg Speed: {metrics['average_speed']:.2f} m/s | "
                f"Waiting: {metrics['total_waiting_time']:.2f}s | "
                f"CO2: {metrics['total_co2']:.2f}"
            )

            time.sleep(0.01)

    except KeyboardInterrupt:

        print("\nSimulation interrupted by user.")

    except Exception as exc:

        print("\nTraCI error:")
        print(exc)

        raise

    finally:

        client.close()


if __name__ == "__main__":
    main()