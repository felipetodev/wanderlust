import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { containerStyle } from '../lib/utils'
import { type Map, type Marker } from '../lib/types'

type Props = {
  mapCenter: Map
  markerPlaces: Marker[]
  children: React.ReactNode
}

function Maps ({ mapCenter, markerPlaces, children }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  })

  return (
    <div className="relative rounded-2xl overflow-hidden order-first sm:order-none">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lng: mapCenter.lng, lat: mapCenter.lat }}
          zoom={mapCenter.zoom}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: false,
            streetViewControl: false
          }}
        >
          {markerPlaces?.map((place, i) => (
            <MarkerF
              key={i}
              // label={place?.label ?? undefined}
              position={{ lng: place.lng, lat: place.lat }}
            />
          ))}
        </GoogleMap>
      )}
      {children}
    </div>
  )
}

export default Maps
