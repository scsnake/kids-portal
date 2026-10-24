# Build the typhoon tool's map data: coastline polygons (Natural Earth 10m admin 0)
# and elevation PNGs (ETOPO1 1 arc-minute, from NOAA ERDDAP).
#
#   curl -o SRC/ne_10m_admin0.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
#   curl -o SRC/etopo_full.nc 'https://upwell.pfeg.noaa.gov/erddap/griddap/etopo180.nc?altitude%5B(3.0):1:(42.0)%5D%5B(102.0):1:(154.0)%5D'
#   uv run --no-project --with numpy --with scipy --with pillow --with shapely python scripts/build_typhoon_geo.py SRC portal/tools/typhoon
#
# PNG encoding: R = sqrt(land height / hMax), G = sqrt(sea depth / dMax), both 0..255.
import json, sys, math
import numpy as np
from PIL import Image
from scipy.io import netcdf_file
from shapely.geometry import shape, box, Polygon, MultiPolygon
from shapely.ops import unary_union

SRC, OUT = sys.argv[1], sys.argv[2]
LON0, LON1, LAT0, LAT1 = 102.0, 154.0, 3.0, 42.0

ZH = {"Taiwan": "台灣", "Japan": "日本", "Philippines": "菲律賓", "China": "中國",
      "South Korea": "韓國", "North Korea": "北韓", "Vietnam": "越南", "Laos": "寮國",
      "Malaysia": "馬來西亞", "Brunei": "汶萊", "Indonesia": "印尼", "Russia": "俄羅斯",
      "Myanmar": "緬甸", "Thailand": "泰國", "Cambodia": "柬埔寨", "Hong Kong S.A.R.": "香港",
      "Macao S.A.R": "澳門", "Palau": "帛琉", "Guam": "關島", "Northern Mariana Islands": "北馬里亞納群島",
      "Mongolia": "蒙古", "Federated States of Micronesia": "密克羅尼西亞",
      "Scarborough Reef": "黃岩島", "Spratly Islands": "南沙群島", "Paracel Islands": "西沙群島"}

clip = box(LON0, LAT0, LON1, LAT1)
gj = json.load(open(f"{SRC}/ne_10m_admin0.geojson"))
regions = []
for f in gj["features"]:
    g = shape(f["geometry"])
    if not g.intersects(clip):
        continue
    name = f["properties"]["ADMIN"]
    g = g.intersection(clip).simplify(0.008, preserve_topology=True)
    polys = [g] if isinstance(g, Polygon) else [p for p in getattr(g, "geoms", []) if isinstance(p, Polygon)]
    rings = []
    for p in polys:
        if p.area < 0.0005 and name != "Taiwan":
            continue
        if p.area < 0.0001:
            continue
        coords = list(p.exterior.coords)[:-1]
        flat, px, py = [], 0, 0
        for x, y in coords:
            ix, iy = round(x * 100), round(y * 100)
            flat += [ix - px, iy - py]
            px, py = ix, iy
        rings.append(flat)
    if rings:
        regions.append({"en": name, "zh": ZH.get(name, name), "rings": rings})
        print(name, len(rings), sum(len(r) // 2 for r in rings), file=sys.stderr)

json.dump({"bounds": [LON0, LAT0, LON1, LAT1], "scale": 100, "regions": regions},
          open(f"{OUT}/coast.json", "w"), separators=(",", ":"), ensure_ascii=False)

nc = netcdf_file(f"{SRC}/etopo_full.nc", "r", mmap=False)
lat = nc.variables["latitude"][:].copy()
lon = nc.variables["longitude"][:].copy()
alt = nc.variables["altitude"][:].astype(np.float32)
if lat[0] < lat[-1]:
    lat, alt = lat[::-1], alt[::-1]  # north up
print("etopo", alt.shape, lat[0], lat[-1], lon[0], lon[-1], alt.max(), file=sys.stderr)

H_MAX, D_MAX = 6000.0, 10000.0
def encode(a):
    land = np.clip(a, 0, H_MAX)
    sea = np.clip(-a, 0, D_MAX)
    r = np.round(255 * np.sqrt(land / H_MAX)).astype(np.uint8)
    g = (np.round(255 * np.sqrt(sea / D_MAX)).astype(np.uint8) // 4) * 4  # cosmetic only
    return np.dstack([r, g, np.zeros_like(r)])

def block(a, k):
    h, w = (a.shape[0] // k) * k, (a.shape[1] // k) * k
    return a[:h, :w].reshape(h // k, k, w // k, k).mean(axis=(1, 3)), h, w

meta = {"hMax": H_MAX, "dMax": D_MAX}
k = 3
m, h, w = block(alt, k)
Image.fromarray(encode(m)).save(f"{OUT}/dem.png", optimize=True)
# texel centers: mean of node lat/lon in each block
meta["dem"] = {"w": m.shape[1], "h": m.shape[0],
               "lon0": float(lon[:w].reshape(-1, k).mean(1)[0]), "lat0": float(lat[:h].reshape(-1, k).mean(1)[0]),
               "dLon": float(lon[k] - lon[0]), "dLat": float(lat[k] - lat[0])}

sel_lat = (lat <= 25.7) & (lat >= 21.5)
sel_lon = (lon >= 118.9) & (lon <= 122.4)
tw = alt[np.ix_(sel_lat, sel_lon)]
Image.fromarray(encode(tw)).save(f"{OUT}/dem-tw.png", optimize=True)
meta["tw"] = {"w": tw.shape[1], "h": tw.shape[0], "lon0": float(lon[sel_lon][0]), "lat0": float(lat[sel_lat][0]),
              "dLon": float(lon[1] - lon[0]), "dLat": float(lat[1] - lat[0])}
print("tw max", tw.max(), file=sys.stderr)
json.dump(meta, open(f"{OUT}/dem.json", "w"), indent=1)
