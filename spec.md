# CorruptionMap

## Current State
The map uses GeoJSON from `geohacker/india` which follows de-facto/international boundaries. This does NOT include Pakistan-Occupied Kashmir (POK) or Aksai Chin as part of India's territory. The SVG projection bounding box is LNG 68–97.5, LAT 6–37.

## Requested Changes (Diff)

### Add
- Custom outer boundary overlay for India's full claimed territory (including POK and Aksai Chin)
- A POK region indicator/label on the map

### Modify
- Switch GeoJSON data source to one that represents India's official claimed boundaries (including J&K with POK)
- Extend the bounding box slightly northwest to ensure POK area is well within visible frame: LNG_MIN=66, LNG_MAX=97.5, LAT_MIN=6, LAT_MAX=38
- Add a note/label on map indicating India's claimed territory per official Survey of India position

### Remove
- Nothing removed

## Implementation Plan
1. Change GEO_URL to `https://raw.githubusercontent.com/codeForBharat/india/main/states.geojson` or use `https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson` as fallback
2. Try alternative GeoJSON sources that include full J&K with POK: use `https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States` which includes the full J&K extent
3. Adjust SVG projection: LNG_MIN=66, LNG_MAX=97.5, LAT_MIN=6, LAT_MAX=38.5, SVG_H=680
4. Add a subtle hatched/dashed-border overlay polygon for the POK region (approx coords) to show it as Indian territory under occupation
5. Add a small text label "(Includes J&K incl. POK as per GoI)" or similar disclaimer on the map
