"""Validate destinationCities.ts entries against the city database spellings.

Run from align-web root:  python scripts/check-destination-cities.py
Exits non-zero if any curated city fails to match the database, so the
Best-20 candidate pool can never silently shrink from a typo.
"""
import io
import re
import sys

DATA_FILES = [
    'src/data/worldCities.ts',
    'src/data/worldCitiesExtended.ts',
    'src/data/worldCitiesExpansion.ts',
    'src/data/worldCitiesExpansion2.ts',
    'src/data/usCities.ts',
    'src/data/worldCitiesSupplement.ts',
]

PAIR_RE = re.compile(r"name:\s*'((?:[^'\\]|\\.)*)'\s*,\s*country:\s*'((?:[^'\\]|\\.)*)'")
CURATED_RE = re.compile(r"\['((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\]")


def unescape(s: str) -> str:
    return s.replace("\\'", "'")


db = set()
db_names = {}
for f in DATA_FILES:
    text = io.open(f, encoding='utf-8').read()
    for m in PAIR_RE.finditer(text):
        name, country = unescape(m.group(1)), unescape(m.group(2))
        db.add((name.lower(), country.lower()))
        db_names.setdefault(name.lower(), set()).add(country)

curated_text = io.open('src/data/destinationCities.ts', encoding='utf-8').read()
curated = [(unescape(n), unescape(c)) for n, c in CURATED_RE.findall(curated_text)]

missing = [(n, c) for (n, c) in curated if (n.lower(), c.lower()) not in db]
print(f'DB pairs: {len(db)}  curated: {len(curated)}  missing: {len(missing)}')
for n, c in missing:
    countries = sorted(db_names.get(n.lower(), []))
    hint = f'  -> name exists under: {countries}' if countries else '  -> name not in DB at all'
    print(f'  MISS: {n} | {c}{hint}')

sys.exit(1 if missing else 0)
