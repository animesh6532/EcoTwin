# Traffic Signal Phases
PHASE_NS_GREEN = 0     # North-South Green, East-West Red
PHASE_NS_YELLOW = 1    # North-South Yellow, East-West Red
PHASE_EW_GREEN = 2     # East-West Green, North-South Red
PHASE_EW_YELLOW = 3    # East-West Yellow, North-South Red

DEFAULT_PHASE_DURATION = 30
YELLOW_PHASE_DURATION = 4

# Vehicle Types (Fuel type tags)
VEHICLE_TYPE_ELECTRIC = "passenger_electric"
VEHICLE_TYPE_DIESEL = "passenger_diesel"
VEHICLE_TYPE_GASOLINE = "passenger_gasoline"
VEHICLE_TYPE_TRUCK_DIESEL = "truck_diesel"

# Emission Standards (mg/s or g/s approximations for reward weights)
CO2_EMISSION_FACTOR = 2.3  # kg CO2 per liter fuel
NOX_EMISSION_FACTOR = 0.4  # g NOx per km
PM25_EMISSION_FACTOR = 0.03 # g PM2.5 per km

# Hotspot Thresholds (e.g. mg/m3 or total raw emission per lane in mg/step)
CO2_HOTSPOT_THRESHOLD = 50000.0  # mg/step
NOX_HOTSPOT_THRESHOLD = 500.0    # mg/step
PM25_HOTSPOT_THRESHOLD = 50.0    # mg/step
