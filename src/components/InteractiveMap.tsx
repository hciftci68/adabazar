import React, { useEffect, useRef, useState } from "react";

interface InteractiveMapProps {
  lat: number;
  lng: number;
  title: string;
  onDoubleClick?: () => void;
  onMapClick?: (lat: number, lng: number) => void;
  lang?: "tr" | "en";
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  title,
  onDoubleClick,
  onMapClick,
  lang = "tr",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Check if Leaflet is already loaded globally
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load CSS
    const linkId = "leaflet-cdn-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load JS
    const scriptId = "leaflet-cdn-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      // Script is already in the body but not loaded yet
      const interval = setInterval(() => {
        if ((window as any).L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Destroy existing map instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize map
    try {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        doubleClickZoom: false, // Disable default double click zoom so we can double click to open fullscreen
      }).setView([lat, lng], 15);

      mapRef.current = map;

      // Add a CartoDB Voyager light tile layer - bright, clear, and perfectly readable for listings
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(map);

      // Create a gorgeous divIcon custom pin that fits the layout
      const amberIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-amber-500/35 animate-ping"></span>
            <div class="w-5 h-5 rounded-full bg-amber-600 border-2 border-white flex items-center justify-center shadow-lg">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([lat, lng], { 
        icon: amberIcon,
        draggable: !!onMapClick 
      }).addTo(map);
      markerRef.current = marker;

      // Add standard premium popup
      marker.bindPopup(`<div style="color: #000; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 2px;">${title}</div>`).openPopup();

      if (onMapClick) {
        marker.on("dragend", (e: any) => {
          const position = marker.getLatLng();
          onMapClick(position.lat, position.lng);
        });
        map.on("click", (e: any) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Hook up double click event
      if (onDoubleClick) {
        map.on("dblclick", () => {
          onDoubleClick();
        });
      }

      // Handle resize dynamically to prevent tile loading glitches
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (err) {
      console.error("Error creating map:", err);
    }
  }, [leafletLoaded, lat, lng, title, onMapClick, onDoubleClick]);

  return (
    <div className="relative w-full h-full min-h-[inherit] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-sm">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 gap-3 border border-neutral-800 rounded-2xl z-20">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-500 font-mono">
            {lang === "tr" ? "Harita yükleniyor..." : "Loading map..."}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[inherit] rounded-2xl cursor-grab active:cursor-grabbing"
        style={{ background: "#ffffff" }}
      />
      
      {/* Informative double click tooltip */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-950/95 border border-neutral-800 text-[10px] text-zinc-300 font-mono px-3 py-1.5 rounded-xl shadow-md pointer-events-none select-none z-[1000] backdrop-blur-sm flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        {lang === "tr"
          ? "Çift Tıklama: Haritayı Tam Ekran Aç"
          : "Double Click: View Fullscreen Map"}
      </div>
    </div>
  );
};
