import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import { containerStyle } from '../lib/utils'
import { type Map, type Marker } from '../lib/types'

type Props = {
  mapCenter: Map
  markerPlaces: Marker[]
}

function Maps ({ mapCenter, markerPlaces }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  })

  return (
    <div className="rounded-2xl overflow-hidden order-first sm:order-none">
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lng: mapCenter.lng, lat: mapCenter.lat }}
          zoom={mapCenter.zoom}
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
    </div>
  )
}

export default Maps
