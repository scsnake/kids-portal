# Build the typhoon tool's track climatology: the mean storm motion, its spread and its
# 6-hour memory (AR(1)) on a 2.5 degree grid, for each month, from IBTrACS v04r01 (NOAA NCEI).
#
#   curl -o SRC/ibtracs.WP.list.v04r01.csv https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.WP.list.v04r01.csv
#   uv run --no-project --with numpy python scripts/build_typhoon_tracks.py SRC portal/tools/typhoon
#
# Observed motion = steering + beta drift. The browser model adds its own beta drift, so the
# stored field is the observed mean minus a typical beta drift (BETA_TYP, toward the north-west).
# Method after Hall & Jewson (2007): kernel-averaged mean displacements, AR(1) on the anomalies.
import csv, json, math, sys
import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
YEARS = (1980, 2024)                  # satellite era, complete seasons only
LON0, DLON, NX = 102.0, 2.5, 22       # nodes 102 .. 154.5 E
LAT0, DLAT, NY = 3.0, 2.5, 17         # nodes 3 .. 43 N
SIG_NEAR, SIG_FAR = 300.0, 800.0      # km: local average, and a wide one where storms are rare
SIG_MONTH = 0.8                       # months
N_HALF = 15.0                         # effective points where near and wide count the same
BETA_TYP = 1.6                        # m/s at the equator, times cos(lat); matches tcMotionMs() at intensity 0.5

def steer_prior(lat):
    # the old lat-only steering of app.js, used only where no storm ever passed
    t = min(1.0, max(0.0, (lat - 21.0) / 8.0)); s = t * t * (3 - 2 * t)
    return -5.0 + 13.0 * s, 1.0 + 2.0 * s

# --- read 6-hourly tropical positions ---
tracks = {}
with open(f"{SRC}/ibtracs.WP.list.v04r01.csv", newline="") as f:
    rows = csv.reader(f)
    head = next(rows); next(rows)      # second line holds units
    col = {k: i for i, k in enumerate(head)}
    for r in rows:
        if r[col["TRACK_TYPE"]] != "main" or r[col["NATURE"]] != "TS":
            continue
        yr = int(r[col["SEASON"]])
        if not YEARS[0] <= yr <= YEARS[1]:
            continue
        t = r[col["ISO_TIME"]]
        if int(t[11:13]) % 6 or t[14:16] != "00":
            continue
        tracks.setdefault(r[col["SID"]], []).append((t, float(r[col["LAT"]]), float(r[col["LON"]]) % 360, int(t[5:7])))

# --- 6-hour motion (m/s) at the midpoints ---
P = []      # lon, lat, month, u, v, storm index, step index
for k, pts in enumerate(tracks.values()):
    pts.sort()
    for i in range(len(pts) - 1):
        (t0, la0, lo0, m), (t1, la1, lo1, _) = pts[i], pts[i + 1]
        dh = (np.datetime64(t1.replace(" ", "T")) - np.datetime64(t0.replace(" ", "T"))).astype("timedelta64[h]").astype(int)
        if dh != 6:
            continue
        lat = 0.5 * (la0 + la1)
        u = (lo1 - lo0) * 111.32 * math.cos(math.radians(lat)) * 1000 / 21600
        v = (la1 - la0) * 110.57 * 1000 / 21600
        if math.hypot(u, v) > 30:      # bad fixes and merges
            continue
        P.append((0.5 * (lo0 + lo1), lat, m, u, v, k, i))
P = np.array(P)
lon, lat, mon, U, V, sid, step = P.T
print(f"{len(tracks)} storms, {len(P)} six-hour steps", file=sys.stderr)

def kernel(nlon, nlat, m, sig):
    dx = (lon - nlon) * 111.32 * math.cos(math.radians(nlat))
    dy = (lat - nlat) * 110.57
    dm = np.minimum(np.abs(mon - m), 12 - np.abs(mon - m))
    return np.exp(-(dx * dx + dy * dy) / (2 * sig * sig) - dm * dm / (2 * SIG_MONTH ** 2))

def moments(w, x):
    sw = w.sum()
    if sw < 1e-9:
        return 0.0, 0.0, 0.0
    mu = (w * x).sum() / sw
    return mu, math.sqrt((w * (x - mu) ** 2).sum() / sw), sw * sw / (w * w).sum()

field = np.zeros((4, 12, NY, NX))     # u, v, su, sv (m/s)
for m in range(1, 13):
    for j in range(NY):
        nlat = LAT0 + j * DLAT
        for i in range(NX):
            nlon = LON0 + i * DLON
            near, far = kernel(nlon, nlat, m, SIG_NEAR), kernel(nlon, nlat, m, SIG_FAR)
            un, sun, nn = moments(near, U); vn, svn, _ = moments(near, V)
            uf, suf, nf = moments(far, U); vf, svf, _ = moments(far, V)
            a = nn / (nn + N_HALF)                 # trust the local average where there are enough storms
            b = nf / (nf + N_HALF)
            pu, pv = steer_prior(nlat)
            bu, bv = -0.7071 * BETA_TYP * math.cos(math.radians(nlat)), 0.7071 * BETA_TYP * math.cos(math.radians(nlat))
            far_u, far_v = b * uf + (1 - b) * (pu + bu), b * vf + (1 - b) * (pv + bv)
            mu_u, mu_v = a * un + (1 - a) * far_u, a * vn + (1 - a) * far_v
            field[0, m - 1, j, i] = mu_u - bu
            field[1, m - 1, j, i] = mu_v - bv
            field[2, m - 1, j, i] = max(1.0, a * sun + (1 - a) * (b * suf + (1 - b) * 3.0))
            field[3, m - 1, j, i] = max(1.0, a * svn + (1 - a) * (b * svf + (1 - b) * 3.0))

# --- AR(1): how much of a 6-hour motion anomaly is left 6 hours later ---
def sample(arr, lo, la, m):
    fx = min(max((lo - LON0) / DLON, 0), NX - 1.001); fy = min(max((la - LAT0) / DLAT, 0), NY - 1.001)
    i, j = int(fx), int(fy); tx, ty = fx - i, fy - j
    a = arr[int(m) - 1]
    return (a[j, i] * (1 - tx) + a[j, i + 1] * tx) * (1 - ty) + (a[j + 1, i] * (1 - tx) + a[j + 1, i + 1] * tx) * ty

au = np.zeros(len(P)); av = np.zeros(len(P))
for n, (lo, la, m, u, v, _, _) in enumerate(P):
    bu, bv = -0.7071 * BETA_TYP * math.cos(math.radians(la)), 0.7071 * BETA_TYP * math.cos(math.radians(la))
    au[n] = (u - bu - sample(field[0], lo, la, m)) / sample(field[2], lo, la, m)
    av[n] = (v - bv - sample(field[1], lo, la, m)) / sample(field[3], lo, la, m)
nxt = (sid[1:] == sid[:-1]) & (step[1:] == step[:-1] + 1)
rho_u = float((au[:-1][nxt] * au[1:][nxt]).sum() / (au[:-1][nxt] ** 2).sum())
rho_v = float((av[:-1][nxt] * av[1:][nxt]).sum() / (av[:-1][nxt] ** 2).sum())
print(f"AR(1) per 6 h: u {rho_u:.3f}, v {rho_v:.3f}", file=sys.stderr)

q = lambda a: [int(round(x * 10)) for x in a.ravel()]
out = {
    "source": f"IBTrACS v04r01 (NOAA NCEI, doi:10.25921/82ty-9e16), WP main tracks {YEARS[0]}-{YEARS[1]}, nature TS, 6-hourly",
    "note": "steering = observed mean motion minus a typical beta drift; m/s x 10; index [month][lat][lon]",
    "grid": {"lon0": LON0, "dlon": DLON, "nx": NX, "lat0": LAT0, "dlat": DLAT, "ny": NY},
    "betaTyp": BETA_TYP,
    "ar6h": [round(rho_u, 3), round(rho_v, 3)],
    "u": q(field[0]), "v": q(field[1]), "su": q(field[2]), "sv": q(field[3]),
}
with open(f"{OUT}/tracks.json", "w") as f:
    json.dump(out, f, separators=(",", ":"))
print(f"wrote {OUT}/tracks.json", file=sys.stderr)
