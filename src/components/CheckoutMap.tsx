'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix missing marker icons in Next.js + Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface CheckoutMapProps {
  onLocationSelect: (lat: number, lng: number) => void
}

function LocationMarker({ onLocationSelect }: CheckoutMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    map.locate()
  }, [map])

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  )
}

export default function CheckoutMap({ onLocationSelect }: CheckoutMapProps) {
  return (
    <div className="w-full h-[200px] z-0 relative bg-[#111] border border-white/10">
      <MapContainer
        center={[-25.2637, -57.5759]} // Asunción, Paraguay por defecto
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
