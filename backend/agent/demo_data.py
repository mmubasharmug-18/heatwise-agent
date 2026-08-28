"""Demo Mode: Phoenix Outdoor Workforce Scenario.

Used whenever the user has no API key, requests demo mode explicitly, or a
live FortyGuard call fails mid-flow. Values are realistic and internally
consistent (plausible for Phoenix, AZ in summer) but are NOT live API
results — every response is clearly labeled as such by the caller.
"""
from __future__ import annotations

from typing import Any

DEMO_SITES: dict[str, dict[str, Any]] = {
    "Phoenix Construction Zone": {
        "latitude": 33.4484,
        "longitude": -112.0740,
        "temperature_c": 43.5,
        "heat_index_c": 46.0,
        "relative_humidity_pct": 18.0,
        "solar_ghi": 890.0,
        "solar_dni": 780.0,
        "solar_dhi": 140.0,
        "tree_canopy_pct": 3.5,
        "impervious_pct": 82.0,
    },
    "Scottsdale Work Area": {
        "latitude": 33.4942,
        "longitude": -111.9261,
        "temperature_c": 40.1,
        "heat_index_c": 42.0,
        "relative_humidity_pct": 16.0,
        "solar_ghi": 820.0,
        "solar_dni": 720.0,
        "solar_dhi": 130.0,
        "tree_canopy_pct": 11.0,
        "impervious_pct": 68.0,
    },
    "Papago Park Delivery Hub": {
        "latitude": 33.4600,
        "longitude": -111.9470,
        "temperature_c": 36.8,
        "heat_index_c": 38.0,
        "relative_humidity_pct": 20.0,
        "solar_ghi": 650.0,
        "solar_dni": 560.0,
        "solar_dhi": 120.0,
        "tree_canopy_pct": 24.0,
        "impervious_pct": 45.0,
    },
}


def demo_site_for(name: str, latitude: float, longitude: float) -> dict[str, Any]:
    """Return a demo profile. If the name matches a bundled demo site, use it;
    otherwise synthesize a plausible profile from a moderate baseline so any
    location still gets a coherent demo result.
    """
    if name in DEMO_SITES:
        return DEMO_SITES[name]

    return {
        "latitude": latitude,
        "longitude": longitude,
        "temperature_c": 34.0,
        "heat_index_c": 35.5,
        "relative_humidity_pct": 30.0,
        "solar_ghi": 550.0,
        "solar_dni": 470.0,
        "solar_dhi": 110.0,
        "tree_canopy_pct": 15.0,
        "impervious_pct": 55.0,
    }
