import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { HATLY_SERVICE_ZONES } from '../../services/egyptGeo';

interface MapPickerProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  driverLat?: number;
  driverLng?: number;
  driverVehicleType?: string;
  onPickupChange?: (lat: number, lng: number, addressText?: string) => void;
  onDropoffChange?: (lat: number, lng: number, addressText?: string) => void;
  interactive?: boolean;
  className?: string;
  zoom?: number;
  selectedZoneId?: string;
  selectedGovernorate?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  pickupLat = 31.2001, // Alexandria center default
  pickupLng = 29.9187,
  dropoffLat,
  dropoffLng,
  driverLat,
  driverLng,
  driverVehicleType,
  onPickupChange,
  onDropoffChange,
  interactive = true,
  className = 'h-80 w-full rounded-3xl overflow-hidden shadow-inner',
  zoom = 13,
  selectedZoneId,
  selectedGovernorate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        // Restrict to Egypt geographic bounding box
        maxBounds: [
          [21.5, 24.5], // South-West Egypt
          [32.0, 37.0], // North-East Egypt
        ],
        maxBoundsViscosity: 0.8,
      }).setView([pickupLat, pickupLng], zoom);

      // Clean Voyager OSM / CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        minZoom: 6,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;

      // Handle interactive map clicks
      if (interactive) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onDropoffChange && pickupLat && !dropoffLat) {
            onDropoffChange(lat, lng, `موقع محدد في الإسكندرية (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          } else if (onPickupChange) {
            onPickupChange(lat, lng, `موقع محدد في الإسكندرية (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to selected operational zone if requested
  useEffect(() => {
    if (!selectedZoneId || !mapInstanceRef.current) return;
    const zone = HATLY_SERVICE_ZONES.find((z) => z.id === selectedZoneId);
    if (zone) {
      mapInstanceRef.current.flyTo([zone.centerLat, zone.centerLng], zone.zoom, {
        duration: 1.2,
      });
    }
  }, [selectedZoneId]);

  // SVG Marker Icons with Hatly Red & Navy Design
  const createPickupIcon = () =>
    L.divIcon({
      className: 'custom-pin-pickup',
      html: `
        <div style="background:#1B1464; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; box-shadow:0 6px 14px rgba(27,20,100,0.5); border:3px solid white; transform: translate(-50%, -50%);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [0, 0],
    });

  const createDropoffIcon = () =>
    L.divIcon({
      className: 'custom-pin-dropoff',
      html: `
        <div style="background:#E70209; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; box-shadow:0 6px 16px rgba(231,2,9,0.5); border:3px solid white; transform: translate(-50%, -100%);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [0, 0],
    });

  const createDriverIcon = () =>
    L.divIcon({
      className: 'custom-pin-driver',
      html: `
        <div style="background:#1B1464; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#E70209; box-shadow:0 8px 18px rgba(27,20,100,0.6); border:3px solid #E70209; transform: translate(-50%, -50%);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [0, 0],
    });

  // Synchronize Markers & Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Pickup
    if (pickupLat && pickupLng) {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickupLat, pickupLng], {
          icon: createPickupIcon(),
          draggable: interactive,
        }).addTo(map);

        if (interactive && onPickupChange) {
          pickupMarkerRef.current.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            onPickupChange(lat, lng, `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          });
        }
      } else {
        pickupMarkerRef.current.setLatLng([pickupLat, pickupLng]);
      }
    }

    // Dropoff
    if (dropoffLat && dropoffLng) {
      if (!dropoffMarkerRef.current) {
        dropoffMarkerRef.current = L.marker([dropoffLat, dropoffLng], {
          icon: createDropoffIcon(),
          draggable: interactive,
        }).addTo(map);

        if (interactive && onDropoffChange) {
          dropoffMarkerRef.current.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            onDropoffChange(lat, lng, `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          });
        }
      } else {
        dropoffMarkerRef.current.setLatLng([dropoffLat, dropoffLng]);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    // Driver Marker
    if (driverLat && driverLng) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker([driverLat, driverLng], {
          icon: createDriverIcon(),
        }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng([driverLat, driverLng]);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
      driverMarkerRef.current = null;
    }

    // Route Polyline
    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      const latlngs: L.LatLngExpression[] = [
        [pickupLat, pickupLng],
        [dropoffLat, dropoffLng],
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#E70209',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(latlngs);
      }

      // Auto fit bounds
      const bounds = L.latLngBounds([
        [pickupLat, pickupLng],
        [dropoffLat, dropoffLng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng]);

  return <div ref={mapContainerRef} className={className} />;
};
